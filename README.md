# SpellMaster · K12 英语学习平台（CET6 改造前快照）

> **📌 版本说明**
> 本仓库是 SpellMaster 的 **CET6 复习台改造之前** 的 K12 原版快照，用于对照与回滚。
> CET6 版本见 **[spellmaster](https://github.com/lujun2016/spellmaster)**。
>
> - 快照整理：2026-10-17
> - 构建验证：`pnpm build` 通过（Next.js 16）
> - 对应 tag：`v0.1-k12`
> - 微信小程序端在 `miniprogram/`

---

## 这是什么

一个面向 K12 英语单词学习的多角色 SaaS：

| 角色 | 能做什么 |
|---|---|
| **学生** | 按教材单元闯关背单词、拼写练习、错词重练、看排行榜 |
| **家长** | 微信/手机号登录，查看孩子的学习状态、会话摘要、动画状态 |
| **老师/管理员** | 管理教材、年级、单元、单词库、视频；管理学生；上传头像与视频 |

激励机制：单元闯关 + 段位体系 + 排行榜（`RankHistory`）。

## 技术栈

- **Next.js 16**（App Router）+ React 19
- **Prisma 5** + SQLite
- **NextAuth**（微信登录 / 手机号验证码）
- **Tailwind CSS 4**

## 数据模型（`prisma/schema.prisma`）

`Textbook` · `Grade` · `Unit` · `Word` · `Video` · `User` · `LessonRecord` · `SpellingAttempt` · `UnitChallenge` · `RankHistory` · `LearningSession`

## 主要路由

```
/login                      登录
/student/units              学生：单元列表
/student/units/[unitId]     学生：单元闯关
/student/leaderboard        学生：排行榜
/admin                      管理后台
/admin/students             学生管理
/admin/words                单词库管理
/api/v1/parent/auth/*       家长端登录（验证码 / 微信）
/api/v1/parent/child/*      家长端：状态 / 摘要 / 动画状态
/api/auth/[...nextauth]     认证
```

## 本地运行

```bash
pnpm install
# 1) 在 .env 里把 DATABASE_URL 指向本仓库的 K12 数据库，例如：
#    DATABASE_URL="file:./prisma/dev.db"
# 2) 初始化数据库
pnpm exec prisma db push
pnpm exec prisma db seed     # 可选：导入词库
# 3) 启动
pnpm dev
```

打开 http://localhost:3000。

> ⚠️ 如果你是从 CET6 版复制过来的 `.env`，里面的 `DATABASE_URL` 可能指向 CET6 的库，
> 跑本快照前务必改成上面的 K12 库，否则会读到不相关的数据。

## 目录

```
src/app/            路由（student / admin / login / api）
src/components/     UI 组件
src/lib/            工具与认证
prisma/             数据模型、迁移、种子
public/             静态资源
miniprogram/        微信小程序端
```

## 构建验证

```bash
pnpm build   # 2026-10-17 实测通过，路由表完整
```

## 许可证

未指定（私有仓库）。
