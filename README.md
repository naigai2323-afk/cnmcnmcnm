# factory-dashboard

工厂经营数据驾驶舱 MVP，基于 `Next.js`、`TypeScript`、`TailwindCSS`、`Prisma`、`PostgreSQL`、`Recharts`、`ExcelJS`。

当前版本已经适配本地开发，也适合作为 `Vercel + Supabase` 的部署版本。

## 功能范围

- 登录系统：`admin / manager / staff` 角色结构预留
- 首页经营驾驶舱：订单、采购、收货、生产、人员、人工成本、利润、异常提醒
- 采购、仓库收货、订单、生产领料、生产入库、订单出库、员工、考勤、成本参数通用 CRUD
- Excel 模板下载、导入预览、确认导入、导出筛选结果、导出全部
- 每日成本核算：自动读取材料、人工、订单、出库和成本参数
- 飞书 webhook、DeepSeek 解析函数、AI 待审核页面、钉钉目录预留

## 本地安装

```bash
npm install
```

Windows PowerShell 如果拦截 `npm.ps1`，使用：

```bash
npm.cmd install
```

## 环境变量

复制 `.env.example` 为 `.env`。

### 本地 PostgreSQL / Docker

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/factory_dashboard?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/factory_dashboard?schema=public"
SESSION_SECRET="please-change-this-secret"
DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
```

### Supabase

推荐使用两条连接串：

- `DATABASE_URL`：运行时连接，优先填 Supabase pooler 连接串
- `DIRECT_URL`：Prisma migrate 使用，填 Supabase 直连数据库连接串

示例：

```env
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
SESSION_SECRET="replace-with-a-long-random-secret"
DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
```

## 初始化数据库

### 本地 Docker

```bash
docker compose up -d
npm run prisma:migrate
npm run seed
```

停止本地数据库：

```bash
docker compose down
```

### 本地已有 PostgreSQL

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

如果开发阶段不想生成迁移文件，也可以：

```bash
npm run prisma:push
npm run seed
```

## 启动本地开发

```bash
npm run dev
```

打开 [http://localhost:3000/login](http://localhost:3000/login)

测试账号：

- 邮箱：`admin@example.com`
- 密码：`admin123456`

## Vercel + Supabase 部署

这套项目可以直接部署在 `Vercel + Supabase`。

### 部署步骤

1. 在 Supabase 创建项目。
2. 进入 `Project Settings -> Database`，拿到：
   - pooler 连接串
   - direct connection 连接串
3. 在 Vercel 导入本仓库。
4. 在 Vercel 项目环境变量中配置：
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `SESSION_SECRET`
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_BASE_URL`
   - `DEEPSEEK_MODEL`
5. 首次部署前，在本地或 CI 执行：

```bash
npm run prisma:deploy
```

6. 如需初始化演示数据，再执行：

```bash
npm run seed
```

### Vercel 侧说明

- 项目已添加 `vercel.json`
- 构建命令为 `npm run vercel-build`
- 安装完成后会自动执行 `prisma generate`

### 推荐实践

- 线上不要执行 `prisma migrate dev`
- 线上使用 `npm run prisma:deploy`
- `seed` 只建议在演示环境或首次初始化时手动执行
- `SESSION_SECRET` 请使用足够长的随机字符串

## 页面路径

- `/login`
- `/dashboard`
- `/purchases`
- `/warehouse/receipts`
- `/orders`
- `/production/materials`
- `/production/stock-ins`
- `/shipments`
- `/employees`
- `/attendance`
- `/costs/settings`
- `/costs/daily`
- `/import-export`
- `/settings`
- `/ai/review`
- `/api/health`

## 健康检查

部署后可以直接访问：

```bash
/api/health
```

返回 `200` 说明应用和数据库都可用；返回 `503` 说明应用起来了，但数据库连接异常。

## Excel 导入导出

每个业务模块右上角提供：

- 新增
- 导入 Excel
- 导出筛选
- 导出全部
- 下载模板

导入流程：

1. 下载模板
2. 填写中文表头数据
3. 上传 Excel
4. 页面预览并提示错误行
5. 确认后写入数据库

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:push
npm run seed
```

## GitHub 推送授权

如果你希望我直接把代码推到 GitHub，需要满足其中一种：

1. 当前 Codex 的 GitHub 连接对目标仓库有 `push` 权限
2. 本机安装了 `git` 或 `gh`，并且已经登录你的 GitHub 账号

你当然可以在本地登录 GitHub 账号。

常见方式：

```bash
gh auth login
```

或者先安装 Git，再使用：

```bash
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

如果你把本机 `git`/`gh` 装好，或者把 Codex GitHub 连接的仓库写权限打开，我就可以继续帮你推送。
