import { parentApi } from "../../services/parent"
import { getChild } from "../../utils/storage"
import { getRankDisplayName } from "../../utils/rank"
import { ChildInfo, AnimationType } from "../../types"

interface IData {
  childName: string
  childInitial: string
  gradeText: string
  rankValue: number
  isOnline: boolean
  animationType: AnimationType
  stateTitle: string
  stateText: string
  showSummaryBtn: boolean
}

interface ICustom {
  timer?: ReturnType<typeof setInterval>
  applyChild(child: ChildInfo): void
  startPolling(): void
  stopPolling(): void
  refresh(): void
  goSummary(): void
}

const STATE_MAP: Record<string, { title: string; text: string }> = {
  idle: { title: "空闲中", text: "孩子已登录，正在准备开始学习。" },
  learning: { title: "学习中", text: "孩子正在单元内观看视频、拼写练习。" },
  challenging: { title: "挑战中", text: "孩子正在闯关挑战，加油！" },
  exercising: { title: "课后放松", text: "孩子已结束本次学习，来看看成果吧。" },
}

Page<IData, ICustom>({
  data: {
    childName: "",
    childInitial: "",
    gradeText: "",
    rankValue: 1,
    isOnline: false,
    animationType: "idle",
    stateTitle: "加载中",
    stateText: "",
    showSummaryBtn: false,
  },

  onShow() {
    const child = getChild()
    if (!child) {
      wx.reLaunch({ url: "/pages/login/login" })
      return
    }
    this.applyChild(child)
    this.refresh()
    this.startPolling()
  },

  onHide() {
    this.stopPolling()
  },

  onUnload() {
    this.stopPolling()
  },

  applyChild(child: ChildInfo) {
    this.setData({
      childName: child.name,
      childInitial: child.name ? child.name.charAt(0) : "?",
      gradeText: child.gradeLevel != null ? `等级 ${child.gradeLevel}` : "未登记年级",
      rankValue: child.rankValue,
    })
  },

  startPolling() {
    this.stopPolling()
    this.timer = setInterval(() => this.refresh(), 5000)
  },

  stopPolling() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  },

  refresh() {
    parentApi
      .getAnimationState()
      .then((res) => {
        const type = res.animationType
        const meta = STATE_MAP[type] || { title: "", text: "" }
        this.setData({
          animationType: type,
          stateTitle: meta.title,
          stateText: meta.text,
          showSummaryBtn: type === "exercising",
        })
        return parentApi.getStatus()
      })
      .then((status) => {
        this.setData({ isOnline: status.isOnline })
        if (status.hasNewSummary) {
          this.setData({ showSummaryBtn: true })
        }
      })
      .catch(() => {
        // 网络抖动时静默，下一轮轮询自动重试
      })
  },

  goSummary() {
    wx.navigateTo({ url: "/pages/summary/summary" })
  },
})
