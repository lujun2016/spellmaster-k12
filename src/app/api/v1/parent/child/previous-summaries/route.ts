import { NextResponse } from "next/server"
import { getParentToken } from "@/lib/parent-auth"
import { getPreviousSummaries } from "@/lib/session-service"

export async function GET(req: Request) {
  const token = getParentToken(req)
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const take = parseInt(searchParams.get("limit") || "20")

  const summaries = await getPreviousSummaries(token.childId, take)

  return NextResponse.json({
    summaries: summaries.map((s) => ({
      id: s.id,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString() || null,
      wordsPracticed: s.wordsPracticed,
      challengeCompleted: s.challengeCompleted,
      totalTimeSpent: s.totalTimeSpent,
    })),
  })
}
