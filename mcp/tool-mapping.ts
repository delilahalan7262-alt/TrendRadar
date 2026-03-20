export interface McpToolMapping {
  toolName: string;
  purpose: string;
  restApi: string;
  serviceMethod: string;
}

export const taskToolMappings: McpToolMapping[] = [
  {
    toolName: 'list_tasks',
    purpose: '查询任务列表并支持基础过滤',
    restApi: 'GET /api/tasks',
    serviceMethod: 'TasksService.listTasks',
  },
  {
    toolName: 'create_task',
    purpose: '创建新任务',
    restApi: 'POST /api/tasks',
    serviceMethod: 'TasksService.createTask',
  },
  {
    toolName: 'update_task',
    purpose: '更新任务字段',
    restApi: 'PATCH /api/tasks/:id',
    serviceMethod: 'TasksService.updateTask',
  },
  {
    toolName: 'complete_task',
    purpose: '将任务标记为已完成',
    restApi: 'POST /api/tasks/:id/complete',
    serviceMethod: 'TasksService.completeTask',
  },
  {
    toolName: 'snooze_task',
    purpose: '延后提醒时间',
    restApi: 'POST /api/tasks/:id/snooze',
    serviceMethod: 'TasksService.snoozeTask',
  },
];
