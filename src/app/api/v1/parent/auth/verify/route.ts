import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyCode } from "@/lib/verification-codes"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "parent-jwt-secret-dev"

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json()
    if (!phone || !code) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 })
    }

    if (!verifyCode(phone, code)) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 401 })
    }

    const student = await prisma.user.findFirst({
      where: { parentPhone: phone, isAdmin: false },
      select: {
        id: true, name: true, gradeLevel: true, currentRank: true,
        rankValue: true, avatar: true, notes: true,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "未找到关联学生" }, { status: 404 })
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
