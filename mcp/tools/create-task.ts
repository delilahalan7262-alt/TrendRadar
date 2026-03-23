import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasksService } from '@/services/tasks-service';
import { createTaskToolSchema, normalizeOptionalPriority, toToolErrorResult, toToolResult } from '@/mcp/types';

export function registerCreateTaskTool(server: McpServer) {
  const tasksService = getTasksService();

  server.registerTool(
    'create_task',
    {
      title: 'Create Task',
      description: '创建一个新任务，可附带优先级、标签、截止时间和提醒时间。',
      inputSchema: createTaskToolSchema,
    },
    async ({ title, description, priority, tags, dueAt, remindAt }) => {
      try {
        const task = await tasksService.createTask({
          title,
          description,
          priority: normalizeOptionalPriority(priority),
          tags,
          dueAt,
          remindAt,
          reminderEnabled: Boolean(remindAt),
        });

        return toToolResult({ success: true, data: task, error: null });
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}
