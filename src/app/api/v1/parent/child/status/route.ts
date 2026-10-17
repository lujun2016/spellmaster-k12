import { NextResponse } from "next/server"
import { getParentToken } from "@/lib/parent-auth"
import { getActiveSession } from "@/lib/session-service"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const token = getParentToken(req)
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 })

  const session = await getActiveSession(token.childId)

  if (!session) {
    // 检查是否有未读的最新已结束会话
    const lastSummary = await prisma.learningSession.findFirst({
      where: { userId: token.childId, isActive: false, endedAt: { not: null } },
      orderBy: { endedAt: "desc" },
    })

    return NextResponse.json({
      isOnline: false,
      state: "offline",
      currentUnit: null,
      hasNewSummary: !!lastSummary && lastSummary.endedAt !== null,
    })
  }

  // isActive → 在线，状态简单判断：看最近15分钟是否有挑战活动
  const recentChallenge = await prisma.unitChallenge.findFirst({
    where: { userId: token.childId, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } },
  })

  const state = recentChallenge ? "challenging" :
    session.wordsPracticed > 0 ? "learning" : "idle"

  return NextResponse.json({
    isOnline: true,
    state,
    currentUnit: null,
    lastUpdate: session.startedAt.toISOString(),
  })
}
