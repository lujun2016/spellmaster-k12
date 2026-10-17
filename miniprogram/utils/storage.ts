// 本地存储：家长 token 与绑定的孩子信息
import { ChildInfo } from "../types"

const TOKEN_KEY = "parent_token"
const CHILD_KEY = "parent_child"

export function setToken(token: string): void {
  wx.setStorageSync(TOKEN_KEY, token)
}

export function getToken(): string {
  return wx.getStorageSync(TOKEN_KEY) || ""
}

export function hasToken(): boolean {
  return !!getToken()
}

export function clearToken(): void {
  wx.removeStorageSync(TOKEN_KEY)
}

export function setChild(child: ChildInfo): void {
  wx.setStorageSync(CHILD_KEY, child)
}

export function getChild(): ChildInfo | null {
  return wx.getStorageSync(CHILD_KEY) || null
}

export function clearChild(): void {
  wx.removeStorageSync(CHILD_KEY)
}

export function logout(): void {
  clearToken()
  clearChild()
}
