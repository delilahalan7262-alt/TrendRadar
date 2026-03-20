import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTasksService } from '@/services/tasks-service';
import { listTasksToolSchema, normalizeOptionalPriority, normalizeOptionalStatus, toToolErrorResult, toToolResult } from '@/mcp/types';

export function registerListTasksTool(server: McpServer) {
  const tasksService = getTasksService();

  server.registerTool(
    'list_tasks',
    {
      title: 'List Tasks',
      description: '查询任务列表，可按状态、优先级、标签、今日任务、星标进行过滤。',
      inputSchema: listTasksToolSchema,
    },
    async ({ status, priority, tag, dueToday, starred }) => {
      try {
        const tasks = await tasksService.listTasks({
          status: normalizeOptionalStatus(status),
          priority: normalizeOptionalPriority(priority),
          tag,
          dueToday,
          starred,
        });

        return toToolResult({ success: true, data: tasks, error: null });
      } catch (error) {
        return toToolErrorResult(error);
      }
    },
  );
}
