import { parentApi } from "../../services/parent"
import { setToken, setChild, hasToken } from "../../utils/storage"
import { WECHAT_MOCK } from "../../services/config"
import { VerifyResponse } from "../../types"

interface IData {
  phone: string
  code: string
  counting: boolean
  countdown: number
  loading: boolean
  wechatMock: boolean
  wechatLoading: boolean
}

interface ICustom {
  timer?: ReturnType<typeof setInterval>
  startCountdown(): void
  onSendCode(): void
  onLogin(): void
  onPhoneInput(e: InputEvent): void
  onCodeInput(e: InputEvent): void
  onWechatLogin(e: GetPhoneNumberEvent): void
  onWechatMockLogin(): void
  applyLoginResult(res: VerifyResponse): void
}

type InputEvent = WechatMiniprogram.Input

type GetPhoneNumberEvent = WechatMiniprogram.CustomEvent<{
  errMsg: string
  code?: string
  encryptedData?: string
  iv?: string
}>

Page<IData, ICustom>({
  data: {
    phone: "",
    code: "",
    counting: false,
    countdown: 60,
    loading: false,
    wechatMock: WECHAT_MOCK,
    wechatLoading: false,
  },

  onLoad() {
    if (hasToken()) {
      wx.switchTab({ url: "/pages/home/home" })
    }
  },

  onPhoneInput(e: InputEvent) {
    this.setData({ phone: e.detail.value })
  },

  onCodeInput(e: InputEvent) {
    this.setData({ code: e.detail.value })
  },

  onSendCode() {
    const phone = this.data.phone.trim()
    if (!/^\d{11}$/.test(phone)) {
      wx.showToast({ title: "请输入正确的 11 位手机号", icon: "none" })
      return
    }
    if (this.data.counting) return

    parentApi
      .sendCode(phone)
      .then(() => {
        wx.showToast({ title: "验证码已发送", icon: "success" })
        this.startCountdown()
      })
      .catch((err: { message?: string }) => {
        wx.showToast({ title: err.message || "发送失败", icon: "none" })
      })
  },

  startCountdown() {
    this.setData({ counting: true, countdown: 60 })
    this.timer = setInterval(() => {
      const c = this.data.countdown - 1
      if (c <= 0) {
        if (this.timer) clearInterval(this.timer)
        this.setData({ counting: false, countdown: 0 })
      } else {
        this.setData({ countdown: c })
      }
    }, 1000)
  },

  onLogin() {
    const phone = this.data.phone.trim()
    const code = this.data.code.trim()
    if (!/^\d{11}$/.test(phone)) {
      wx.showToast({ title: "请输入正确的手机号", icon: "none" })
      return
    }
    if (!/^\d{6}$/.test(code)) {
      wx.showToast({ title: "请输入 6 位验证码", icon: "none" })
      return
    }

    this.setData({ loading: true })
    parentApi
      .verify(phone, code)
      .then((res) => this.applyLoginResult(res))
      .catch((err: { message?: string }) => {
        wx.showToast({ title: err.message || "登录失败", icon: "none" })
      })
      .finally(() => this.setData({ loading: false }))
  },

  /** 登录成功统一处理：存 token+child 并跳首页 */
  applyLoginResult(res: VerifyResponse) {
    setToken(res.token)
    setChild(res.child)
    wx.switchTab({ url: "/pages/home/home" })
  },

  /** 生产：真实微信手机号授权登录（<button open-type="getPhoneNumber">） */
  onWechatLogin(e: GetPhoneNumberEvent) {
    const phoneCode = e.detail.code
    if (!phoneCode) {
      // 用户拒绝授权或基础库过低
      wx.showToast({ title: "已取消微信授权", icon: "none" })
      return
    }
    this.setData({ wechatLoading: true })
    wx.login({
      success: (loginRes) => {
        parentApi
          .wechatLogin({ phoneCode, loginCode: loginRes.code })
          .then((res) => this.applyLoginResult(res))
          .catch((err: { message?: string }) => {
            wx.showToast({ title: err.message || "微信登录失败", icon: "none" })
          })
          .finally(() => this.setData({ wechatLoading: false }))
      },
      fail: () => {
        this.setData({ wechatLoading: false })
        wx.showToast({ title: "微信登录初始化失败", icon: "none" })
      },
    })
  },

  /** 开发模拟：无微信资质时，手动输入手机号走后端模拟模式 */
  onWechatMockLogin() {
    wx.showModal({
      title: "微信一键登录（开发模拟）",
      editable: true,
      placeholderText: "请输入孩子登记的家长手机号",
      success: (r) => {
        if (!r.confirm) return
        const mockPhone = (r.content || "").trim()
        if (!/^\d{11}$/.test(mockPhone)) {
          wx.showToast({ title: "请输入正确的 11 位手机号", icon: "none" })
          return
        }
        this.setData({ wechatLoading: true })
        parentApi
          .wechatLogin({ mockPhone })
          .then((res) => this.applyLoginResult(res))
          .catch((err: { message?: string }) => {
            wx.showToast({ title: err.message || "微信登录失败", icon: "none" })
          })
          .finally(() => this.setData({ wechatLoading: false }))
      },
    })
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
})
