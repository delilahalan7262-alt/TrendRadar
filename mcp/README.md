# MCP Preparation

该目录用于保存未来 MCP server 接入所需的映射、schema 和说明文件。

当前阶段：
- **不实现真实 MCP server**
- **不开放 `/mcp` 运行端点**
- 仅整理 tool 与现有 REST API / service 的映射关系

建议未来实现原则：
1. MCP 层只做 schema 解析、参数校验和工具分发
2. 业务逻辑统一复用 `services/tasks-service.ts`
3. repository 层负责本地 JSON / 未来数据库切换
4. tool schema 与 `docs/mcp-tools-plan.md` 保持同步
