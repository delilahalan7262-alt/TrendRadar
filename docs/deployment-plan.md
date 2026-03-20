# Deployment Plan

## 1. 当前本地运行方式

当前版本可以完全依赖本地 JSON 文件运行：

```bash
npm install
npm run dev
```

访问 `http://localhost:3000` 后即可使用任务列表、提醒和 REST API。

## 2. 后续部署到公网所需条件

要把该项目部署到公网，至少需要：

- 一个可公开访问的域名或子域名
- 一个可长期运行 Next.js 的主机 / 平台
- 稳定的数据持久化方案（后续可切 Supabase / PostgreSQL）
- HTTPS 证书
- 可被外部系统访问的 API 地址

## 3. 为什么后续需要 HTTPS

如果未来要接入 ChatGPT connector 或更标准的 MCP / tool 调用链路，HTTPS 基本是必须条件：

- 浏览器通知、权限能力在 HTTPS 下更稳定
- 第三方平台通常要求安全 origin
- ChatGPT / connector 场景一般不接受纯 HTTP 的公网地址
- 对外暴露任务数据时需要传输加密

## 4. 如果要连接 ChatGPT，需要暴露 `/mcp` endpoint

当前版本尚未实现真正的 MCP server，但为后续接入建议：

- 保留现有 `/api/tasks/*` 作为底层 REST 能力
- 未来新增 `/mcp` 作为 MCP / connector 入口
- `/mcp` 内部再调用现有 `services/tasks-service.ts`

这样能避免把 ChatGPT 工具层直接耦合到 JSON 文件或 UI 代码。

## 5. 本地开发阶段如何用隧道工具暴露本地服务

开发阶段如果要临时给外部系统访问，可使用隧道工具，例如：

- Cloudflare Tunnel
- ngrok
- Tailscale Funnel

典型流程：

1. 本地运行 `npm run dev`
2. 用隧道工具把 `http://localhost:3000` 暴露成公网 HTTPS 地址
3. 用公网地址验证 API / 未来 connector 的回调链路

## 6. 后续如何接入 ChatGPT connector

建议顺序：

1. 先稳定现有 REST API
2. 再实现真正的 `/mcp` endpoint
3. 把 `list_tasks`、`create_task`、`update_task`、`complete_task`、`snooze_task` 对应到 tool schema
4. 让 connector / MCP server 只调用 service 层，不直接访问 repository
5. 等公网 HTTPS 与认证策略准备好后，再开放给 ChatGPT 使用

## 推荐架构路径

- UI -> `/api/tasks/*`
- MCP endpoint -> `services/tasks-service.ts`
- Service -> Repository
- Repository -> 本地 JSON / 未来 Supabase

该路径能确保：

- UI 与 MCP 共用同一套业务规则
- 将来切换数据库不影响工具层
- 部署到 HTTPS 后能平滑接入 ChatGPT connector
