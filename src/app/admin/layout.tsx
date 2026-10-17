import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) redirect("/login")

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside className="w-56 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-700">
          <Link href="/admin" className="text-lg font-bold">SpellMaster</Link>
          <p className="text-xs text-gray-400 mt-1">管理后台</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">概览</Link>
          <Link href="/admin/words" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">词库管理</Link>
          <Link href="/admin/students" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">学生管理</Link>
          <Link href="/student/leaderboard" className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">查看榜单</Link>
        </nav>
        <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">{user.name}</span>
          <LogoutButton />
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 bg-gray-50 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
