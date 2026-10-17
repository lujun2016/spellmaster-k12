// 时间格式化工具

/** 秒 -> "X 分 Y 秒" / "Y 秒" / "X 分钟" */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 分钟"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} 秒`
  if (s === 0) return `${m} 分钟`
  return `${m} 分 ${s} 秒`
}

/** ISO 时间 -> "YYYY-MM-DD HH:mm" */
export function formatDateTime(iso: string): string {
  if (!iso) return "-"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "-"
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}
