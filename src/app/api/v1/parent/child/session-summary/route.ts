import { NextResponse } from "next/server"
import { getParentToken } from "@/lib/parent-auth"
import { getLatestSummary } from "@/lib/session-service"

export async function GET(req: Request) {
  const token = getParentToken(req)
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 })

  const summary = await getLatestSummary(token.childId)

  if (!summary || !summary.endedAt) {
    return NextResponse.json({ sessionId: null, message: "暂无新数据" })
  }

  return NextResponse.json({
    sessionId: summary.id,
    startedAt: summary.startedAt.toISOString(),
    endedAt: summary.endedAt.toISOString(),
    wordsPracticed: summary.wordsPracticed,
    wordsWrong: summary.wordsWrong,
    challengeCompleted: summary.challengeCompleted,
    challengeResult: summary.challengeResult,
    totalTimeSpent: summary.totalTimeSpent,
  })
}
