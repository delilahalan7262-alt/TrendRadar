# MCP Tools Plan

本文档定义 Task Radar 后续接入 ChatGPT / MCP 时的最小可用工具集。当前版本 **不实现真实 MCP server**，只先规划工具 schema、输入输出和与现有 REST API 的映射关系。

## 设计目标

- 保持 tool 语义稳定，避免未来频繁变更 ChatGPT connector 配置。
- 让每个 tool 都能直接映射到现有 REST API。
- 保留最少但足够的任务管理能力，便于后续扩展。

---

## 1. `list_tasks`

### 用途
列出任务，并支持按状态、优先级、标签、是否今日到期、是否星标进行过滤。

### 输入参数
| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `status` | `pending \| completed` | 否 | 任务状态过滤 |
| `priority` | `low \| medium \| high` | 否 | 优先级过滤 |
| `tag` | `string` | 否 | 标签过滤 |
| `dueToday` | `boolean` | 否 | 是否仅返回今日任务 |
| `starred` | `boolean` | 否 | 是否仅返回星标 / 非星标 |
| `query` | `string` | 否 | 标题、描述、标签模糊搜索 |

### 返回结果
- 成功：任务数组
- 失败：统一错误对象（参数非法、服务异常等）

### 错误场景
- 参数枚举值错误
- 查询参数格式不合法
- 后端数据层异常

### REST API 映射
- `GET /api/tasks?status=&priority=&tag=&dueToday=&starred=&query=`

---

## 2. `create_task`

### 用途
创建一个新任务。

### 输入参数
| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `title` | `string` | 是 | 任务标题 |
| `description` | `string` | 否 | 任务描述 |
| `priority` | `low \| medium \| high` | 否 | 默认 `medium` |
| `tags` | `string[]` | 否 | 标签列表 |
| `dueAt` | `string \| null` | 否 | ISO 时间字符串 |
| `remindAt` | `string \| null` | 否 | ISO 时间字符串 |
| `reminderEnabled` | `boolean` | 否 | 是否开启提醒 |
| `isStarred` | `boolean` | 否 | 是否星标 |

### 返回结果
- 成功：创建后的完整任务对象
- 失败：统一错误对象

### 错误场景
- `title` 为空
- `reminderEnabled=true` 但未提供提醒时间
- 时间字段格式不是 ISO datetime

### REST API 映射
- `POST /api/tasks`

---

## 3. `update_task`

### 用途
更新已有任务的标题、描述、优先级、标签、提醒或截止时间等字段。

### 输入参数
| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `taskId` | `string` | 是 | 任务 ID |
| `title` | `string` | 否 | 新标题 |
| `description` | `string` | 否 | 新描述 |
| `priority` | `low \| medium \| high` | 否 | 新优先级 |
| `tags` | `string[]` | 否 | 新标签 |
| `dueAt` | `string \| null` | 否 | 新截止时间 |
| `remindAt` | `string \| null` | 否 | 新提醒时间 |
| `reminderEnabled` | `boolean` | 否 | 是否开启提醒 |
| `isStarred` | `boolean` | 否 | 是否星标 |

### 返回结果
- 成功：更新后的完整任务对象
- 失败：统一错误对象

### 错误场景
- `taskId` 不存在
- patch 字段格式不合法
- 时间字符串非法

### REST API 映射
- `PATCH /api/tasks/:id`

---

## 4. `complete_task`

### 用途
将任务标记为已完成。

### 输入参数
| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `taskId` | `string` | 是 | 任务 ID |

### 返回结果
- 成功：更新后的任务对象（`status=completed`）
- 失败：统一错误对象

### 错误场景
- `taskId` 不存在
- 数据层更新失败

### REST API 映射
- `POST /api/tasks/:id/complete`

---

## 5. `snooze_task`

### 用途
将任务提醒延后若干分钟。

### 输入参数
| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `taskId` | `string` | 是 | 任务 ID |
| `minutes` | `number` | 是 | 延后分钟数 |

### 返回结果
- 成功：更新后的任务对象（包含新的 `snoozeUntil`）
- 失败：统一错误对象

### 错误场景
- `taskId` 不存在
- `minutes` 非正整数
- `minutes` 超出服务端允许范围

### REST API 映射
- `POST /api/tasks/:id/snooze`

---

## 统一返回结构建议

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

失败时：

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

---

## 下一步实施建议

1. 在 `mcp/tool-mapping.ts` 中维护 tool 与 REST API 的映射元数据。
2. 等 HTTPS 和公网地址准备好后，再为 `/mcp` 暴露真实 endpoint。
3. 最终 MCP server 实现时，优先复用 `services/tasks-service.ts`，避免重复业务逻辑。
