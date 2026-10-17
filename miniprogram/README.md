# 家长微信小程序（spellmaster-parent）

小学生英语单词拼写平台的**家长端微信小程序**，由 WorkBuddy 在 Claude 完成 Web 端后接手开发。
孩子（学生）在桌面 Web 端学习，家长在本小程序查看孩子的实时学习状态、动画与学习汇总。

---

## 一、技术选型说明

- **框架**：微信原生小程序（WXML / WXSS / TS），非 Taro / uni-app。
- **语言**：TypeScript（strict 模式），与 Web 端保持一致的类型安全约定。
- **无重型 UI 库**：仅用原生组件 + 自写 CSS 动画，符合文档 14.5「不引入非必要依赖」。
- **不出现 emoji**：遵守文档 14.1 用户偏好，动画全部以 CSS 图形 + 文字标签表现。

> 为何选原生而非 Taro：文档中“微信小程序”按字面实现，原生方案零额外运行时依赖，
> 可直接在微信开发者工具中编译运行；数据交互通过复用 Web 端已实现的 REST 接口完成，
> 与框架无关，故不影响与 Web 端的一致性。

---

## 二、目录结构

```
spellmaster-miniprogram/
├── app.ts / app.json / app.wxss      # 小程序入口、页面与 tabBar 配置、全局样式
├── project.config.json              # 开发者工具项目配置（已设 urlCheck:false、touristappid）
├── tsconfig.json                    # TypeScript strict 配置
├── pages/
│   ├── login/                       # 手机号 + 验证码登录
│   ├── home/                        # 学习动态：孩子信息 + 状态动画 + 轮询
│   ├── summary/                     # 本次学习汇总（错词 / 挑战 / 耗时）
│   ├── history/                     # 历史学习汇总列表
│   └── profile/                     # 学习档案（段位 / 退出）
├── components/
│   ├── animations/child-animation/  # 四种学习状态动画（idle/learning/challenging/exercising）
│   └── rank-badge/                  # 段位徽章（复用 getRankDisplayName）
├── services/
│   ├── config.ts                    # BASE_URL / API_PREFIX
│   ├── request.ts                   # 统一请求封装（Bearer 鉴权 + 错误解析）
│   └── parent.ts                    # 家长接口封装（对齐第十一章）
├── utils/
│   ├── rank.ts                      # getRankDisplayName（与 Web 端 lib/rank-service 完全一致）
│   ├── storage.ts                   # token / child 本地存储
│   └── time.ts                      # 时长 / 日期格式化
└── types/index.ts                   # 所有接口响应类型（对齐 Web 端真实返回结构）
```

---

## 三、如何运行（微信开发者工具）

1. 打开**微信开发者工具** → 导入项目 → 选择本目录 `spellmaster-miniprogram`。
2. AppID 已设为 `touristappid`（测试号），可直接预览；正式发布请替换为你的小程序 AppID。
3. 确保 **Web 端（spellmaster）已在运行**（`localhost:3000`），且数据库已就绪。
4. 在开发者工具右上角「详情 → 本地设置」勾选：
   **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**。
5. 修改 `services/config.ts` 中的 `BASE_URL`：
   - 模拟器预览：`http://localhost:3000`
   - 真机预览：改为开发机局域网 IP，如 `http://192.168.1.10:3000`
6. 编译运行 → 登录方式二选一：
   - **手机号 + 验证码**：用「登记在孩子账号上的家长手机号」收验证码登录。
     （开发环境验证码会打印在 **Web 后端终端**，接口 `send-code` 控制台输出。）
   - **微信一键登录**：见下方「六、微信手机号一键登录」。

---

## 四、接口对接（严格对齐 Web 端第十一章）

所有请求前缀 `/api/v1`，家长接口均需在 Header 携带 `Authorization: Bearer <token>`（登录接口除外）。

