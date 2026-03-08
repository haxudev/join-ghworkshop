# GitHub Copilot Workshop 自助加入工具

> 基于 [Next.js](https://nextjs.org) 构建的自助服务应用，让参与者快速获取 GitHub Copilot Business 试用权限并加入工作坊团队。

---

## 功能概览

- **一键加入** — 输入 GitHub 用户名即可收到组织团队邀请
- **成员列表** — 实时展示已加入的成员，支持搜索筛选
- **操作指南** — 内置图文引导，手把手完成注册流程
- **自动化管理** — 通过 GitHub API 自动发送邀请，无需管理员手动操作

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# GitHub API 配置
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_ORG_NAME=your_organization_name
GITHUB_TEAM_NAME=your_team_name

# 访问保护
ACCESS_CODE=your_6_digit_access_code
SESSION_SECRET=your_long_random_session_secret
```

> 各变量的获取方式见下方 [环境变量详解](#环境变量详解)。

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

---

## 环境变量详解

| 变量名 | 必填 | 说明 |
|---|:---:|---|
| `GITHUB_TOKEN` | 是 | GitHub 个人访问令牌（PAT） |
| `GITHUB_ORG_NAME` | 是 | GitHub 组织名称 |
| `GITHUB_TEAM_NAME` | 是 | 组织中的团队 slug |
| `ACCESS_CODE` | 是 | 工作坊访问码，仅在服务端读取，切勿使用 `NEXT_PUBLIC_` 前缀 |
| `SESSION_SECRET` | 建议 | 会话签名密钥，建议使用长度 32 位以上随机字符串 |

### `GITHUB_TOKEN` — 个人访问令牌

用于调用 GitHub API 管理组织成员和团队。

**获取步骤：**

1. 打开 GitHub → 右上角头像 → **Settings**
2. 左侧菜单最底部 → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
3. 点击 **Generate new token**
4. 设置 **Token name**、**Expiration**（过期时间）
5. **Resource owner** 选择你的组织（如 `dongjwComapany`）
6. 在 **Organization permissions** 中授予：
   - **Members** → Read and write
   - **Administration** → Read and write
7. 点击 **Generate token**，复制生成的令牌

> 直达链接：https://github.com/settings/personal-access-tokens/new

### `GITHUB_ORG_NAME` — 组织名称

你的 GitHub 组织的登录名（不是显示名称）。

**获取步骤：**

1. 打开 https://github.com/settings/organizations
2. 找到目标组织，其名称即为 `GITHUB_ORG_NAME`
3. 也可以从组织主页 URL 获取：`https://github.com/<组织名>` 中的 `<组织名>` 部分

### `GITHUB_TEAM_NAME` — 团队 Slug

组织中用于接收工作坊成员的团队标识（slug）。

**获取步骤：**

1. 打开 `https://github.com/orgs/<你的组织名>/teams`
2. 如果已有团队，点击进入团队页面，URL 中最后一段即为 slug
   - 例如：`https://github.com/orgs/dongjwComapany/teams/workshop` → slug 为 `workshop`
3. 如果还没有团队，点击 **New team** 创建一个，创建后使用该团队的 slug

> 注意：slug 是 URL 友好的名称（小写、连字符分隔），可能与团队显示名称不同。

---

## 用法指南

1. **输入 GitHub 用户名** — 在输入框中填写你的 GitHub 用户名（不是邮箱，不需要 @ 符号）
2. **点击「加入工作坊」** — 系统将自动发送团队邀请
3. **接受邀请：**
   - 前往 [GitHub](https://github.com)，进入组织页面
   - 找到邀请通知，点击 **Accept invitation**
   - 点击 **Join** 完成加入（不用勾选 "Ask for..."）
4. **开始使用** — 在 VS Code / Cursor 等编辑器中安装 GitHub Copilot 插件，登录 GitHub 即可

---

## 部署

### Azure Static Web Apps

本项目现在只保留一条生产部署链路：

- 生产站点：`joinworkshop.haxu.dev`
- Azure 资源：Static Web App `joinworkshop`
- 发布方式：推送到 `master` 后，由 GitHub Actions 自动发布到 SWA

#### 1. 一次性准备 Git 推送凭据

```bash
gh auth status
gh auth setup-git
```

如果 `gh auth status` 显示未登录，先执行 `gh auth login`。

#### 2. 配置 SWA 运行时环境变量

代码里的服务端 API 运行在 SWA 的托管后端里，所以要把运行时变量配置到 SWA 本身，而不是 App Service。

```bash
az staticwebapp appsettings set \
   --name joinworkshop \
   --resource-group haxuapps \
   --setting-names \
      GITHUB_TOKEN=xxx \
      GITHUB_ORG_NAME=xxx \
      GITHUB_TEAM_NAME=xxx \
      ACCESS_CODE=your_6_digit_access_code \
      SESSION_SECRET=generate_a_long_random_string_here
```

#### 3. 发布最新代码到生产

提交代码后，直接推送到 `master`：

```bash
npm run deploy:swa
```

这个脚本本质上执行的是：

```bash
git push origin master
```

#### 4. 无代码变更时重发当前生产版本

如果只是修改了 SWA 应用设置，或者想重新触发一次发布，不需要制造空提交：

```bash
npm run redeploy:swa
```

这会手动触发 [azure-static-web-apps.yml](.github/workflows/azure-static-web-apps.yml)。

#### 5. 部署约束

- 不再使用本地 `.azure-deploy/` App Service 打包目录。
- 不再使用 Azure App Service 作为 `joinworkshop.haxu.dev` 的生产发布目标。
- `joinworkshop.haxu.dev` 的运行时配置只在 SWA 上维护。

说明：

1. `ACCESS_CODE` 只在服务端校验，前端不会拿到该值。
2. `SESSION_SECRET` 用于给 `httpOnly` 会话 Cookie 签名，避免固定 Token 被重放。
3. 不要把访问码写进代码库，也不要使用 `NEXT_PUBLIC_ACCESS_CODE` 这类前缀。
4. 本地 `.env` 只用于开发和临时排障，不参与生产部署。

### 本地开发

本地开发仍然直接运行 Next.js：

```bash
npm run dev
```

---

## 技术栈

| 技术 | 版本 |
|---|---|
| Next.js | 15.2.2 |
| React | 19.0.0 |
| TypeScript | - |
| TailwindCSS | 4.x |
| Octokit | GitHub API 客户端 |

---

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) — 功能与 API 参考
- [学习 Next.js](https://nextjs.org/learn) — 交互式教程
