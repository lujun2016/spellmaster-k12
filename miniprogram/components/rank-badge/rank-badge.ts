import { getRankDisplayName, getRankColor } from "../../utils/rank"

interface IData {
  rankName: string
  color: string
}

type IProperty = Record<string, any>

Component<IData, IProperty, WechatMiniprogram.IAnyObject>({
  properties: {
    rankValue: { type: Number, value: 1 },
    rankName: { type: String, value: "" },
  },
  data: {
    rankName: "",
    color: "#A1824A",
  },
  observers: {
    rankValue(val: number) {
      this.setData({ rankName: getRankDisplayName(val), color: getRankColor(val) })
    },
  },
})
