import { ChildInfo } from "./types"

interface IAppOption {
  globalData: {
    baseUrl: string
  }
  child?: ChildInfo
}

App<IAppOption>({
  globalData: {
    baseUrl: "http://localhost:3000",
  },
  onLaunch() {
    // 小程序启动：登录态已在本地缓存，由各页面 onShow 自行校验
  },
})
