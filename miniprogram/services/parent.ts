// 家长端接口封装 —— 严格对应 Web 端 src/app/api/v1/parent 各路由
import { request } from "./request"
import {
  SendCodeResponse,
  VerifyResponse,
  ChildStatus,
  AnimationStateResponse,
  SessionSummary,
  PreviousSummaries,
  ChildInfo,
} from "../types"

export const parentApi = {
  /** POST /parent/auth/send-code —— 发送手机验证码 */
  sendCode(phone: string) {
    return request<SendCodeResponse>({
      url: "/parent/auth/send-code",
      method: "POST",
      data: { phone },
    })
  },

  /** POST /parent/auth/verify —— 验证码登录，返回 token 与绑定的孩子 */
  verify(phone: string, code: string) {
    return request<VerifyResponse>({
      url: "/parent/auth/verify",
      method: "POST",
      data: { phone, code },
    })
  },

  /** POST /parent/auth/wechat —— 微信手机号一键授权登录，返回结构同 verify。
   *  生产模式传 { phoneCode, loginCode }；开发模拟模式传 { mockPhone }。 */
  wechatLogin(payload: {
    phoneCode?: string
    loginCode?: string
    mockPhone?: string
  }) {
    return request<VerifyResponse>({
      url: "/parent/auth/wechat",
      method: "POST",
      data: payload,
    })
  },

  /** GET /parent/child/status —— 孩子在线状态 */
  getStatus() {
    return request<ChildStatus>({ url: "/parent/child/status", auth: true })
  },

  /** GET /parent/child/animation-state —— 当前动画类型 */
  getAnimationState() {
    return request<AnimationStateResponse>({
      url: "/parent/child/animation-state",
      auth: true,
    })
  },

  /** GET /parent/child/session-summary —— 本次学习汇总 */
  getSessionSummary() {
    return request<SessionSummary>({
      url: "/parent/child/session-summary",
      auth: true,
    })
  },

  /** GET /parent/child/previous-summaries?limit= —— 历史学习汇总 */
  getPreviousSummaries(limit = 20) {
    return request<PreviousSummaries>({
      url: `/parent/child/previous-summaries?limit=${limit}`,
      auth: true,
    })
  },

  /** GET /parent/child/profile —— 孩子档案（含最新段位） */
  getProfile() {
    return request<ChildInfo>({ url: "/parent/child/profile", auth: true })
  },
}
