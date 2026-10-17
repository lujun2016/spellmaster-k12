// 孩子学习状态动画组件
// 对应文档 7.2 / 12.2 四种状态：idle / learning / challenging / exercising
// 注意：遵守文档 14.1「不做 emoji」约定，全部用 CSS 图形 + 文字标签表现。
import { AnimationType } from "../../../types"

interface IData {
  scene: AnimationType
  stopwatch: number
}

type IProperty = Record<string, any>

type IMethod = {
  startStopwatch(): void
  stopStopwatch(): void
  onViewSummary(): void
}

interface ICustom {
  timer?: ReturnType<typeof setInterval>
}

Component<IData, IProperty, IMethod, ICustom>({
  properties: {
    scene: { type: String, value: "idle" },
  },
  data: {
    scene: "idle" as AnimationType,
    stopwatch: 0,
  },
  observers: {
    scene(val: AnimationType) {
      if (val === "challenging") {
        this.startStopwatch()
      } else {
        this.stopStopwatch()
        this.setData({ stopwatch: 0 })
      }
    },
  },
  methods: {
    startStopwatch() {
      this.stopStopwatch()
      this.setData({ stopwatch: 0 })
      this.timer = setInterval(() => {
        this.setData({ stopwatch: this.data.stopwatch + 1 })
      }, 1000)
    },
    stopStopwatch() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = undefined
      }
    },
    onViewSummary() {
      this.triggerEvent("viewSummary")
    },
  },
  lifetimes: {
    detached() {
      this.stopStopwatch()
    },
  },
})
