import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface WordData { en: string; zh: string; phonetic: string }
interface UnitData { name: string; sortOrder: number; words: WordData[] }
interface GradeData { name: string; level: number; units: UnitData[] }

const TEXTBOOK_ID = "textbook-oxford-sh"

// ====== 一年级上册（完整，来自搜索结果） ======
const grade1s: GradeData = {
  name: "一年级上", level: 1,
  units: [
    { name: "M1U1 Greetings", sortOrder: 1, words: [
      { en: "morning", zh: "早晨；上午", phonetic: "/ˈmɔːnɪŋ/" },
      { en: "afternoon", zh: "午后；下午", phonetic: "/ˌɑːftəˈnuːn/" },
      { en: "hello", zh: "你好", phonetic: "/həˈləʊ/" },
      { en: "hi", zh: "嗨", phonetic: "/haɪ/" },
      { en: "goodbye", zh: "再见", phonetic: "/ɡʊdˈbaɪ/" },
      { en: "good", zh: "好的", phonetic: "/ɡʊd/" },
      { en: "nice", zh: "美好的", phonetic: "/naɪs/" },
      { en: "see", zh: "看见", phonetic: "/siː/" },
      { en: "you", zh: "你；你们", phonetic: "/juː/" },
    ]},
    { name: "M1U2 My classroom", sortOrder: 2, words: [
      { en: "book", zh: "书", phonetic: "/bʊk/" },
      { en: "ruler", zh: "尺子", phonetic: "/ˈruːlə(r)/" },
      { en: "pencil", zh: "铅笔", phonetic: "/ˈpensl/" },
      { en: "rubber", zh: "橡皮", phonetic: "/ˈrʌbə(r)/" },
      { en: "give", zh: "给", phonetic: "/ɡɪv/" },
      { en: "me", zh: "我", phonetic: "/miː/" },
      { en: "here", zh: "在这里", phonetic: "/hɪə(r)/" },
      { en: "please", zh: "请", phonetic: "/pliːz/" },
      { en: "thank", zh: "感谢", phonetic: "/θæŋk/" },
      { en: "how", zh: "怎样", phonetic: "/haʊ/" },
    ]},
    { name: "M1U3 My face", sortOrder: 3, words: [
      { en: "face", zh: "脸", phonetic: "/feɪs/" },
      { en: "mouth", zh: "嘴", phonetic: "/maʊθ/" },
      { en: "nose", zh: "鼻子", phonetic: "/nəʊz/" },
      { en: "eye", zh: "眼睛", phonetic: "/aɪ/" },
      { en: "ear", zh: "耳朵", phonetic: "/ɪə(r)/" },
      { en: "this", zh: "这；这个", phonetic: "/ðɪs/" },
      { en: "is", zh: "是", phonetic: "/ɪz/" },
      { en: "my", zh: "我的", phonetic: "/maɪ/" },
      { en: "touch", zh: "触摸", phonetic: "/tʌtʃ/" },
      { en: "your", zh: "你的", phonetic: "/jɔː(r)/" },
    ]},
    { name: "M2U1 My abilities", sortOrder: 4, words: [
      { en: "dance", zh: "跳舞", phonetic: "/dɑːns/" },
      { en: "read", zh: "阅读", phonetic: "/riːd/" },
      { en: "sing", zh: "唱歌", phonetic: "/sɪŋ/" },
      { en: "draw", zh: "画画", phonetic: "/drɔː/" },
      { en: "can", zh: "能，会", phonetic: "/kæn/" },
      { en: "what", zh: "什么", phonetic: "/wɒt/" },
      { en: "flower", zh: "花", phonetic: "/ˈflaʊə(r)/" },
      { en: "house", zh: "房屋", phonetic: "/haʊs/" },
    ]},
    { name: "M2U2 My family", sortOrder: 5, words: [
      { en: "father", zh: "父亲；爸爸", phonetic: "/ˈfɑːðə(r)/" },
      { en: "mother", zh: "母亲；妈妈", phonetic: "/ˈmʌðə(r)/" },
      { en: "grandfather", zh: "祖父；爷爷", phonetic: "/ˈɡrænfɑːðə(r)/" },
      { en: "grandmother", zh: "祖母；奶奶", phonetic: "/ˈɡrænmʌðə(r)/" },
      { en: "family", zh: "家庭", phonetic: "/ˈfæməli/" },
      { en: "he", zh: "他", phonetic: "/hiː/" },
      { en: "she", zh: "她", phonetic: "/ʃiː/" },
      { en: "who", zh: "谁", phonetic: "/huː/" },
      { en: "fine", zh: "好的", phonetic: "/faɪn/" },
    ]},
    { name: "M2U3 My friends", sortOrder: 6, words: [
      { en: "fat", zh: "肥胖的", phonetic: "/fæt/" },
      { en: "thin", zh: "瘦的", phonetic: "/θɪn/" },
      { en: "tall", zh: "高的", phonetic: "/tɔːl/" },
      { en: "short", zh: "矮的；短的", phonetic: "/ʃɔːt/" },
      { en: "friend", zh: "朋友", phonetic: "/frend/" },
      { en: "classmate", zh: "同班同学", phonetic: "/ˈklɑːsmeɪt/" },
      { en: "girl", zh: "女孩", phonetic: "/ɡɜːl/" },
      { en: "boy", zh: "男孩", phonetic: "/bɔɪ/" },
    ]},
    { name: "M3U1 Numbers", sortOrder: 7, words: [
      { en: "one", zh: "一", phonetic: "/wʌn/" },
      { en: "two", zh: "二", phonetic: "/tuː/" },
      { en: "three", zh: "三", phonetic: "/θriː/" },
      { en: "four", zh: "四", phonetic: "/fɔː(r)/" },
      { en: "five", zh: "五", phonetic: "/faɪv/" },
      { en: "six", zh: "六", phonetic: "/sɪks/" },
      { en: "count", zh: "数数", phonetic: "/kaʊnt/" },
      { en: "little", zh: "小的", phonetic: "/ˈlɪtl/" },
      { en: "rabbit", zh: "兔子", phonetic: "/ˈræbɪt/" },
    ]},
    { name: "M3U2 Fruit", sortOrder: 8, words: [
      { en: "apple", zh: "苹果", phonetic: "/ˈæpl/" },
      { en: "pear", zh: "梨子", phonetic: "/peə(r)/" },
      { en: "peach", zh: "桃子", phonetic: "/piːtʃ/" },
      { en: "orange", zh: "橙子；橙色", phonetic: "/ˈɒrɪndʒ/" },
      { en: "fruit", zh: "水果", phonetic: "/fruːt/" },
      { en: "tree", zh: "树", phonetic: "/triː/" },
      { en: "red", zh: "红色", phonetic: "/red/" },
      { en: "round", zh: "圆形的", phonetic: "/raʊnd/" },
      { en: "sweet", zh: "甜的", phonetic: "/swiːt/" },
      { en: "eat", zh: "吃", phonetic: "/iːt/" },
    ]},
    { name: "M3U3 Food", sortOrder: 9, words: [
      { en: "hamburger", zh: "汉堡包", phonetic: "/ˈhæmbɜːɡə(r)/" },
      { en: "pizza", zh: "披萨", phonetic: "/ˈpiːtsə/" },
      { en: "cake", zh: "蛋糕", phonetic: "/keɪk/" },
      { en: "pie", zh: "馅饼", phonetic: "/paɪ/" },
      { en: "soup", zh: "汤", phonetic: "/suːp/" },
      { en: "may", zh: "可以", phonetic: "/meɪ/" },
      { en: "have", zh: "有", phonetic: "/hæv/" },
      { en: "help", zh: "帮助", phonetic: "/help/" },
    ]},
    { name: "M4U1 Farm animals", sortOrder: 10, words: [
      { en: "chick", zh: "小鸡", phonetic: "/tʃɪk/" },
      { en: "duck", zh: "鸭子", phonetic: "/dʌk/" },
      { en: "cow", zh: "奶牛", phonetic: "/kaʊ/" },
      { en: "pig", zh: "猪", phonetic: "/pɪɡ/" },
      { en: "farm", zh: "农场", phonetic: "/fɑːm/" },
      { en: "that", zh: "那；那个", phonetic: "/ðæt/" },
      { en: "draw", zh: "绘画", phonetic: "/drɔː/" },
      { en: "cut", zh: "切；剪", phonetic: "/kʌt/" },
    ]},
    { name: "M4U2 Zoo animals", sortOrder: 11, words: [
      { en: "bear", zh: "熊", phonetic: "/beə(r)/" },
      { en: "tiger", zh: "老虎", phonetic: "/ˈtaɪɡə(r)/" },
      { en: "monkey", zh: "猴子", phonetic: "/ˈmʌŋki/" },
      { en: "panda", zh: "熊猫", phonetic: "/ˈpændə/" },
    ]},
    { name: "M4U3 Colours", sortOrder: 12, words: [
      { en: "red", zh: "红色的", phonetic: "/red/" },
      { en: "blue", zh: "蓝色的", phonetic: "/bluː/" },
      { en: "yellow", zh: "黄色的", phonetic: "/ˈjeləʊ/" },
      { en: "green", zh: "绿色的", phonetic: "/ɡriːn/" },
      { en: "white", zh: "白色的", phonetic: "/waɪt/" },
      { en: "black", zh: "黑色的", phonetic: "/blæk/" },
      { en: "colour", zh: "颜色；涂色", phonetic: "/ˈkʌlə(r)/" },
    ]},
  ]
}

