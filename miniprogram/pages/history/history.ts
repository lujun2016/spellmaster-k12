import { parentApi } from "../../services/parent"
import { formatDateTime, formatDuration } from "../../utils/time"

interface IItem {
  id: string
  date: string
  wordsPracticed: number
  challengeCompleted: boolean
  time: string
}

interface IData {
  loading: boolean
  list: IItem[]
}

Page<IData, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true,
    list: [],
  },

  onShow() {
    this.load()
  },

  load() {
    this.setData({ loading: true })
    parentApi
      .getPreviousSummaries(30)
      .then((res) => {
        const list = res.summaries.map((s) => ({
          id: s.id,
          date: formatDateTime(s.startedAt),
          wordsPracticed: s.wordsPracticed,
          challengeCompleted: s.challengeCompleted,
          time: formatDuration(s.totalTimeSpent),
        }))
        this.setData({ list, loading: false })
      })
      .catch((err: { message?: string }) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || "加载失败", icon: "none" })
      })
  },
})
