import { getCurrentUser } from "@/lib/auth-helpers"
import { getLeaderboard } from "@/lib/rank-service"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"
import { LeaderboardClient } from "@/components/LeaderboardClient"

export default async function LeaderboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const allBoard = await getLeaderboard("all")
  const gradeBoard = user.gradeLevel ? await getLeaderboard("grade", user.gradeLevel) : allBoard

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-gray-800">SpellMaster</Link>
            <Link href="/student/units" className="text-sm text-gray-600 hover:text-blue-600">单元列表</Link>
            <Link href="/student/leaderboard" className="text-sm text-blue-600 font-medium">榜单</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <LeaderboardClient
          allBoard={allBoard}
          gradeBoard={gradeBoard}
          currentUserId={user.id}
        />
      </main>
    </div>
  )
}
