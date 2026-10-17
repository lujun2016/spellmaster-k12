import { NextResponse } from "next/server"
import { getParentToken } from "@/lib/parent-auth"
import { getActiveSession } from "@/lib/session-service"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const token = getParentToken(req)
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 })

  const session = await getActiveSession(token.childId)

  if (!session) {
    return NextResponse.json({
      animationType: "exercising",
      metadata: { hasNewSummary: true },
    })
  }

  // 最近15分钟是否有挑战
  const recentChallenge = await prisma.unitChallenge.findFirst({
    where: { userId: token.childId, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } },
  })

  let animationType: string
  if (recentChallenge) {
    animationType = "challenging"
  } else if (session.wordsPracticed > 0) {
    animationType = "learning"
  } else {
    animationType = "idle"
  }

  return NextResponse.json({
    animationType,
    metadata: {},
  })
}
