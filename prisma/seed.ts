import { PrismaClient, Rank } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // --- 管理员 ---
  const adminHash = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminHash,
      name: "管理员",
      isAdmin: true,
      currentRank: Rank.LEGEND_KING,
      rankValue: 10,
    },
  })
  console.log("管理员:", admin.username, "(admin/admin123)")

  // --- 测试学生 ---
  const studentHash = await bcrypt.hash("123456", 10)
  const student = await prisma.user.upsert({
    where: { username: "student1" },
    update: {},
    create: {
      username: "student1",
      passwordHash: studentHash,
      name: "小明",
      isAdmin: false,
      parentPhone: "13800138000",
      gradeLevel: 1,
    },
  })
  console.log("学生:", student.username, "(student1/123456, 家长: 13800138000)")

  // --- 教材 ---
  const textbook = await prisma.textbook.upsert({
    where: { id: "textbook-oxford-sh" },
    update: {},
    create: {
      id: "textbook-oxford-sh",
      name: "牛津上海版",
    },
  })

  // --- 一年级上 ---
  const grade1s = await prisma.grade.upsert({
    where: { id: "grade-1s" },
    update: {},
    create: {
      id: "grade-1s",
      textbookId: textbook.id,
      name: "一年级上",
      level: 1,
    },
  })

  // --- Unit 1 ---
  const u1Words = [
    ["hello", "你好", "/həˈləʊ/"],
    ["hi", "嗨", "/haɪ/"],
    ["morning", "早上", "/ˈmɔːnɪŋ/"],
    ["afternoon", "下午", "/ˌɑːftəˈnuːn/"],
    ["goodbye", "再见", "/ɡʊdˈbaɪ/"],
    ["I", "我", "/aɪ/"],
    ["am", "是", "/æm/"],
    ["you", "你", "/juː/"],
  ]
  await createUnit("unit-1s-1", grade1s.id, "Unit 1 Hello", 1, u1Words)

  // --- Unit 2 ---
  const u2Words = [
    ["book", "书", "/bʊk/"],
    ["ruler", "尺子", "/ˈruːlə(r)/"],
    ["pencil", "铅笔", "/ˈpensl/"],
    ["rubber", "橡皮", "/ˈrʌbə(r)/"],
    ["give", "给", "/ɡɪv/"],
    ["me", "我（宾格）", "/miː/"],
    ["please", "请", "/pliːz/"],
    ["here", "这里", "/hɪə(r)/"],
  ]
  await createUnit("unit-1s-2", grade1s.id, "Unit 2 My classmates", 2, u2Words)

  // --- Unit 3 ---
  const u3Words = [
    ["eye", "眼睛", "/aɪ/"],
    ["ear", "耳朵", "/ɪə(r)/"],
    ["mouth", "嘴巴", "/maʊθ/"],
    ["nose", "鼻子", "/nəʊz/"],
    ["face", "脸", "/feɪs/"],
    ["touch", "触摸", "/tʌtʃ/"],
    ["this", "这个", "/ðɪs/"],
    ["is", "是", "/ɪz/"],
  ]
  await createUnit("unit-1s-3", grade1s.id, "Unit 3 My face", 3, u3Words)

  console.log("\n种子数据完成!")
  console.log("管理员: admin / admin123")
  console.log("学生: student1 / 123456")
}

async function createUnit(
  id: string,
  gradeId: string,
  name: string,
  sortOrder: number,
  words: [string, string, string][]
) {
  await prisma.unit.upsert({
    where: { id },
    update: {},
    create: {
      id,
      gradeId,
      name,
      sortOrder,
    },
  })

  for (let i = 0; i < words.length; i++) {
    const [en, zh, phonetic] = words[i]
    await prisma.word.upsert({
      where: { id: `${id}-${i + 1}` },
      update: {},
      create: {
        id: `${id}-${i + 1}`,
        unitId: id,
        en,
        zh,
        phonetic,
        sortOrder: i + 1,
      },
    })
  }

  await prisma.video.upsert({
    where: { unitId: id },
    update: {},
    create: {
      unitId: id,
      status: "pending",
    },
  })

  console.log(`  ${name}: ${words.length} 个单词`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
