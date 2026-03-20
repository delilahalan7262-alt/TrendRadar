# MCP Debugging Guide

## 1. 如何本地验证 MCP server 是否启动成功

先运行：

```bash
npm run dev:mcp
```

然后检查：

- 终端是否输出监听地址
- 打开 `http://127.0.0.1:3333/` 是否返回健康检查 JSON
- 运行 `npm run test:mcp` 是否能列出工具并调用 `list_tasks`

## 2. 如何排查 `/mcp` 无法访问

优先检查：

1. MCP server 是否真的启动
2. 端口是否为 `3333`
3. 访问的是否是 `/mcp` 而不是根路径 `/`
4. 本地防火墙是否拦截端口
5. 隧道工具是否指向正确端口

## 3. 如何排查 connector 无法识别 tools

常见原因：

- 使用了 HTTP，而不是 HTTPS 公网地址
- Tunnel 指到了 Web UI 的 3000 端口，而不是 MCP 的 3333 端口
- Connector URL 没有带 `/mcp`
- MCP server 重启后，Connector 仍缓存旧 metadata

建议处理顺序：

1. 先本地跑通 `npm run test:mcp`
2. 再通过 tunnel 暴露 `3333`
3. 确认公网地址后缀是 `/mcp`
4. 回到 ChatGPT 重新保存 Connector

## 4. 如何排查 tool schema 问题

如果 ChatGPT 能连上 Connector，但工具参数经常报错，重点检查：

- `mcp/types.ts` 中的 Zod schema 是否与实际 handler 参数一致
- tool 名称是否与文档一致
- `create_task` / `update_task` 的字段是否仍保持 camelCase
- 是否误把 `taskId` 写成 `id`

## 5. 如何排查 ChatGPT 连接成功但不会调用工具

可以按下面顺序确认：

1. 先问一个明显需要工具的问题，例如：`列出今天未完成的任务`
2. 看 MCP server 日志里是否出现请求
3. 确认 tool 描述足够清晰，能让模型理解用途
4. 确认 Connector 连接的是最新 tunnel URL
5. 如果最近改过 tool schema，刷新 Connector metadata

## 6. 如何查看服务端日志

### Web UI / REST API 日志

运行 `npm run dev:web` 的终端中，可查看 Next.js 与 `/api/tasks/*` 的输出。

### MCP server 日志

运行 `npm run dev:mcp` 的终端中，可查看：

- 服务启动日志
- MCP session 初始化日志
- 会话关闭日志
- tool 错误日志
- transport 错误日志

## 7. 推荐排错最短路径

如果你只想快速确认链路是否正常：

1. `npm run dev:mcp`
2. 浏览器打开 `http://127.0.0.1:3333/`
3. `npm run test:mcp`
4. `ngrok http 3333`
5. 在 ChatGPT Connector 中填入 `https://xxxx.ngrok-free.app/mcp`
6. 发送：`列出今天未完成的任务`
