import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UnitLearningFlow } from "@/components/UnitLearningFlow"

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ unitId: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { unitId } = await params

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      words: { orderBy: { sortOrder: "asc" } },
      video: true,
      grade: { include: { textbook: true } },
    },
  })

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500">单元不存在</p>
          <a href="/student/units" className="text-blue-500 mt-4 inline-block">返回</a>
        </div>
      </div>
    )
  }

  // 检查是否已有全对记录
  const existingRecords = await prisma.lessonRecord.findMany({
    where: { userId: user.id, unitId: unit.id, isPerfect: true },
    orderBy: { completedAt: "desc" },
  })
  const alreadyWatched = existingRecords.length > 0
  const isUnitCompleted = existingRecords.length > 0

  // 检查本单元是否有已完成（全对）的挑战
  const completedChallenge = await prisma.unitChallenge.findFirst({
    where: { userId: user.id, unitId: unit.id, isPerfect: true },
  })
  const hasCompletedChallenge = !!completedChallenge

  return (
    <UnitLearningFlow
      unit={{
        id: unit.id,
        name: unit.name,
        gradeName: unit.grade.name,
        textbookName: unit.grade.textbook.name,
      }}
      words={unit.words.map((w) => ({
        id: w.id,
        en: w.en,
        zh: w.zh,
        phonetic: w.phonetic,
      }))}
      hasVideo={unit.video?.status === "ready"}
      alreadyWatched={alreadyWatched}
      isUnitCompleted={isUnitCompleted}
      hasCompletedChallenge={hasCompletedChallenge}
      userId={user.id}
    />
  )
}
