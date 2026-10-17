import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { storeCode } from "@/lib/verification-codes"
import { appendFileSync } from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone || !/^\d{11}$/.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 })
    }

    // 检查是否有学生绑定了此手机
    const student = await prisma.user.findFirst({
      where: { parentPhone: phone, isAdmin: false },
    })
    if (!student) {
      return NextResponse.json({ error: "未找到与此手机号关联的学生" }, { status: 404 })
    }

    // 生成6位验证码（开发环境打印到控制台）
    const code = String(Math.floor(100000 + Math.random() * 900000))
    storeCode(phone, code)

    console.log(`[验证码] 手机 ${phone}: ${code}`)

    // 开发环境：额外把验证码追加写入本地文件，方便从小程序侧（微信开发者工具）查看，无需一直盯着后端终端
    if (process.env.NODE_ENV !== "production") {
      try {
        const line = `${new Date().toISOString()} 手机 ${phone}: ${code}\n`
        appendFileSync(path.join(process.cwd(), ".dev-verification-code.log"), line)
      } catch {
        // 文件写入失败不影响登录流程
      }
    }

    return NextResponse.json({ success: true, expiresIn: 300 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