| 小程序调用 | 对应接口 | 说明 |
|---|---|---|
| 登录-发码 | `POST /parent/auth/send-code` | body `{phone}` |
| 登录-校验 | `POST /parent/auth/verify` | body `{phone, code}` → 返回 `token` + `child` |
| 微信登录 | `POST /parent/auth/wechat` | 生产 `{phoneCode, loginCode}`；开发模拟 `{mockPhone}` → 返回结构同 `verify` |
| 状态 | `GET /parent/child/status` | 在线/离线、state、hasNewSummary |
| 动画 | `GET /parent/child/animation-state` | `animationType`: idle/learning/challenging/exercising |
| 本次汇总 | `GET /parent/child/session-summary` | 错词、挑战结果、耗时；无数据返回 `{sessionId:null}` |
| 历史汇总 | `GET /parent/child/previous-summaries?limit=` | 历史列表 |
| 档案 | `GET /parent/child/profile` | 姓名、年级、当前段位 |

**重要：响应格式以 Web 端实际实现为准**
文档 10.1 描述的 `{success,data,error}` 包装在家长接口中**并未采用**。
实际约定为：成功时直接返回数据对象；失败时返回 `{error:"..."}` 且 HTTP 状态码 ≥ 400。
`services/request.ts` 已按此实现（检测 `statusCode>=400` 或 `body.error`），请勿套用文档的包装格式。

---

## 五、与 Web 端的一致性

- **接口复用**：小程序不发任何自有业务数据，全部读取 Web 端写入的数据库（学习记录、会话、段位）。
- **段位逻辑统一**：`utils/rank.ts` 的 `getRankDisplayName(rankValue)` 与
  Web 端 `src/lib/rank-service.ts` 实现逐字一致，段位名称不会出现两端不一致。
- **鉴权一致**：家长 token 由 Web 端 `lib/parent-auth.ts` 签发（JWT，7 天有效，secret 同 `NEXTAUTH_SECRET`），
  小程序仅做存储与透传。

---

## 六、微信手机号一键登录

已实现文档 7.1 的「微信手机号授权」登录方式，与手机号验证码登录**共用同一套 token/child 契约**
（后端 `POST /parent/auth/wechat` 返回结构与 `verify` 完全一致）。

### 6.1 两种运行模式

由 **后端是否配置微信凭据**（`spellmaster/.env` 的 `WECHAT_APPID` / `WECHAT_SECRET`）自动切换：

| 模式 | 触发条件 | 小程序端表现 | 请求体 |
|---|---|---|---|
| **开发模拟** | 后端未配置微信凭据（默认） | 登录页显示「微信一键登录（开发模拟）」，点按弹框手动输入手机号 | `{mockPhone}` |
| **生产真实** | 后端已填真实 AppID/Secret | 显示「微信手机号一键登录」，走 `open-type="getPhoneNumber"` 授权 | `{phoneCode, loginCode}` |

小程序端由 `services/config.ts` 的 `WECHAT_MOCK` 控制按钮形态：
- `WECHAT_MOCK = true`（默认）：配合后端开发模拟模式，无需真实小程序资质即可联调。
- `WECHAT_MOCK = false`：生产环境，需正式已认证小程序 + 后端真实凭据。

### 6.2 生产上线步骤

1. 在 `spellmaster/.env` 填入真实 `WECHAT_APPID`、`WECHAT_SECRET`。
2. 将 `services/config.ts` 的 `WECHAT_MOCK` 改为 `false`。
3. `project.config.json` 的 `appid` 换成正式小程序 AppID（`touristappid` 无法调用手机号能力）。
4. 真实授权流程：小程序 `getPhoneNumber` 回调拿 `phoneCode` + `wx.login` 拿 `loginCode`
   → 后端用 `phoneCode` 换手机号、用 `loginCode` 换 `openid` 并回填 `User.parentWechatId`。

> 说明：新版「手机号快速验证」按调用次数计费，且要求小程序为**非个人主体的已认证正式版**。

---

## 七、已知约束 / 待办

- **gradeLevel 仅为数字**：家长接口返回 `gradeLevel` 为整数（如 1、2…），未含年级名称，
  小程序按「等级 N」展示；如需显示“一年级上”需 Web 端家长接口补充。
- 历史详情：当前 Web 端仅提供「最新一次汇总」详情，历史仅列表，故小程序历史页为列表视图。

---

## 八、类型检查

```bash
npm install          # 安装 @types/wechat-miniprogram + typescript
npm run typecheck    # tsc --noEmit，strict 模式零错误
```
