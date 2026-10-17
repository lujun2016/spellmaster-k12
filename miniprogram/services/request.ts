// 统一请求封装：自动附带家长 JWT、解析错误、返回业务数据
import { BASE_URL, API_PREFIX } from "./config"
import { getToken, logout } from "../utils/storage"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export interface RequestOptions {
  /** API_PREFIX 之后的路径，如 "/parent/auth/send-code" */
  url: string
  method?: "GET" | "POST"
  data?: Record<string, unknown>
  /** 是否携带 Authorization: Bearer <token>，家长接口除登录外均需 true */
  auth?: boolean
}

export function request<T>(opts: RequestOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const header: Record<string, string> = { "Content-Type": "application/json" }
    if (opts.auth) {
      const token = getToken()
      if (token) header["Authorization"] = `Bearer ${token}`
    }

    wx.request({
      url: BASE_URL + API_PREFIX + opts.url,
      method: opts.method || "GET",
      data: opts.data as
        | Record<string, string | number | boolean | object>
        | undefined,
      header,
      // 明确超时，避免后端不可达时默认最长等待（60s）造成的长时间卡顿
      timeout: 10000,
      success: (res) => {
        // token 过期：清理本地登录态并跳回登录页，所有需鉴权接口统一受益
        if (res.statusCode === 401) {
          logout()
          wx.reLaunch({ url: "/pages/login/login" })
          reject(new ApiError("登录已过期，请重新登录", 401))
          return
        }
        const body = res.data as Record<string, unknown>
        // Web 端失败约定：HTTP>=400 或 body.error 存在
        if (res.statusCode >= 400 || (body && typeof body.error === "string")) {
          const msg = typeof body.error === "string" ? body.error : "请求失败"
          reject(new ApiError(msg, res.statusCode))
          return
        }
        resolve(body as unknown as T)
      },
      fail: (err) => {
        reject(new ApiError(err.errMsg || "网络请求失败", 0))
      },
    })
  })
}
