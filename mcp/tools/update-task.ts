import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasksService } from '@/services/tasks-service';
import { normalizeOptionalPriority, toToolResult, updateTaskToolSchema } from '@/mcp/types';

export function registerUpdateTaskTool(server: McpServer) {
  const tasksService = getTasksService();

  server.registerTool(
    'update_task',
    {
      title: 'Update Task',
      description: '更新任务标题、描述、优先级、标签、截止时间或提醒时间。',
      inputSchema: updateTaskToolSchema,
    },
    async ({ taskId, title, description, priority, tags, dueAt, remindAt }) => {
      try {
        const task = await tasksService.updateTask(taskId, {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(priority !== undefined ? { priority: normalizeOptionalPriority(priority) } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(dueAt !== undefined ? { dueAt } : {}),
          ...(remindAt !== undefined ? { remindAt, reminderEnabled: Boolean(remindAt) } : {}),
        });

        return toToolResult({ success: true, data: task, error: null });
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}
