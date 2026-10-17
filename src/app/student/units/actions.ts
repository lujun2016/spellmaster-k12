"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"

interface SaveLessonRecordInput {
  userId: string
  unitId: string
  totalWords: number
  correctCount: number
  timeSpent: number
  isPerfect: boolean
  wrongWordIds: string[]
  attemptCount: number
}

export async function saveLessonRecord(input: SaveLessonRecordInput) {
  const user = await getCurrentUser()
  if (!user) throw new Error("未登录")
  if (user.id !== input.userId && !user.isAdmin) throw new Error("无权操作")

  // 服务端计算 attemptCount，避免客户端重传导致唯一约束冲突
  const existingCount = await prisma.lessonRecord.count({
    where: { userId: input.userId, unitId: input.unitId },
  })
  const attemptCount = existingCount + 1

  const record = await prisma.lessonRecord.create({
    data: {
      userId: input.userId,
      unitId: input.unitId,
      totalWords: input.totalWords,
      correctCount: input.correctCount,
      timeSpent: input.timeSpent,
      isPerfect: input.isPerfect,
      attemptCount,
    },
  })

  return { success: true, recordId: record.id }
}

export async function saveSpellingAttempts(
  attempts: {
    userId: string
    wordId: string
    unitId: string
    userInput: string
    isCorrect: boolean
    timeSpent: number
  }[]
) {
  const user = await getCurrentUser()
  if (!user) throw new Error("未登录")

  for (const a of attempts) {
    await prisma.spellingAttempt.create({
      data: {
        userId: a.userId,
        wordId: a.wordId,
        unitId: a.unitId,
        attemptType: "PRACTICE",
        userInput: a.userInput,
        isCorrect: a.isCorrect,
        timeSpent: a.timeSpent,
      },
    })
  }

  return { success: true, count: attempts.length }
}
