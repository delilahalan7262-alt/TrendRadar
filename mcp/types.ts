import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@/types/task';

export type McpToolResultPayload<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

export const mcpTaskStatusSchema = z.enum(['pending', 'completed']);
export const mcpTaskPrioritySchema = z.enum(['low', 'medium', 'high']);

export type McpTaskStatus = z.infer<typeof mcpTaskStatusSchema>;
export type McpTaskPriority = z.infer<typeof mcpTaskPrioritySchema>;

export const listTasksToolSchema = {
  status: mcpTaskStatusSchema.optional().describe('可选：任务状态 pending/completed'),
  priority: mcpTaskPrioritySchema.optional().describe('可选：优先级 low/medium/high'),
  tag: z.string().optional().describe('可选：按标签过滤'),
  dueToday: z.boolean().optional().describe('可选：仅返回今日任务'),
  starred: z.boolean().optional().describe('可选：仅返回星标或非星标任务'),
} as const;

export const createTaskToolSchema = {
  title: z.string().min(1).describe('任务标题'),
  description: z.string().optional().describe('任务描述'),
  priority: mcpTaskPrioritySchema.optional().describe('优先级'),
  tags: z.array(z.string()).optional().describe('标签数组'),
  dueAt: z.string().datetime().nullable().optional().describe('截止时间 ISO 字符串'),
  remindAt: z.string().datetime().nullable().optional().describe('提醒时间 ISO 字符串'),
} as const;

export const updateTaskToolSchema = {
  taskId: z.string().min(1).describe('任务 ID'),
  title: z.string().min(1).optional().describe('新任务标题'),
  description: z.string().optional().describe('新任务描述'),
  priority: mcpTaskPrioritySchema.optional().describe('新优先级'),
  tags: z.array(z.string()).optional().describe('新标签数组'),
  dueAt: z.string().datetime().nullable().optional().describe('新截止时间 ISO 字符串'),
  remindAt: z.string().datetime().nullable().optional().describe('新提醒时间 ISO 字符串'),
} as const;

export const completeTaskToolSchema = {
  taskId: z.string().min(1).describe('要完成的任务 ID'),
} as const;

export const snoozeTaskToolSchema = {
  taskId: z.string().min(1).describe('要延后的任务 ID'),
  minutes: z.number().int().min(1).max(24 * 60).describe('延后分钟数'),
} as const;

export function normalizeOptionalStatus(status?: McpTaskStatus): TaskStatus | undefined {
  return status;
}

export function normalizeOptionalPriority(priority?: McpTaskPriority): TaskPriority | undefined {
  return priority;
}

export function toToolResult<T>(payload: McpToolResultPayload<T>) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
}

export function toToolErrorResult(error: unknown) {
  return toToolResult({
    success: false,
    data: null,
    error: {
      code: error instanceof Error && 'code' in error ? String((error as { code?: string }).code ?? 'MCP_TOOL_ERROR') : 'MCP_TOOL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown MCP tool error',
    },
  });
}
