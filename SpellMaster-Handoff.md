# SpellMaster 项目 Handoff

> 最后更新: 2026-07-14
> 接手时告诉 AI："读 /Users/lujun/Desktop/SpellMaster-Handoff.md，然后继续工作"

---

## 一、项目定位

小学生英语单词背诵平台。学生看视频 → 拼写 → 闯关挑战，段位从青铜晋升传奇王者。家长微信小程序查看学习状态。

## 二、项目路径

| 组件 | 路径 |
|---|---|
| Web 端 | `/Users/lujun/Desktop/spellmaster` |
| 微信小程序 | `/Users/lujun/Desktop/spellmaster-miniprogram` |
| 需求文档 | `/Users/lujun/Desktop/英语单词拼写平台-需求与技术方案.md` |
| 小步智学参考 | `/Users/lujun/Desktop/小步智学技术档案/` |

## 三、启动命令

```bash
cd /Users/lujun/Desktop/spellmaster
pnpm dev          # 开发服务器 → http://localhost:3000
pnpm build        # 生产构建
npx prisma studio # 数据库可视化管理
```

## 四、账号

| 角色 | 用户名 | 密码 | 说明 |
|---|---|---|---|
| 管理员 | admin | admin123 | 管理后台全部权限 |
| 学生 | student1 | 123456 | 家长手机 13800138000 |

## 五、已完成功能

### 学生端
- [x] 登录/登出（NextAuth JWT）
- [x] 教材→年级→单元列表
- [x] 单词列表（英文+中文+音标）
- [x] 视频播放器（黑屏占位、1.0/1.1/1.2x 倍速、不可拖进度条、播放完成解锁拼写、已观看可跳过）
- [x] 逐题拼写（中文→输英文→Enter→对错判断+Web Speech 发音+音标）
- [x] 成绩弹窗（A/B/C/D 四级动画：A=Canvas烟花+奖杯、B=星星闪烁、C=挥手鼓励、D=拍肩加油）
- [x] 成绩详情（正确率+错词列表+发音按钮+返回/重做错词）
- [x] 单元挑战（25 题智能出题：本账号错词→其他账号错词→随机抽取）
- [x] 段位体系（青铜→白银→黄金→铂金→钻石→星耀→王者→无双王者→荣耀王者→传奇王者→传奇N星）
- [x] 总榜+年级榜（段位排序，不显示耗时）
- [x] 登录创建学习会话，退出写入汇总

### 管理后台 (admin/admin123)
- [x] 概览：平台统计 + 重新计算段位按钮
- [x] 词库管理：教材/年级/单元/单词 CRUD + 批量导入（英文\t中文\t音标）
- [x] 视频管理：按单元上传/替换 MP4
- [x] 学生管理：新增/删除、详情面板（姓名/年级/家长手机/备注/段位可编辑）
- [x] 学生形象：文件上传（JPG/PNG/GIF），存 public/uploads/avatars/
- [x] 练习记录查看：最近练习列表 + 最近错词
- [x] 数据导出：选择日期范围 → CSV（Excel 可打开），含姓名+中英文+音标+学生输入+对错+耗时

### 家长 API（小程序调用）
- [x] `POST /api/v1/parent/auth/send-code` — 发送验证码
- [x] `POST /api/v1/parent/auth/verify` — 验证码登录，返回 JWT
- [x] `POST /api/v1/parent/auth/wechat` — 微信一键登录（开发模拟模式）
- [x] `GET /api/v1/parent/child/status` — 在线状态（idle/learning/challenging/offline）
- [x] `GET /api/v1/parent/child/animation-state` — 动画类型（idle/learning/challenging/exercising）
- [x] `GET /api/v1/parent/child/session-summary` — 本次学习汇总
- [x] `GET /api/v1/parent/child/previous-summaries` — 历史汇总
- [x] `GET /api/v1/parent/child/profile` — 孩子档案（头像/段位/年级）
- [x] 验证码开发环境写日志到 `.dev-verification-code.log`

### 微信小程序 (Workbuddy 完成)
- [x] 登录页（手机验证码+微信一键登录模拟）
- [x] 首页（5 秒轮询动画状态 + 孩子信息 + 段位）
- [x] 动画组件（4 种状态：idle/learning/challenging/exercising）
- [x] 学习汇总页（单词数/耗时/正确率/错词列表）
- [x] 历史汇总页
- [x] 孩子档案页
- [x] LAN IP 配置：`192.168.31.57:3000`（Wi-Fi 切换后需更新 `services/config.ts`）

## 六、待完成

### 高优先级
- [ ] **词库补全**：当前仅有一上(100词完整)、一下(31词)、二上(33词)，缺二下~六下共 10 个学期
  - 方案 A：用户买 PDF 词表 → AI OCR 提取 → 批量导入
  - 方案 B：在管理后台手动录
  - 方案 C：提供的文本文件 → AI 批量导入

