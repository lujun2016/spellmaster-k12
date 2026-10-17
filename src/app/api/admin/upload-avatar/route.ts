import { getCurrentUser } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const studentId = formData.get("studentId") as string | null

    if (!file || !studentId) {
      return NextResponse.json({ error: "缺少文件或 studentId" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const allowed = ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm"]
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: `不支持的文件格式: .${ext}` }, { status: 400 })
    }

    const filename = `${studentId}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const avatarUrl = `/uploads/avatars/${filename}?t=${Date.now()}`

    return NextResponse.json({ success: true, avatarUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export const config = {
  api: { bodyParser: false },
}
