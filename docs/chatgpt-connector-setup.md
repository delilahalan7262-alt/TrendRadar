# ChatGPT Connector Setup

本文档用于帮助你把本地 Task Radar Web UI + MCP server 跑起来，并通过 ngrok 或 Cloudflare Tunnel 暴露 `/mcp` 给 ChatGPT Connector 测试。

## 1. 本地启动 Web UI

```bash
npm install
npm run dev:web
```

默认 Web UI 地址：

- `http://localhost:3000`

## 2. 本地启动 MCP server

新开一个终端：

```bash
npm run dev:mcp
```

默认 MCP 地址：

- `http://127.0.0.1:3333/mcp`

> 如果你希望同时启动 Web UI 和 MCP server，可直接运行：
>
> ```bash
> npm run dev
> ```

## 3. 如何确认 `/mcp` endpoint 正常

### 方式 A：看启动日志

启动 `npm run dev:mcp` 后，终端应输出类似：

```text
[mcp] Task Radar MCP server listening at http://127.0.0.1:3333/mcp
```

### 方式 B：访问根路径健康检查

打开：

- `http://127.0.0.1:3333/`

应返回包含 `endpoint: "/mcp"` 的 JSON。

### 方式 C：运行 MCP 自测脚本

```bash
npm run test:mcp
```

该脚本会连接本地 MCP server，列出可用 tools，并调用一次 `list_tasks`。

## 4. 用 ngrok 暴露本地 MCP 服务

### 安装并登录 ngrok

参考 ngrok 官方说明完成安装和认证。

### 暴露 MCP 端口

```bash
ngrok http 3333
```

你会得到一个 HTTPS 地址，例如：

- `https://your-subdomain.ngrok-free.app`

那么你的 MCP URL 就是：

- `https://your-subdomain.ngrok-free.app/mcp`

## 5. 用 Cloudflare Tunnel 暴露本地 MCP 服务

### 安装 cloudflared

完成 Cloudflare Tunnel 安装与登录。

### 快速暴露端口

```bash
cloudflared tunnel --url http://127.0.0.1:3333
```

拿到 HTTPS 域名后，你的 MCP URL 为：

- `https://random-name.trycloudflare.com/mcp`

## 6. 在 ChatGPT 中创建 Connector

进入：

- `Settings` → `Connectors` → `Create`

建议填写：

### Connector name
- `Task Radar Local MCP`

### Description
- `Local task management MCP server for listing, creating, updating, completing, and snoozing personal tasks.`

### URL
填写你刚刚通过 ngrok 或 Cloudflare Tunnel 拿到的 HTTPS MCP URL，例如：

- `https://your-subdomain.ngrok-free.app/mcp`

## 7. 如何验证 tools 已被识别

Connector 创建完成后，在 ChatGPT 中尝试输入：

- `列出今天未完成的任务`
- `创建一个明天下午 3 点提醒的任务：跟进 Google Ads 开户资料`
- `把某条任务改成高优先级`
- `将某条任务延后 30 分钟`
- `完成某条任务`

如果 Connector 已识别成功，ChatGPT 应能看到并调用这些工具：

- `list_tasks`
- `create_task`
- `update_task`
- `complete_task`
- `snooze_task`

## 8. tools 变化后如何刷新 metadata

当你修改了 MCP tool 名称、描述或 schema 后：

1. 重启本地 MCP server
2. 重启 ngrok / Cloudflare Tunnel（如果地址变化）
3. 回到 ChatGPT Connector 设置页，重新保存或刷新该 Connector
4. 再次让 ChatGPT 调用工具，确认新 metadata 已被识别

## 9. 当前推荐开发流程

1. `npm run dev:web`
2. `npm run dev:mcp`
3. `npm run test:mcp`
4. `ngrok http 3333` 或 `cloudflared tunnel --url http://127.0.0.1:3333`
5. 在 ChatGPT 里创建 Connector，并把 HTTPS `/mcp` URL 填进去
