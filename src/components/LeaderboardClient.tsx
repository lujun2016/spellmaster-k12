"use client"

import { useState } from "react"

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  currentRank: string
  gradeLevel: number | null
  totalRecords: number
}

export function LeaderboardClient({
  allBoard,
  gradeBoard,
  currentUserId,
}: {
  allBoard: LeaderboardEntry[]
  gradeBoard: LeaderboardEntry[]
  currentUserId: string
}) {
  const [tab, setTab] = useState<"all" | "grade">("all")
  const board = tab === "all" ? allBoard : gradeBoard

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">排行榜</h2>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab("all")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            tab === "all" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          总榜
        </button>
        <button
          onClick={() => setTab("grade")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            tab === "grade" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          年级榜
        </button>
      </div>

      {/* 榜单 */}
      {board.length === 0 ? (
        <div className="text-center py-20 text-gray-400">暂无数据</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* 表头 */}
          <div className="px-6 py-3 bg-gray-50 border-b flex items-center text-sm text-gray-500 font-medium">
            <span className="w-12">排名</span>
            <span className="flex-1">姓名</span>
            <span className="w-28 text-center">段位</span>
          </div>

          {board.map((entry) => {
            const isMe = entry.id === currentUserId
            const rankMedal =
              entry.rank === 1 ? "text-yellow-500" :
              entry.rank === 2 ? "text-gray-400" :
              entry.rank === 3 ? "text-orange-600" :
              "text-gray-500"

            return (
              <div
                key={entry.id}
                className={`px-6 py-3 flex items-center border-b last:border-0 ${
                  isMe ? "bg-blue-50" : ""
                }`}
              >
                <span className={`w-12 font-bold text-lg ${rankMedal}`}>
                  {entry.rank <= 3 ? (
                    <span className="text-xl">
                      {entry.rank === 1 ? "" : entry.rank === 2 ? "" : ""}
                    </span>
                  ) : null}
                  {entry.rank}
                </span>
                <span className="flex-1 font-medium text-gray-800">
                  {entry.name}
                  {isMe && <span className="text-xs text-blue-500 ml-2">(我)</span>}
                </span>
                <span className="w-28 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    entry.currentRank.includes("传奇") ? "bg-red-100 text-red-600" :
                    entry.currentRank.includes("王者") || entry.currentRank === "星耀" ? "bg-purple-100 text-purple-600" :
                    entry.currentRank === "钻石" ? "bg-blue-100 text-blue-600" :
                    entry.currentRank === "铂金" ? "bg-cyan-100 text-cyan-600" :
                    entry.currentRank === "黄金" ? "bg-yellow-100 text-yellow-600" :
                    entry.currentRank === "白银" ? "bg-gray-100 text-gray-600" :
                    "bg-orange-100 text-orange-600"
                  }`}>
                    {entry.currentRank}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
