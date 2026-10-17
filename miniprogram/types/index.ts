// 家长小程序端类型定义
// 全部类型严格对齐 Web 端 src/app/api/v1/parent 各路由的真实返回结构
// 注意：Web 端家长接口未使用文档 10.1 的 {success,data,error} 包装，
// 而是成功时直接返回数据对象，失败时返回 {error:"..."} 且 HTTP 状态码 >= 400。

/** 绑定后的孩子（学生）信息 */
export interface ChildInfo {
  id: string
  name: string
  gradeLevel: number | null
  /** verify 接口返回原始枚举(如 "BRONZE")；profile 接口返回展示名(如 "青铜")。
   *  展示一律使用 rankValue + getRankDisplayName，忽略此字段。 */
  currentRank: string
  rankValue: number
  avatar?: string | null
}

/** 孩子学习状态（/parent/child/status） */
export type ChildState = "idle" | "learning" | "challenging" | "offline"

/** 动画状态（/parent/child/animation-state） */
export type AnimationType = "idle" | "learning" | "challenging" | "exercising"

export interface ChildStatus {
  isOnline: boolean
  state: ChildState
  currentUnit: string | null
  lastUpdate?: string
  /** 离线时是否有未读的新汇总 */
  hasNewSummary?: boolean
}

export interface WrongWord {
  en: string
  zh: string
  phonetic: string
  userInput?: string
}

export interface ChallengeResult {
  /** 正确率（整数百分比，如 90），非字符串 */
  correctRate: number
  totalQuestions: number
  correctCount: number
}

export interface SessionSummary {
  sessionId: string | null
  startedAt?: string
  endedAt?: string
  wordsPracticed: number
  wordsWrong: WrongWord[] | null
  challengeCompleted: boolean
  challengeResult: ChallengeResult | null
  totalTimeSpent: number
  /** 无数据时返回 { sessionId: null, message: "暂无新数据" } */
  message?: string
}

export interface SummaryListItem {
  id: string
  startedAt: string
  endedAt: string | null
  wordsPracticed: number
  challengeCompleted: boolean
  totalTimeSpent: number
}

export interface PreviousSummaries {
  summaries: SummaryListItem[]
}

export interface AnimationStateResponse {
  animationType: AnimationType
  metadata: {
    hasNewSummary?: boolean
  }
}

export interface SendCodeResponse {
  success: boolean
  expiresIn: number
}

export interface VerifyResponse {
  token: string
  child: ChildInfo
}
