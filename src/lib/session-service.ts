import { prisma } from "@/lib/prisma"

export type SessionState = "idle" | "learning" | "challenging" | "offline"

/** 学生登录时创建新会话，旧的活跃会话自动结束 */
export async function createSession(userId: string) {
  // 结束旧活跃会话
  await prisma.learningSession.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  })

  return prisma.learningSession.create({
    data: { userId, isActive: true },
  })
}

/** 获取当前活跃会话 */
export async function getActiveSession(userId: string) {
  return prisma.learningSession.findFirst({
    where: { userId, isActive: true },
  })
}

/** 更新会话状态（进入单元/开始挑战） */
export async function updateSessionState(userId: string, state: SessionState) {
  const session = await getActiveSession(userId)
  if (!session) return null
  return prisma.learningSession.update({
    where: { id: session.id },
    data: { wordsPracticed: state === "learning" ? { increment: 0 } : undefined },
  })
}

/** 学生退出时结束会话并写入汇总 */
export async function endSession(userId: string) {
  const session = await getActiveSession(userId)
  if (!session) return null

  // 统计本次拼写记录
  const attempts = await prisma.spellingAttempt.findMany({
    where: {
      userId,
      createdAt: { gte: session.startedAt },
    },
    include: { word: true },
  })

  const wrongWords = attempts
    .filter((a) => !a.isCorrect)
    .map((a) => ({
      en: a.word.en,
      zh: a.word.zh,
      phonetic: a.word.phonetic,
      userInput: a.userInput,
    }))

  // 去重错词
  const uniqueWrong = wrongWords.filter(
    (w, i, arr) => arr.findIndex((x) => x.en === w.en) === i
  )

  // 挑战
  const challenge = await prisma.unitChallenge.findFirst({
    where: { userId, createdAt: { gte: session.startedAt } },
    orderBy: { createdAt: "desc" },
  })

  const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0)

  return prisma.learningSession.update({
    where: { id: session.id },
    data: {
      isActive: false,
      endedAt: new Date(),
      wordsPracticed: attempts.length,
      wordsWrong: uniqueWrong.length > 0 ? uniqueWrong : undefined,
      challengeCompleted: !!challenge?.isPerfect,
      challengeResult: challenge
        ? {
            correctRate: challenge.totalQuestions > 0
              ? Math.round((challenge.correctCount / challenge.totalQuestions) * 100)
              : 0,
            totalQuestions: challenge.totalQuestions,
            correctCount: challenge.correctCount,
          }
        : undefined,
      totalTimeSpent: totalTime,
    },
  })
}

/** 获取最新已结束的会话汇总 */
export async function getLatestSummary(userId: string) {
  return prisma.learningSession.findFirst({
    where: { userId, isActive: false, endedAt: { not: null } },
    orderBy: { endedAt: "desc" },
  })
}

/** 获取历史会话汇总 */
export async function getPreviousSummaries(userId: string, take = 20) {
  return prisma.learningSession.findMany({
    where: { userId, isActive: false, endedAt: { not: null } },
    orderBy: { endedAt: "desc" },
    take,
  })
}