// ====== 一年级下册（部分，来自搜索结果） ======
const grade1x: GradeData = {
  name: "一年级下", level: 2,
  units: [
    { name: "M1U1 Seeing and hearing", sortOrder: 1, words: [
      { en: "see", zh: "看见", phonetic: "/siː/" },
      { en: "frog", zh: "青蛙", phonetic: "/frɒɡ/" },
      { en: "rabbit", zh: "兔子", phonetic: "/ˈræbɪt/" },
      { en: "bee", zh: "蜜蜂", phonetic: "/biː/" },
      { en: "bird", zh: "鸟", phonetic: "/bɜːd/" },
    ]},
    { name: "M1U2 Listening and hearing", sortOrder: 2, words: [
      { en: "listen", zh: "听", phonetic: "/ˈlɪsn/" },
      { en: "hear", zh: "听见", phonetic: "/hɪə(r)/" },
      { en: "sheep", zh: "绵羊", phonetic: "/ʃiːp/" },
      { en: "hen", zh: "母鸡", phonetic: "/hen/" },
      { en: "dog", zh: "狗", phonetic: "/dɒɡ/" },
      { en: "cat", zh: "猫", phonetic: "/kæt/" },
    ]},
    { name: "M1U3 Tasting and smelling", sortOrder: 3, words: [
      { en: "smell", zh: "闻", phonetic: "/smel/" },
      { en: "taste", zh: "尝", phonetic: "/teɪst/" },
      { en: "rice", zh: "米饭", phonetic: "/raɪs/" },
      { en: "soup", zh: "汤", phonetic: "/suːp/" },
      { en: "egg", zh: "蛋", phonetic: "/eɡ/" },
    ]},
    { name: "M2U1 Toys", sortOrder: 4, words: [
      { en: "toy", zh: "玩具", phonetic: "/tɔɪ/" },
      { en: "like", zh: "喜欢", phonetic: "/laɪk/" },
      { en: "ball", zh: "球", phonetic: "/bɔːl/" },
      { en: "doll", zh: "洋娃娃", phonetic: "/dɒl/" },
      { en: "bicycle", zh: "自行车", phonetic: "/ˈbaɪsɪkl/" },
      { en: "kite", zh: "风筝", phonetic: "/kaɪt/" },
    ]},
    { name: "M2U2 Food", sortOrder: 5, words: [
      { en: "sweet", zh: "糖果", phonetic: "/swiːt/" },
      { en: "jelly", zh: "果冻", phonetic: "/ˈdʒeli/" },
      { en: "ice cream", zh: "冰淇淋", phonetic: "/ˌaɪs ˈkriːm/" },
      { en: "biscuit", zh: "饼干", phonetic: "/ˈbɪskɪt/" },
    ]},
    { name: "M2U3 Drinks", sortOrder: 6, words: [
      { en: "drink", zh: "饮料", phonetic: "/drɪŋk/" },
      { en: "water", zh: "水", phonetic: "/ˈwɔːtə(r)/" },
      { en: "cola", zh: "可乐", phonetic: "/ˈkəʊlə/" },
      { en: "juice", zh: "果汁", phonetic: "/dʒuːs/" },
      { en: "milk", zh: "牛奶", phonetic: "/mɪlk/" },
    ]},
  ]
}

