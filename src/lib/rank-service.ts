import { prisma } from "@/lib/prisma"
import { Rank } from "@prisma/client"

export const RANK_NAMES: Record<number, string> = {
  1: "青铜", 2: "白银", 3: "黄金", 4: "铂金", 5: "钻石",
  6: "星耀", 7: "王者", 8: "无双王者", 9: "荣耀王者", 10: "传奇王者",
}

export function getRankDisplayName(rankValue: number): string {
  if (rankValue <= 10) return RANK_NAMES[rankValue] || "未知"
  const starLevel = (rankValue - 10) * 20
  return `传奇${starLevel}星`
}

export function getRankEnum(rankValue: number): Rank {
  const map: Record<number, Rank> = {
    1: "BRONZE", 2: "SILVER", 3: "GOLD", 4: "PLATINUM", 5: "DIAMOND",
    6: "STAR", 7: "KING", 8: "SUPREME_KING", 9: "GLORY_KING", 10: "LEGEND_KING",
  }
  if (rankValue <= 10) return map[rankValue]
  if (rankValue === 11) return "LEGEND_20_STAR"
  if (rankValue === 12) return "LEGEND_40_STAR"
  return "LEGEND_40_STAR" // 超出范围的兜底
}

const PRACTICE_RANK_CAP = 5 // 钻石=5，单课最高

/**
 * 单课全对 → 升级段位 (青铜→钻石)
 * 返回是否升级及新段位
 */
export async function tryUpgradeFromLesson(
  userId: string,
  unitId: string
): Promise<{ upgraded: boolean; newRankValue: number; newRank: string } | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.rankValue >= PRACTICE_RANK_CAP) return null

  const newValue = user.rankValue + 1
  const newRank = getRankEnum(newValue)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { currentRank: newRank, rankValue: newValue },
    }),
    prisma.rankHistory.create({
      data: {
        userId,
        fromRank: user.currentRank,
        toRank: newRank,
        fromValue: user.rankValue,
        toValue: newValue,
        reason: "lesson_perfect",
        unitId,
      },
    }),
  ])

  return { upgraded: true, newRankValue: newValue, newRank: getRankDisplayName(newValue) }
}

/**
 * 单元挑战全对 → 升级段位 (星耀→传奇王者→...)
 */
export async function tryUpgradeFromChallenge(
  userId: string,
  unitId: string
): Promise<{ upgraded: boolean; newRankValue: number; newRank: string } | null> {
  // 统计已完成(全对)的单元挑战数
  const completedChallenges = await prisma.unitChallenge.count({
    where: { userId, isPerfect: true },
  })

  // 第1个完成→星耀(6), 第2→王者(7), ...
  const newValue = 5 + completedChallenges // 5是钻石，第1个+1=6星耀
  const newRank = getRankEnum(newValue)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { currentRank: newRank, rankValue: newValue },
    }),
    prisma.rankHistory.create({
      data: {
        userId,
        fromRank: user.currentRank,
        toRank: newRank,
        fromValue: user.rankValue,
        toValue: newValue,
        reason: "unit_challenge_perfect",
        unitId,
      },
    }),
  ])

  return { upgraded: true, newRankValue: newValue, newRank: getRankDisplayName(newValue) }
}

/**
 * 检查学生对某单元是否所有课节都已全对
 */
export async function isUnitFullyCompleted(userId: string, unitId: string): Promise<boolean> {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { words: true },
  })
  if (!unit || unit.words.length === 0) return false

  const perfectRecord = await prisma.lessonRecord.findFirst({
    where: { userId, unitId, isPerfect: true },
    orderBy: { completedAt: "desc" },
  })

  return !!perfectRecord
}

/**
 * 获取该单元该学生的所有错词ID (去重)
 */
export async function getWrongWordIds(userId: string, unitId: string): Promise<string[]> {
  const attempts = await prisma.spellingAttempt.findMany({
    where: { userId, unitId, isCorrect: false, attemptType: "PRACTICE" },
    select: { wordId: true },
    distinct: ["wordId"],
  })
  return attempts.map((a) => a.wordId)
}

/**
 * 获取其他账号在该单元的错词ID (去重，可限定数量)
 */
export async function getOtherStudentsWrongWordIds(
  userId: string,
  unitId: string,
  excludeIds: string[],
  limit: number
): Promise<string[]> {
  const attempts = await prisma.spellingAttempt.findMany({
    where: {
      unitId,
      isCorrect: false,
      attemptType: "PRACTICE",
      userId: { not: userId },
      wordId: { notIn: excludeIds },
    },
    select: { wordId: true },
    distinct: ["wordId"],
    take: limit,
  })
  return attempts.map((a) => a.wordId)
}

/**
 * 生成单元挑战的题目 (最多25题)
 */
export async function generateChallengeQuestions(
  userId: string,
  unitId: string
): Promise<string[]> {
  const TARGET = 25
  const myWrongIds = await getWrongWordIds(userId, unitId)

  // 1. 本账号错词
  const selected = [...myWrongIds]

  // 2. 其他账号错词
  if (selected.length < TARGET) {
    const otherWrong = await getOtherStudentsWrongWordIds(
      userId, unitId, selected, TARGET - selected.length
    )
    selected.push(...otherWrong)
  }

  // 3. 本单元随机抽取补足
  if (selected.length < TARGET) {
    const unitWords = await prisma.word.findMany({
      where: { unitId, id: { notIn: selected } },
      select: { id: true },
      orderBy: { sortOrder: "asc" },
      take: TARGET - selected.length,
    })
    selected.push(...unitWords.map((w) => w.id))
  }

  return selected.slice(0, TARGET)
}

/**
 * 获取榜单 (总榜或年级榜)
 */
export async function getLeaderboard(
  scope: "all" | "grade",
  gradeLevel?: number
) {
  const where = scope === "grade" && gradeLevel != null
    ? { isAdmin: false, gradeLevel }
    : { isAdmin: false }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      currentRank: true,
      rankValue: true,
      gradeLevel: true,
      _count: { select: {
        lessonRecords: true,
        unitChallenges: true,
      }},
    },
    orderBy: [
      { rankValue: "desc" },
      { createdAt: "asc" },
    ],
    take: 100,
  })

  return users.map((user, index) => ({
    rank: index + 1,
    id: user.id,
    name: user.name,
    currentRank: getRankDisplayName(user.rankValue),
    gradeLevel: user.gradeLevel,
    totalRecords: user._count.lessonRecords + user._count.unitChallenges,
  }))
}
