import { NextResponse } from "next/server"
import { getParentToken } from "@/lib/parent-auth"
import { prisma } from "@/lib/prisma"
import { getRankDisplayName } from "@/lib/rank-service"

export async function GET(req: Request) {
  const token = getParentToken(req)
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 })

  const child = await prisma.user.findUnique({
    where: { id: token.childId },
    select: {
      id: true, name: true, gradeLevel: true, avatar: true,
      currentRank: true, rankValue: true,
    },
  })

  if (!child) return NextResponse.json({ error: "学生不存在" }, { status: 404 })

  return NextResponse.json({
    id: child.id,
    name: child.name,
    gradeLevel: child.gradeLevel,
    avatar: child.avatar,
    currentRank: getRankDisplayName(child.rankValue),
    rankValue: child.rankValue,
  })
}