// ====== 二年级上册（部分） ======
const grade2s: GradeData = {
  name: "二年级上", level: 3,
  units: [
    { name: "M1U1 Good evening", sortOrder: 1, words: [
      { en: "good", zh: "好的", phonetic: "/ɡʊd/" },
      { en: "evening", zh: "晚上", phonetic: "/ˈiːvnɪŋ/" },
      { en: "night", zh: "夜晚", phonetic: "/naɪt/" },
      { en: "day", zh: "一天", phonetic: "/deɪ/" },
      { en: "mum", zh: "妈妈", phonetic: "/mʌm/" },
      { en: "today", zh: "今天", phonetic: "/təˈdeɪ/" },
    ]},
    { name: "M1U2 Tall and short", sortOrder: 2, words: [
      { en: "tall", zh: "高的", phonetic: "/tɔːl/" },
      { en: "short", zh: "矮的", phonetic: "/ʃɔːt/" },
      { en: "boy", zh: "男孩", phonetic: "/bɔɪ/" },
      { en: "girl", zh: "女孩", phonetic: "/ɡɜːl/" },
      { en: "no", zh: "不", phonetic: "/nəʊ/" },
      { en: "yes", zh: "对", phonetic: "/jes/" },
    ]},
    { name: "M1U3 Numbers", sortOrder: 3, words: [
      { en: "sorry", zh: "对不起", phonetic: "/ˈsɒri/" },
      { en: "seven", zh: "七", phonetic: "/ˈsevn/" },
      { en: "eight", zh: "八", phonetic: "/eɪt/" },
      { en: "nine", zh: "九", phonetic: "/naɪn/" },
      { en: "ten", zh: "十", phonetic: "/ten/" },
    ]},
    { name: "M2U1 Activities", sortOrder: 4, words: [
      { en: "swim", zh: "游泳", phonetic: "/swɪm/" },
      { en: "run", zh: "跑", phonetic: "/rʌn/" },
      { en: "write", zh: "写", phonetic: "/raɪt/" },
      { en: "fly", zh: "飞", phonetic: "/flaɪ/" },
    ]},
    { name: "M2U2 Colours", sortOrder: 5, words: [
      { en: "white", zh: "白色", phonetic: "/waɪt/" },
      { en: "purple", zh: "紫色", phonetic: "/ˈpɜːpl/" },
      { en: "pink", zh: "粉色", phonetic: "/pɪŋk/" },
      { en: "orange", zh: "橙色", phonetic: "/ˈɒrɪndʒ/" },
    ]},
    { name: "M2U3 Transport", sortOrder: 6, words: [
      { en: "train", zh: "火车", phonetic: "/treɪn/" },
      { en: "bus", zh: "公共汽车", phonetic: "/bʌs/" },
      { en: "car", zh: "小汽车", phonetic: "/kɑː(r)/" },
      { en: "van", zh: "货车", phonetic: "/væn/" },
      { en: "ship", zh: "船", phonetic: "/ʃɪp/" },
      { en: "soft", zh: "柔软的", phonetic: "/sɒft/" },
      { en: "hard", zh: "坚硬的", phonetic: "/hɑːd/" },
      { en: "smooth", zh: "光滑的", phonetic: "/smuːð/" },
    ]},
  ]
}

