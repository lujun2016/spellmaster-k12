"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-helpers"
import { Rank } from "@prisma/client"
import { getRankEnum, getRankDisplayName } from "@/lib/rank-service"

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) throw new Error("需要管理员权限")
  return user
}

// ─── 教材 ───

export async function getTextbooks() {
  await requireAdmin()
  return prisma.textbook.findMany({
    include: {
      grades: {
        orderBy: { level: "asc" },
        include: {
          units: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { words: true } }, video: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  }) as any
}

export async function createTextbook(name: string) {
  await requireAdmin()
  return prisma.textbook.create({ data: { name } })
}

export async function deleteTextbook(id: string) {
  await requireAdmin()
  return prisma.textbook.delete({ where: { id } })
}

// ─── 年级 ───

export async function createGrade(textbookId: string, name: string, level: number) {
  await requireAdmin()
  return prisma.grade.create({ data: { textbookId, name, level } })
}

export async function deleteGrade(id: string) {
  await requireAdmin()
  return prisma.grade.delete({ where: { id } })
}

// ─── 单元 ───

export async function createUnit(gradeId: string, name: string, sortOrder: number) {
  await requireAdmin()
  return prisma.unit.create({ data: { gradeId, name, sortOrder } })
}

export async function deleteUnit(id: string) {
  await requireAdmin()
  return prisma.unit.delete({ where: { id } })
}

// ─── 单词 ───

export async function getUnitWords(unitId: string) {
  await requireAdmin()
  return prisma.word.findMany({
    where: { unitId },
    orderBy: { sortOrder: "asc" },
  })
}

export async function createWord(unitId: string, en: string, zh: string, phonetic: string) {
  await requireAdmin()
  const maxSort = await prisma.word.findFirst({
    where: { unitId },
    orderBy: { sortOrder: "desc" },
  })
  return prisma.word.create({
    data: { unitId, en, zh, phonetic, sortOrder: (maxSort?.sortOrder ?? 0) + 1 },
  })
}

export async function updateWord(id: string, data: { en?: string; zh?: string; phonetic?: string }) {
  await requireAdmin()
  return prisma.word.update({ where: { id }, data })
}

export async function deleteWord(id: string) {
  await requireAdmin()
  return prisma.word.delete({ where: { id } })
}

export async function batchImportWords(unitId: string, lines: string) {
  await requireAdmin()
  const words = lines.trim().split("\n").filter(Boolean).map((line) => {
    const [en, zh, phonetic] = line.split("\t").map((s) => s.trim())
    return { en: en || "", zh: zh || "", phonetic: phonetic || "" }
  })

  let maxSort = (await prisma.word.findFirst({ where: { unitId }, orderBy: { sortOrder: "desc" } }))?.sortOrder ?? 0

  let count = 0
  for (const w of words) {
    if (!w.en) continue
    maxSort++
    await prisma.word.create({
      data: { unitId, en: w.en, zh: w.zh, phonetic: w.phonetic, sortOrder: maxSort },
    })
    count++
  }

  return { count }
}

// ─── 学生管理 ───

export async function getStudents() {
  await requireAdmin()
  return prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true, username: true, name: true, currentRank: true, rankValue: true,
      gradeLevel: true, parentPhone: true, notes: true, avatar: true, createdAt: true,
      _count: { select: { lessonRecords: true, unitChallenges: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createStudent(data: {
  username: string; name: string; password: string
  gradeLevel?: number; parentPhone?: string; notes?: string; avatar?: string
}) {
  await requireAdmin()
  const bcrypt = await import("bcryptjs")
  const passwordHash = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      passwordHash,
      gradeLevel: data.gradeLevel ?? null,
      parentPhone: data.parentPhone ?? null,
      notes: data.notes ?? null,
      avatar: data.avatar ?? "boy1",
      isAdmin: false,
    },
  })
}

export async function deleteStudent(userId: string) {
  await requireAdmin()
  await prisma.user.delete({ where: { id: userId } })
  return { success: true }
}

export async function updateStudentRank(userId: string, newRankValue: number) {
  await requireAdmin()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("用户不存在")

  const newRank = getRankEnum(newRankValue)

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { currentRank: newRank, rankValue: newRankValue } }),
    prisma.rankHistory.create({
      data: {
        userId,
        fromRank: user.currentRank,
        toRank: newRank,
        fromValue: user.rankValue,
        toValue: newRankValue,
        reason: "manual_adjust",
      },
    }),
  ])

  return { success: true, newRank: getRankDisplayName(newRankValue) }
}

export async function updateStudentInfo(userId: string, data: {
  name?: string; gradeLevel?: number; parentPhone?: string
  notes?: string; avatar?: string
}) {
  await requireAdmin()
  return prisma.user.update({ where: { id: userId }, data })
}

// ─── 统计 ───

export async function getAdminStats() {
  await requireAdmin()
  const [studentCount, unitCount, wordCount, totalRecords] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.unit.count(),
    prisma.word.count(),
    prisma.lessonRecord.count(),
  ])
  return { studentCount, unitCount, wordCount, totalRecords }
}

