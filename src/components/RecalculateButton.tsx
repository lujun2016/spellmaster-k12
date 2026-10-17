"use client"

import { useState } from "react"

export function RecalculateButton({
  action,
}: {
  action: () => Promise<{ total: number; updated: number }>
}) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ total: number; updated: number } | null>(null)

  async function handleClick() {
    if (!confirm("确定要重新计算所有学生的段位吗？")) return
    setLoading(true)
    try {
      const res = await action()
      setResult(res)
    } catch (e: any) {
      alert("操作失败: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition"
      >
        {loading ? "计算中..." : "重新计算段位"}
      </button>
      {result && (
        <p className="text-sm text-gray-600 mt-2">
          共 {result.total} 名学生，已更新 {result.updated} 名。
        </p>
      )}
    </div>
  )
}
