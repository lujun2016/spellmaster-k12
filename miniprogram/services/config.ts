// 后端基础地址配置
// Web 端 Next.js 服务地址。
// 注意：小程序运行环境（模拟器/真机）里的 localhost 指向的是「小程序自身」，
//   不等于开发机的 localhost，因此用 localhost 会报 wx.request timeout。
//   必须填开发机的局域网 IP（从「系统设置→网络」或 `ipconfig getifaddr en0` 查）。
//   当前为本机 Wi-Fi IP；若重连 Wi-Fi 导致 IP 变化，请同步更新此处。
//   若仅用模拟器调试，也可改回 http://127.0.0.1:3000。
//   微信开发者工具需勾选「不校验合法域名」（本项目 project.config.json 已设 urlCheck:false）。

export const BASE_URL = "http://192.168.31.57:3000"
export const API_PREFIX = "/api/v1"

// 微信一键登录开发模拟开关。
// true（默认，本地联调）：登录页「微信一键登录」改为手动输入手机号，
//   对应后端未配置 WECHAT_APPID/SECRET 的开发模拟模式。
// false（生产）：使用真实 <button open-type="getPhoneNumber"> 授权，
//   需后端配置真实微信凭据，且当前小程序须为已认证正式版。
export const WECHAT_MOCK = true
