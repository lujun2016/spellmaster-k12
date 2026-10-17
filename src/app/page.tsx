import { getSession } from "@/lib/auth-helpers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/LogoutButton"

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = session.user

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-gray-800">SpellMaster</h1>
            <div className="flex gap-4 text-sm">
              <Link href="/student/units" className="text-gray-600 hover:text-blue-600 transition">
                开始学习
              </Link>
              <Link href="/student/leaderboard" className="text-gray-600 hover:text-blue-600 transition">
                排行榜
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition">
                  管理后台
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user.name}
              {user.isAdmin && (
                <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  管理员
                </span>
              )}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {user.isAdmin ? "欢迎进入管理后台" : "欢迎回来，" + user.name}
          </h2>
          <p className="text-gray-500 mb-8">
            {user.isAdmin
              ? "您可以管理词库、学生、视频和查看榜单"
              : "选择教材开始今天的单词学习吧"}
          </p>
          <div className="flex gap-4 justify-center">
            {!user.isAdmin && (
              <Link
                href="/student/units"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                开始学习
              </Link>
            )}
            {user.isAdmin && (
              <Link
                href="/admin"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                进入后台
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
