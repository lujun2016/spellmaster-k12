import { parentApi } from "../../services/parent"
import { formatDateTime, formatDuration } from "../../utils/time"

interface IWrongView {
  en: string
  zh: string
  phonetic: string
  userInput: string
}

interface IData {
  empty: boolean
  startedAt: string
  endedAt: string
  wordsPracticed: number
  totalTime: string
  challengeCompleted: boolean
  challengeAllRight: boolean
  correctRate: number
  correctCount: number
  totalQuestions: number
  wrongWords: IWrongView[]
  wrongCount: number
}

Page<IData, WechatMiniprogram.IAnyObject>({
  data: {
    empty: false,
    startedAt: "",
    endedAt: "",
    wordsPracticed: 0,
    totalTime: "",
    challengeCompleted: false,
    challengeAllRight: false,
    correctRate: 0,
    correctCount: 0,
    totalQuestions: 0,
    wrongWords: [],
    wrongCount: 0,
  },

  onLoad() {
    this.load()
  },

  load() {
    parentApi
      .getSessionSummary()
      .then((s) => {
        // 无汇总：{ sessionId: null, message: "暂无新数据" }
        if (!s.sessionId) {
          this.setData({ empty: true })
          return
        }
        const wrong = (s.wordsWrong || []).map((w) => ({
          en: w.en,
          zh: w.zh,
          phonetic: w.phonetic,
          userInput: w.userInput || "-",
        }))
        const cr = s.challengeResult
        this.setData({
          empty: false,
          startedAt: formatDateTime(s.startedAt || ""),
          endedAt: formatDateTime(s.endedAt || ""),
          wordsPracticed: s.wordsPracticed,
          totalTime: formatDuration(s.totalTimeSpent),
          challengeCompleted: s.challengeCompleted,
          challengeAllRight: !!cr && cr.correctRate >= 100,
          correctRate: cr ? cr.correctRate : 0,
          correctCount: cr ? cr.correctCount : 0,
          totalQuestions: cr ? cr.totalQuestions : 0,
          wrongWords: wrong,
          wrongCount: wrong.length,
        })
      })
      .catch((err: { message?: string }) => {
        wx.showToast({ title: err.message || "加载失败", icon: "none" })
      })
  },

  goHome() {
    wx.switchTab({ url: "/pages/home/home" })
  },
})
