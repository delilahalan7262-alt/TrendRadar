import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasksService } from '@/services/tasks-service';
import { snoozeTaskToolSchema, toToolErrorResult, toToolResult } from '@/mcp/types';

export function registerSnoozeTaskTool(server: McpServer) {
  const tasksService = getTasksService();

  server.registerTool(
    'snooze_task',
    {
      title: 'Snooze Task',
      description: '将任务提醒延后指定分钟数。',
      inputSchema: snoozeTaskToolSchema,
    },
    async ({ taskId, minutes }) => {
      try {
        const task = await tasksService.snoozeTask(taskId, minutes);
        return toToolResult({ success: true, data: task, error: null });
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}
