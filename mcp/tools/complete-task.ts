import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasksService } from '@/services/tasks-service';
import { completeTaskToolSchema, toToolErrorResult, toToolResult } from '@/mcp/types';

export function registerCompleteTaskTool(server: McpServer) {
  const tasksService = getTasksService();

  server.registerTool(
    'complete_task',
    {
      title: 'Complete Task',
      description: '将指定任务标记为已完成。',
      inputSchema: completeTaskToolSchema,
    },
    async ({ taskId }) => {
      try {
        const task = await tasksService.completeTask(taskId);
        return toToolResult({ success: true, data: task, error: null });
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}
