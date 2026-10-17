import { parentApi } from "../../services/parent"
import { getChild, setChild, logout } from "../../utils/storage"
import { getRankDisplayName } from "../../utils/rank"
import { ChildInfo } from "../../types"

interface IData {
  name: string
  initial: string
  gradeText: string
  rankValue: number
  rankName: string
}

Page<IData, WechatMiniprogram.IAnyObject>({
  data: {
    name: "",
    initial: "",
    gradeText: "",
    rankValue: 1,
    rankName: "",
  },

  onShow() {
    this.load()
  },

  load() {
    const local = getChild()
    if (local) this.applyLocal(local)
    // 以接口最新段位为准刷新
    parentApi
      .getProfile()
      .then((p) => {
        const merged: ChildInfo = { ...local, ...p } as ChildInfo
        setChild(merged)
        this.applyLocal(merged)
      })
      .catch(() => {
        // 接口异常时回落到本地缓存
      })
  },

  applyLocal(c: ChildInfo) {
    this.setData({
      name: c.name,
      initial: c.name ? c.name.charAt(0) : "?",
      gradeText: c.gradeLevel != null ? `等级 ${c.gradeLevel}` : "未登记年级",
      rankValue: c.rankValue,
      rankName: getRankDisplayName(c.rankValue),
    })
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "确定要退出当前家长账号吗？",
      success: (r) => {
        if (r.confirm) {
          logout()
          wx.reLaunch({ url: "/pages/login/login" })
        }
      },
    })
  },
})
