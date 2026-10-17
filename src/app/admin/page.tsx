import { getAdminStats, recalculateAllRanks } from "@/app/admin/actions"
import { RecalculateButton } from "@/components/RecalculateButton"

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">管理概览</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="学生数" value={stats.studentCount} color="blue" />
        <StatCard label="单元数" value={stats.unitCount} color="green" />
        <StatCard label="单词数" value={stats.wordCount} color="purple" />
        <StatCard label="练习记录" value={stats.totalRecords} color="orange" />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold text-gray-700 mb-3">数据维护</h2>
        <p className="text-sm text-gray-500 mb-4">
          当段位数据异常时，重新遍历所有学生的学习记录和挑战记录，校准段位。
        </p>
        <RecalculateButton action={recalculateAllRanks} />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  }

  return (
    <div className="bg-white rounded-lg border p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]?.split(" ")[1] || "text-gray-700"}`}>
        {value}
      </p>
    </div>
  )
}
