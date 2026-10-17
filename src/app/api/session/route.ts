import { getCurrentUser } from "@/lib/auth-helpers"
import { createSession, endSession } from "@/lib/session-service"
import { NextResponse } from "next/server"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const session = await createSession(user.id)
  return NextResponse.json({ sessionId: session.id })
}

export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 })

  await endSession(user.id)
  return NextResponse.json({ success: true })
}
