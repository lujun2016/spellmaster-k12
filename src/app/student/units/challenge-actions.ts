"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import {
  generateChallengeQuestions,
  tryUpgradeFromLesson,
  tryUpgradeFromChallenge,
  isUnitFullyCompleted,
} from "@/lib/rank-service"

export async function startChallenge(unitId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("未登录")

  // 检查是否已完成本单元所有练习
  const isCompleted = await isUnitFullyCompleted(user.id, unitId)
  if (!isCompleted) throw new Error("请先完成本单元的所有拼写练习")

  const wordIds = await generateChallengeQuestions(user.id, unitId)
  const words = await prisma.word.findMany({
    where: { id: { in: wordIds } },
    select: { id: true, en: true, zh: true, phonetic: true },
  })

  // 按 wordIds 顺序排列
  const wordMap = new Map(words.map((w) => [w.id, w]))
  const ordered = wordIds.map((id) => wordMap.get(id)).filter(Boolean)

  return {
    challengeId: `${user.id}-${unitId}-${Date.now()}`,
    questions: ordered as { id: string; en: string; zh: string; phonetic: string }[],
    totalCount: ordered.length,
  }
}

export async function completeChallenge(
  unitId: string,
  results: {
    wordId: string
    userInput: string
    isCorrect: boolean
    timeSpent: number
  }[]
) {
  const user = await getCurrentUser()
  if (!user) throw new Error("未登录")

  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0)
  const correctCount = results.filter((r) => r.isCorrect).length
  const isPerfect = correctCount === results.length

  // 获取单词详情用于存储
  const wordIds = results.map((r) => r.wordId)
  const words = await prisma.word.findMany({
    where: { id: { in: wordIds } },
    select: { id: true, en: true, zh: true, phonetic: true },
  })
  const wordMap = new Map(words.map((w) => [w.id, w]))

  // 保存 SpellingAttempts
  for (const r of results) {
    await prisma.spellingAttempt.create({
      data: {
        userId: user.id,
        wordId: r.wordId,
        unitId,
        attemptType: "CHALLENGE",
        userInput: r.userInput,
        isCorrect: r.isCorrect,
        timeSpent: r.timeSpent,
      },
    })
  }

  // 统计历史挑战次数
  const pastChallenges = await prisma.unitChallenge.count({
    where: { userId: user.id, unitId },
  })

  // 保存 UnitChallenge 记录
  const questionWordsData = results.map((r) => {
    const w = wordMap.get(r.wordId)
    return {
      wordId: r.wordId,
      en: w?.en || "",
      zh: w?.zh || "",
      phonetic: w?.phonetic || "",
      userInput: r.userInput,
      isCorrect: r.isCorrect,
    }
  })

  await prisma.unitChallenge.create({
    data: {
      userId: user.id,
      unitId,
      attemptNum: pastChallenges + 1,
      totalQuestions: results.length,
      correctCount,
      isPerfect,
      timeSpent: totalTime,
      rankAwarded: isPerfect ? "STAR" : undefined, // 临时值，会被 tryUpgrade 覆盖
      questionWords: questionWordsData,
    },
  })

  // 全对 → 升级段位
  let rankResult = null
  if (isPerfect) {
    rankResult = await tryUpgradeFromChallenge(user.id, unitId)
  }

  return {
    correctRate: Math.round((correctCount / results.length) * 100),
    totalQuestions: results.length,
    correctCount,
    isPerfect,
    rankResult,
  }
}

export async function handleLessonPerfect(userId: string, unitId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("未登录")
  if (user.id !== userId) throw new Error("无权操作")

  return tryUpgradeFromLesson(userId, unitId)
}
