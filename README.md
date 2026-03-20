# Task Radar v2 Prep

Task Radar 当前已经是一个 **可本地运行** 的轻量任务系统，并且完成了 v2 方向的架构整理：数据访问层、服务层、统一任务模型、稳定 REST API，以及为后续 ChatGPT / MCP 接入准备的规划文档。

## 当前能力

- 任务列表主页面
- 新建 / 编辑任务弹窗
- 新增 / 编辑 / 删除 / 完成 / 取消完成 / 星标
- 本地 JSON 持久化（`.data/tasks.json`）
- 提醒时间字段
- 页面内提醒弹窗
- 浏览器 Notification API 提醒
- 基础筛选：全部、待处理、已完成、星标、今日任务
- 统一 REST API 响应格式
- MCP tools 规划文档
- HTTPS / 部署准备文档

## 项目结构（v2 整理后）

```text
app/api/tasks/*          REST API
components/*             前端页面组件
hooks/*                  前端提醒 hook
repositories/*           数据访问层（当前为本地 JSON）
services/*               业务服务层
validators/*             输入校验
types/*                  统一任务模型
mcp/*                    未来 MCP 映射预留
docs/*                   MCP / 部署规划文档
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

### 3. 打开浏览器

访问：<http://localhost:3000>

## 本地测试提醒

### 方法 A：开发辅助按钮

1. 打开首页
2. 点击 **“创建 1 分钟测试提醒”**
3. 等待约 1 分钟到 1 分 30 秒
4. 查看页面右上角提醒卡片

> 说明：该按钮是保留的 **dev helper**，只用于本地验证提醒链路。

### 方法 B：手动创建提醒任务

1. 点击 **“新建任务”**
2. 开启提醒
3. 将提醒时间设置为当前时间后 1~2 分钟
4. 保存并等待提醒触发

### 测试浏览器通知

1. 点击页面中的 **“开启浏览器通知”**
2. 在浏览器中允许通知权限
3. 创建一个 1 分钟后的提醒任务
4. 到点后检查页面提醒和系统通知

## API 概览

统一成功响应：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

统一失败响应：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "任务不存在",
    "details": null
  }
}
```

### 核心接口

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/complete`
- `POST /api/tasks/:id/uncomplete`
- `POST /api/tasks/:id/star`
- `POST /api/tasks/:id/unstar`
- `POST /api/tasks/:id/snooze`
- `GET /api/tasks/reminders/due`

## 后续 MCP 接入路径

当前版本 **没有实现真实 MCP server**，但已经完成接入前准备：

- 工具集规划：`docs/mcp-tools-plan.md`
- MCP 目录预留：`mcp/README.md`
- Tool 与 REST API / service 映射：`mcp/tool-mapping.ts`
- HTTPS / connector 部署准备：`docs/deployment-plan.md`

推荐后续路线：

1. 继续保持 UI、API、Service、Repository 分层
2. 未来实现 `/mcp` endpoint
3. MCP tool 只调用 `services/tasks-service.ts`
4. 等 HTTPS 与公网部署准备好后，再接入 ChatGPT connector

## 数据层说明

当前使用本地 JSON 仓储：

- `repositories/tasks-repository.ts`

未来如果切换到 Supabase / PostgreSQL，建议：

1. 新增一个 Supabase Repository 实现
2. 保持 `services/tasks-service.ts` 不变
3. 让 API 与未来 MCP 层继续复用同一 service

## 相关文档

- `docs/mcp-tools-plan.md`
- `docs/deployment-plan.md`
- `mcp/README.md`
- `mcp/tool-mapping.ts`
- `scripts/supabase-init.sql`
