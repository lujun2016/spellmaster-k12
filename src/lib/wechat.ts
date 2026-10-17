/**
 * 微信小程序服务端能力封装（家长端一键手机号授权登录）
 *
 * 使用「新版手机号快速验证」流程：小程序 <button open-type="getPhoneNumber">
 * 回调返回 dynamic code，服务端用该 code 调用 getuserphonenumber 换取手机号。
 *
 * 未配置 WECHAT_APPID / WECHAT_SECRET 时，isWechatConfigured() 返回 false，
 * 上层路由会进入「开发模拟模式」，无需真实小程序资质即可联调。
 */

const APPID = process.env.WECHAT_APPID || ""
const SECRET = process.env.WECHAT_SECRET || ""

/** 是否已配置真实微信凭据。false 时上层应走开发模拟模式。 */
export function isWechatConfigured(): boolean {
  return Boolean(APPID && SECRET)
}

interface Code2SessionResult {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

/** 用 wx.login 的 code 换取 openid / session_key（可选，用于回填 parentWechatId）。 */
export async function code2session(jsCode: string): Promise<Code2SessionResult> {
  const url =
    `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}` +
    `&secret=${SECRET}&js_code=${jsCode}&grant_type=authorization_code`
  const res = await fetch(url)
  return (await res.json()) as Code2SessionResult
}

let cachedToken: { token: string; expiresAt: number } | null = null

/** 获取（并缓存）接口调用凭证 access_token。 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }
  const url =
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential` +
    `&appid=${APPID}&secret=${SECRET}`
  const res = await fetch(url)
  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
    errmsg?: string
  }
  if (!data.access_token) {
    throw new Error(data.errmsg || "获取微信 access_token 失败")
  }
  cachedToken = {
    token: data.access_token,
    // 提前 5 分钟过期，避免临界失效
    expiresAt: Date.now() + ((data.expires_in || 7200) - 300) * 1000,
  }
  return cachedToken.token
}

/** 用小程序回调的 phoneCode 换取用户手机号（纯号码，不含区号）。 */
export async function getPhoneNumber(phoneCode: string): Promise<string> {
  const accessToken = await getAccessToken()
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: phoneCode }),
  })
  const data = (await res.json()) as {
    errcode?: number
    errmsg?: string
    phone_info?: { phoneNumber: string; purePhoneNumber: string }
  }
  if (data.errcode !== 0 || !data.phone_info) {
    throw new Error(data.errmsg || "获取手机号失败")
  }
  return data.phone_info.purePhoneNumber
}
