# Task Radar v3 MCP Preview

Task Radar 现在同时包含：

1. **可继续本地运行的 Web UI**
2. **可继续使用的 REST API**
3. **一个真正可启动的 Node MCP server 雏形**
4. **可通过 `/mcp` 暴露给 ChatGPT Connector 的最小工具集**

本轮重点不是做新页面，而是把当前任务系统整理成：**下一步可以通过 HTTPS 暴露本地 MCP 服务，并在 ChatGPT Connectors 中创建连接进行测试**。

## 当前能力

- Web UI：任务列表、新建、编辑、删除、完成、星标、提醒
- REST API：任务 CRUD + complete / uncomplete / star / unstar / snooze / due reminders
- 本地 JSON 数据层：通过 repository / service 分层管理
- MCP server：独立 Node 进程，默认暴露 `/mcp`
- MCP tools：`list_tasks`、`create_task`、`update_task`、`complete_task`、`snooze_task`
- Connector / tunnel / 调试文档

## 目录结构

```text
app/api/tasks/*              REST API
components/*                 Web UI 组件
hooks/*                      前端提醒逻辑
repositories/*               数据访问层
services/*                   业务服务层
types/*                      统一任务模型
validators/*                 输入校验
mcp/server.ts                MCP 入口
mcp/create-server.ts         MCP server 构造
mcp/tools/*                  MCP tools
mcp/types.ts                 MCP tool schema
scripts/test-mcp.ts          MCP 本地验证脚本
docs/*                       Connector / MCP / 部署文档
```

## 本地先运行哪几个命令

### 只跑 Web UI

```bash
npm install
npm run dev:web
```

Web UI 地址：

- `http://localhost:3000`

### 只跑 MCP server

```bash
npm install
npm run dev:mcp
```

MCP 地址：

- `http://127.0.0.1:3333/mcp`

### 同时跑 Web UI + MCP

```bash
npm install
npm run dev
```

## package scripts 说明

- `npm run dev`：同时启动 Web UI 和 MCP server
- `npm run dev:web`：只启动 Next.js Web UI
- `npm run dev:mcp`：只启动 Node MCP server
- `npm run build`：构建 Next.js Web UI
- `npm run start`：启动 Next.js 生产服务
- `npm run test:mcp`：连接本地 MCP server 并验证 tools

## 哪一个 URL 是 `/mcp`

默认本地 MCP endpoint：

- `http://127.0.0.1:3333/mcp`

> 注意：当前 MCP server 与 Next.js Web UI **分开跑**。
> - Web UI 默认端口：`3000`
> - MCP server 默认端口：`3333`

## 本地如何验证 Web UI 正常

1. 运行 `npm run dev:web`
2. 打开 `http://localhost:3000`
3. 测试新建、编辑、删除、完成、星标
4. 测试提醒：点击 **“创建 1 分钟测试提醒”**

## 本地如何验证 REST API 正常

1. 运行 `npm run dev:web`
2. 请求：`GET http://localhost:3000/api/tasks`
3. 应返回统一格式：

```json
{
  "success": true,
  "data": [],
  "error": null
}
```

## 本地如何验证 MCP tools 正常

1. 运行 `npm run dev:mcp`
2. 新开终端执行：

```bash
npm run test:mcp
```

该脚本会：

- 连接 `http://127.0.0.1:3333/mcp`
- 列出当前可用 tools
- 调用一次 `list_tasks`

## 当前 MCP tools

- `list_tasks`
- `create_task`
- `update_task`
- `complete_task`
- `snooze_task`

这些 tools 均复用现有：

- `services/tasks-service.ts`
- `repositories/tasks-repository.ts`

因此 Web UI、REST API、MCP tools 共享同一套核心业务逻辑。

## 我下一步如何用 ngrok 或 Cloudflare Tunnel 暴露给 ChatGPT 使用

### 用 ngrok

```bash
ngrok http 3333
```

假设得到：

- `https://your-subdomain.ngrok-free.app`

那么要填给 ChatGPT Connector 的 MCP URL 是：

- `https://your-subdomain.ngrok-free.app/mcp`

### 用 Cloudflare Tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:3333
```

假设得到：

- `https://random-name.trycloudflare.com`

那么要填给 ChatGPT Connector 的 MCP URL 是：

- `https://random-name.trycloudflare.com/mcp`

## ChatGPT Connector 接入文档

请按下面文档继续：

- `docs/chatgpt-connector-setup.md`
- `docs/mcp-debugging.md`
- `docs/mcp-tools-plan.md`
- `docs/deployment-plan.md`

## 推荐测试提示词

在 ChatGPT Connector 接好后，可以先测试这些提示词：

- `列出今天未完成的任务`
- `创建一个明天下午 3 点提醒的任务：跟进 Google Ads 开户资料`
- `把某条任务改成高优先级`
- `将某条任务延后 30 分钟`
- `完成某条任务`
