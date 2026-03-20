# MCP Runtime

该目录现在已经包含一个可运行的 MCP server 雏形，用于把 Task Radar 的任务能力暴露给 ChatGPT Connector。

## 当前内容

- `mcp/server.ts`：独立 Node MCP server，默认监听 `http://127.0.0.1:3333/mcp`
- `mcp/create-server.ts`：创建并注册所有 tools
- `mcp/tools/*.ts`：各个 task tool 的注册逻辑
- `mcp/types.ts`：tool schema 与统一输出结构
- `mcp/tool-mapping.ts`：tool -> REST API / service 的映射说明

## 当前支持的 tools

- `list_tasks`
- `create_task`
- `update_task`
- `complete_task`
- `snooze_task`

## 实现原则

1. MCP 层只负责 tool 暴露、schema 和 transport
2. 业务逻辑统一复用 `services/tasks-service.ts`
3. repository 层继续负责本地 JSON / 未来数据库切换
4. Web UI、REST API、MCP tools 共用同一套核心服务逻辑
