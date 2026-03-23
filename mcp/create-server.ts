import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TaskServiceError } from '@/services/tasks-service';
import { registerListTasksTool } from '@/mcp/tools/list-tasks';
import { registerCreateTaskTool } from '@/mcp/tools/create-task';
import { registerUpdateTaskTool } from '@/mcp/tools/update-task';
import { registerCompleteTaskTool } from '@/mcp/tools/complete-task';
import { registerSnoozeTaskTool } from '@/mcp/tools/snooze-task';

export function createTaskMcpServer() {
  const server = new McpServer({
    name: 'task-radar-mcp',
    version: '0.3.0',
  });

  registerListTasksTool(server);
  registerCreateTaskTool(server);
  registerUpdateTaskTool(server);
  registerCompleteTaskTool(server);
  registerSnoozeTaskTool(server);

  server.onerror = (error) => {
    if (error instanceof TaskServiceError) {
      console.error('[mcp] task service error', { code: error.code, message: error.message, details: error.details });
      return;
    }

    console.error('[mcp] unhandled error', error);
  };

  return server;
}
