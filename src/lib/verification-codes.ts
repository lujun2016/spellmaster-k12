/** 验证码存储 — 开发环境用内存，生产环境应换 Redis */
const store = new Map<string, { code: string; expiresAt: number }>()

export function storeCode(phone: string, code: string): void {
  store.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 })
  // 清理过期
  for (const [k, v] of store) {
    if (Date.now() > v.expiresAt) store.delete(k)
  }
}

export function verifyCode(phone: string, code: string): boolean {
  const entry = store.get(phone)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(phone)
    return false
  }
  if (entry.code !== code) return false
  store.delete(phone)
  return true
}