### 中优先级
- [ ] **部署上线**：当前仅 localhost，需上公网
  - Vercel 一键部署 Web 端 + Supabase/Neon 托管 PostgreSQL
  - 小程序需配置正式域名 + HTTPS + 备案
- [ ] **音频替换**：当前 Web Speech API，后续可从管理端上传真人录音替换
- [ ] **小程序真实微信授权**：当前为 mock 模式，需配置 WECHAT_APPID/SECRET

### 低优先级
- [ ] 家长端动画实际 Lottie/CSS 素材（当前为文字标签+SVG 占位）
- [ ] 视频存储迁移 OSS/S3
- [ ] 教师角色（当前管理员=老师）
- [ ] 多教材支持（当前仅牛津上海版）

## 七、技术架构

```
Next.js 16 (App Router) + TypeScript strict
├── Prisma 5 ORM → PostgreSQL 16 (localhost:5432/spellmaster)
├── NextAuth.js v4 (Credentials Provider + JWT)
├── Tailwind CSS 4
├── Web Speech API (音频，可替换)
└── 本地文件存储 (视频/头像，可替换)
```

### 关键文件索引

```
src/
├── lib/
│   ├── prisma.ts              # Prisma 单例
│   ├── auth.ts                # NextAuth 配置
│   ├── auth-helpers.ts        # getSession/getCurrentUser
│   ├── audio-service.ts       # Web Speech 封装（可替换）
│   ├── rank-service.ts        # 段位逻辑+榜单+出题
│   ├── session-service.ts     # 学习会话管理
│   ├── parent-auth.ts         # 家长 JWT 验证
│   └── verification-codes.ts  # 验证码存储
├── app/
│   ├── api/auth/[...nextauth]/ # NextAuth 路由
│   ├── api/session/            # 会话 API (POST创建/DELETE结束)
│   ├── api/admin/upload-avatar/ # 头像上传
│   ├── api/admin/upload-video/  # 视频上传
│   ├── api/v1/parent/          # 家长小程序 7 个 API
│   ├── admin/                  # 管理后台 (layout+概览+词库+学生)
│   ├── student/units/          # 学习流程+拼写+挑战
│   ├── student/leaderboard/    # 排行榜
│   └── login/                  # 登录页
├── components/
│   ├── VideoPlayer.tsx         # 视频播放器
│   ├── SpellingPractice.tsx    # 逐题拼写
│   ├── ResultAnimation.tsx     # A/B/C/D 动画弹窗
│   ├── PracticeResult.tsx      # 成绩详情+错词
│   ├── UnitLearningFlow.tsx    # 学习流程状态机
│   ├── WordsManager.tsx        # 词库管理
│   ├── StudentsManager.tsx     # 学生管理
│   ├── LeaderboardClient.tsx   # 榜单
│   └── ...
└── types/next-auth.d.ts       # NextAuth 类型扩展

prisma/
├── schema.prisma              # 11 张表完整定义
└── seed.ts                    # 种子数据
```

### 数据库表

Textbook → Grade → Unit → Word + Video
User → LessonRecord / SpellingAttempt / UnitChallenge / RankHistory / LearningSession

## 八、已知注意事项

1. **Wi-Fi IP 会变**：小程序 `services/config.ts` 里的 `BASE_URL` 需同步更新（`ipconfig getifaddr en0` 查）
2. **Next.js 16**：middleware 已废弃（用 proxy 替代），当前未使用中间件，鉴权在页面级
3. **Prisma 5**：不要升 Prisma 7，API 不兼容。当前版本 `5.22.0`
4. **构建**：`tsconfig.json` 排除了 `prisma/` 目录（seed 文件类型不兼容）
5. **验证码**：开发环境同时打控制台 + `.dev-verification-code.log` 文件
6. **Chrome 打开**：用户偏好用 Chrome 而非默认浏览器，`open -a "Google Chrome" <url>`
7. **夸克浏览器**：已知兼容问题（fixed 布局 + autoFocus），不修复
8. **SpellingPractice 第二次 Enter**：输入框 disabled 后通过 document.addEventListener 全局监听 Enter
9. **LessonRecord 唯一约束**：attemptCount 由服务端计算，避免客户端重传冲突
10. **段位计算**：管理后台有"重新计算段位"按钮，遍历所有记录校准

## 九、恢复工作流程

1. 打开终端
2. `cd /Users/lujun/Desktop/spellmaster`
3. `brew services start postgresql@16`（如果数据库没跑）
4. `pnpm dev`
5. 浏览器打开 `http://localhost:3000`
6. 告诉 AI："读 SpellMaster-Handoff.md，继续工作"