// ─── 重新计算段位 ───

export async function recalculateAllRanks() {
  await requireAdmin()

  const students = await prisma.user.findMany({
    where: { isAdmin: false },
    select: { id: true },
  })

  let updated = 0
  for (const student of students) {
    // 统计全对的练习记录数 (按完成时间排序的唯一单元)
    const perfectLessons = await prisma.lessonRecord.findMany({
      where: { userId: student.id, isPerfect: true },
      orderBy: { completedAt: "asc" },
      distinct: ["unitId"],
    })

    // 统计全对的挑战数
    const perfectChallenges = await prisma.unitChallenge.count({
      where: { userId: student.id, isPerfect: true },
    })

    // 练习最多到钻石(5)，挑战从星耀(6)开始
    const lessonRank = Math.min(perfectLessons.length, 5)
    const challengeRank = perfectChallenges
    const newValue = lessonRank + challengeRank

    // 至少青铜(1)
    const finalValue = Math.max(1, newValue)

    const current = await prisma.user.findUnique({ where: { id: student.id } })
    if (current && current.rankValue !== finalValue) {
      const newRank = getRankEnum(finalValue)
      await prisma.user.update({
        where: { id: student.id },
        data: { currentRank: newRank, rankValue: finalValue },
      })
      updated++
    }
  }

  return { total: students.length, updated }
}

// ─── 学生练习记录 ───

export async function getStudentPracticeHistory(userId: string) {
  await requireAdmin()

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true },
  })
  if (!student) throw new Error("学生不存在")

  // 拼写记录（练习+挑战），按时间倒序
  const attempts = await prisma.spellingAttempt.findMany({
    where: { userId },
    include: { word: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  // 按单元分组的练习记录
  const lessonRecords = await prisma.lessonRecord.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    include: { unit: { select: { id: true, name: true } } },
    take: 50,
  })

  // 挑战记录
  const challenges = await prisma.unitChallenge.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  // 最近错词
  const recentWrong = attempts
    .filter((a) => !a.isCorrect)
    .slice(0, 30)

  return {
    student,
    attempts: attempts.map((a) => ({
      id: a.id,
      en: a.word.en,
      zh: a.word.zh,
      phonetic: a.word.phonetic,
      userInput: a.userInput,
      isCorrect: a.isCorrect,
      type: a.attemptType,
      timeSpent: a.timeSpent,
      createdAt: a.createdAt.toISOString(),
    })),
    lessonRecords: lessonRecords.map((r) => ({
      id: r.id,
      unitName: r.unit.name,
      totalWords: r.totalWords,
      correctCount: r.correctCount,
      isPerfect: r.isPerfect,
      attemptCount: r.attemptCount,
      timeSpent: r.timeSpent,
      completedAt: r.completedAt.toISOString(),
    })),
    challenges: challenges.map((c) => ({
      id: c.id,
      totalQuestions: c.totalQuestions,
      correctCount: c.correctCount,
      isPerfect: c.isPerfect,
      attemptNum: c.attemptNum,
      timeSpent: c.timeSpent,
      createdAt: c.createdAt.toISOString(),
    })),
    recentWrong: recentWrong.map((a) => ({
      en: a.word.en,
      zh: a.word.zh,
      phonetic: a.word.phonetic,
      userInput: a.userInput,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function exportStudentDataCsv(userId: string, dateStart: string, dateEnd: string) {
  await requireAdmin()

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })
  if (!student) throw new Error("学生不存在")

  const start = new Date(dateStart)
  start.setHours(0, 0, 0, 0)
  const end = new Date(dateEnd)
  end.setHours(23, 59, 59, 999)

  const attempts = await prisma.spellingAttempt.findMany({
    where: {
      userId,
      createdAt: { gte: start, lte: end },
    },
    include: { word: true },
    orderBy: { createdAt: "asc" },
  })

  // 生成 CSV
  const BOM = "﻿" // UTF-8 BOM for Excel
  const header = "序号,学生姓名,英文,中文,音标,学生输入,是否正确,类型,耗时(秒),时间"
  const rows = attempts.map((a, i) => {
    const safe = (s: string) => `"${(s || "").replace(/"/g, '""')}"`
    return [
      i + 1,
      safe(student.name),
      safe(a.word.en),
      safe(a.word.zh),
      safe(a.word.phonetic),
      safe(a.userInput),
      a.isCorrect ? "正确" : "错误",
      a.attemptType === "PRACTICE" ? "练习" : "挑战",
      a.timeSpent,
      new Date(a.createdAt).toLocaleString("zh-CN"),
    ].join(",")
  })

  return {
    filename: `${student.name}_练习记录_${dateStart}_${dateEnd}.csv`,
    csv: BOM + [header, ...rows].join("\n"),
    total: attempts.length,
    wrongCount: attempts.filter((a) => !a.isCorrect).length,
  }
}
