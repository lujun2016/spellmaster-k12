// 段位展示与配色
// 与 Web 端 src/lib/rank-service.ts 中的 getRankDisplayName 保持完全一致，
// 确保小程序端与 Web 端段位名称统一。

const RANK_NAMES: Record<number, string> = {
  1: "青铜",
  2: "白银",
  3: "黄金",
  4: "铂金",
  5: "钻石",
  6: "星耀",
  7: "王者",
  8: "无双王者",
  9: "荣耀王者",
  10: "传奇王者",
}

export function getRankDisplayName(rankValue: number): string {
  if (rankValue <= 10) return RANK_NAMES[rankValue] || "未知"
  const starLevel = (rankValue - 10) * 20
  return `传奇${starLevel}星`
}

/** 段位代表色，用于徽章/进度展示 */
export function getRankColor(rankValue: number): string {
  if (rankValue <= 1) return "#A1824A" // 青铜
  if (rankValue === 2) return "#9CA3AF" // 白银
  if (rankValue === 3) return "#E0B341" // 黄金
  if (rankValue === 4) return "#5EE0C8" // 铂金
  if (rankValue === 5) return "#4FC3F7" // 钻石
  if (rankValue === 6) return "#B388FF" // 星耀
  return "#FF7043" // 王者及以上
}