async function importGrade(gradeData: GradeData) {
  const grade = await prisma.grade.upsert({
    where: { id: `grade-${gradeData.level}` },
    update: { name: gradeData.name },
    create: {
      id: `grade-${gradeData.level}`,
      textbookId: TEXTBOOK_ID,
      name: gradeData.name,
      level: gradeData.level,
    },
  })

  // 删除旧单元及其单词
  const oldUnits = await prisma.unit.findMany({ where: { gradeId: grade.id } })
  for (const u of oldUnits) {
    await prisma.word.deleteMany({ where: { unitId: u.id } })
    await prisma.video.deleteMany({ where: { unitId: u.id } })
    await prisma.unit.delete({ where: { id: u.id } })
  }

  let wordCount = 0
  for (const unitData of gradeData.units) {
    const unit = await prisma.unit.create({
      data: {
        gradeId: grade.id,
        name: unitData.name,
        sortOrder: unitData.sortOrder,
      },
    })

    for (let i = 0; i < unitData.words.length; i++) {
      const w = unitData.words[i]
      await prisma.word.create({
        data: {
          unitId: unit.id,
          en: w.en,
          zh: w.zh,
          phonetic: w.phonetic,
          sortOrder: i + 1,
        },
      })
      wordCount++
    }

    await prisma.video.create({
      data: { unitId: unit.id, status: "pending" },
    })
  }

  console.log(`  ${gradeData.name}: ${gradeData.units.length}单元, ${wordCount}词`)
}

async function main() {
  console.log("导入牛津上海版词库...\n")

  await importGrade(grade1s)
  await importGrade(grade1x)
  await importGrade(grade2s)

  const totalWords = await prisma.word.count()
  const totalUnits = await prisma.unit.count()
  console.log(`\n总计: ${totalUnits} 单元, ${totalWords} 词`)
  await prisma.$disconnect()
}

main().catch(console.error)
