import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "parent-jwt-secret-dev"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const phone = body.mockPhone || body.phone

    if (!phone || !/^\d{11}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 })
    }

    const student = await prisma.user.findFirst({
      where: { parentPhone: phone, isAdmin: false },
      select: {
        id: true, name: true, gradeLevel: true, currentRank: true,
        rankValue: true, avatar: true,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "未找到与此手机号关联的学生" }, { status: 404 })
    }

    const token = jwt.sign(
      { phone, childId: student.id, type: "parent" },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      token,
      child: {
        id: student.id,
        name: student.name,
        gradeLevel: student.gradeLevel,
        currentRank: student.currentRank,
        rankValue: student.rankValue,
        avatar: student.avatar,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
