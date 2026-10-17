import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"

export default async function StudentUnitsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const textbooks = await prisma.textbook.findMany({
    include: {
      grades: {
        orderBy: { level: "asc" },
        include: {
          units: {
            orderBy: { sortOrder: "asc" },
            include: {
              _count: { select: { words: true } },
              video: true,
            },
          },
        },
      },
    },
  })

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-gray-800">
              SpellMaster
            </Link>
            <Link href="/student/units" className="text-sm text-blue-600 font-medium">
              单元列表
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user.name}
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                {user.currentRank}
              </span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">选择教材</h2>

        {textbooks.map((tb) => (
          <div key={tb.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
              {tb.name}
            </h3>

            {tb.grades.map((grade) => (
              <div key={grade.id} className="mb-6">
                <h4 className="text-base font-medium text-gray-600 mb-3">
                  {grade.name}
                </h4>

                <div className="grid gap-3">
                  {grade.units.map((unit) => (
                    <Link
                      key={unit.id}
                      href={`/student/units/${unit.id}`}
                      className="block bg-white rounded-lg border p-4 hover:shadow-md hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {unit.name}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {unit._count.words} 个单词
                            {unit.video && unit.video.status === "ready"
                              ? " · 有视频"
                              : " · 视频待上传"}
                          </div>
                        </div>
                        <div className="text-blue-500 text-sm font-medium">
                          进入 &rarr;
                        </div>
                      </div>
                    </Link>
                  ))}

                  {grade.units.length === 0 && (
                    <p className="text-gray-400 text-sm py-4">暂无单元</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {textbooks.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">暂无教材数据</p>
            <p className="text-sm mt-2">请联系管理员添加教材和词库</p>
          </div>
        )}
      </main>
    </div>
  )
}
