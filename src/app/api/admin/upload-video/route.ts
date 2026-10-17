import { getCurrentUser } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const unitId = formData.get("unitId") as string | null

    if (!file || !unitId) {
      return NextResponse.json({ error: "缺少文件或 unitId" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4"
    if (!["mp4", "webm", "mov", "avi"].includes(ext)) {
      return NextResponse.json({ error: "仅支持 MP4/WebM/MOV/AVI 格式" }, { status: 400 })
    }

    const filename = `${unitId}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const videoUrl = `/uploads/videos/${filename}?t=${Date.now()}`

    // upsert Video 记录
    await prisma.video.upsert({
      where: { unitId },
      update: { fileKey: videoUrl, status: "ready" },
      create: { unitId, fileKey: videoUrl, status: "ready" },
    })

    // 更新 unit 的 updatedAt
    await prisma.unit.update({ where: { id: unitId }, data: {} })

    return NextResponse.json({
      success: true,
      videoUrl,
      filename,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
