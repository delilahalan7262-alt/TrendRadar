# Task Radar MVP

一个基于 **Next.js + React + Tailwind CSS + TypeScript** 的轻量级任务清单 Web 应用。当前版本优先保证 **本地可运行**，核心能力已经覆盖：任务列表、任务弹窗、新增/编辑/删除/完成/星标、基础筛选、页面提醒、浏览器通知提醒，以及本地 JSON 持久化。

## 当前已完成功能

- 任务列表主页面
- 新建 / 编辑任务弹窗
- 新增 / 编辑 / 删除 / 完成 / 取消完成 / 星标
- 本地 JSON 持久化（`.data/tasks.json`）
- 提醒时间字段
- 页面内提醒弹窗
- Notification API 浏览器通知
- 基础筛选：全部、待处理、已完成、星标、今日任务
- 搜索标题 / 描述 / 标签
- REST API（后续可接 Supabase / ChatGPT 工具调用）

## 技术栈

- Next.js 15
- React 19
- Tailwind CSS
- TypeScript
- 本地 JSON 持久化（MVP 默认）
- Supabase PostgreSQL 初始化 SQL（已预留，便于后续切换）

## 本地启动

### 1）安装依赖

```bash
npm install
```

### 2）启动开发环境

```bash
npm run dev
```

### 3）打开浏览器

访问：<http://localhost:3000>

## 本地如何测试功能

### 测试任务列表 / 新建任务

1. 打开首页。
2. 点击右上角 **“新建任务”**。
3. 输入标题，保存后应立即出现在任务列表中。
4. 点击卡片右侧按钮可继续测试：
   - ⭐ 星标 / 取消星标
   - ✅ 完成 / 取消完成
   - ✏️ 编辑
   - 🗑️ 删除

### 测试提醒弹窗

有两种最快方式：

#### 方式 A：一键创建测试提醒

1. 首页右侧点击 **“创建 1 分钟测试提醒”**。
2. 等待约 1 分钟。
3. 前端轮询每 30 秒检查一次，所以通常会在 **1 分钟到 1 分 30 秒左右** 出现提醒。
4. 页面右上角会弹出提醒卡片。

#### 方式 B：手动创建提醒任务

1. 点击 **“新建任务”**。
2. 开启 **“开启提醒”**。
3. 将提醒时间设置为当前时间后 1~2 分钟。
4. 保存后等待提醒触发。

### 测试浏览器通知

1. 点击首页右上区域的 **“开启浏览器通知”**。
2. 在浏览器弹窗中选择 **允许**。
3. 创建一个 1 分钟后的提醒任务。
4. 当提醒触发时：
   - 页面内会出现提醒卡片；
   - 浏览器系统通知也会弹出（取决于浏览器和操作系统是否允许通知）。

### 测试“稍后提醒”

当提醒卡片弹出后：

- 点击 **“稍后10分钟”**：任务会写入新的 `snooze_until`
- 点击 **“稍后30分钟”**：任务会延后 30 分钟再次提醒
- 点击 **“完成任务”**：任务会变成已完成，不再提醒
- 点击 **“查看任务”**：页面会滚动定位到该任务并高亮

## 数据存储说明

- 当前 MVP 默认使用 `.data/tasks.json` 存储任务。
- 首次启动后，系统会自动生成示例任务数据。
- 不需要先配置 Supabase，就可以完整跑通本地 MVP。

## REST API

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/complete`
- `POST /api/tasks/:id/uncomplete`
- `POST /api/tasks/:id/star`
- `POST /api/tasks/:id/unstar`
- `POST /api/tasks/:id/snooze`
- `GET /api/tasks/reminders/due`

## 后续切换到 Supabase

如果后续需要改为 Supabase PostgreSQL：

1. 在 Supabase SQL Editor 中执行 `scripts/supabase-init.sql`
2. 将 `lib/tasks-store.ts` 替换为 Supabase 数据访问实现
3. 再补充环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
