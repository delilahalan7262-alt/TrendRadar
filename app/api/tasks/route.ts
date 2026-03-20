import { fromServiceError, logApi, ok, fail } from '@/lib/api';
import { getTasksService } from '@/services/tasks-service';
import { taskCreateSchema, taskQuerySchema } from '@/validators/task';

const route = '/api/tasks';
const tasksService = getTasksService();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = taskQuerySchema.safeParse({
      status: url.searchParams.get('status') ?? undefined,
      priority: url.searchParams.get('priority') ?? undefined,
      tag: url.searchParams.get('tag') ?? undefined,
      starred: url.searchParams.get('starred') ?? undefined,
      dueToday: url.searchParams.get('dueToday') ?? undefined,
      query: url.searchParams.get('query') ?? undefined,
    });

    if (!query.success) {
      return fail('查询参数不合法', 400, 'INVALID_QUERY', query.error.flatten());
    }

    const tasks = await tasksService.listTasks({
      status: query.data.status,
      priority: query.data.priority,
      tag: query.data.tag,
      starred: query.data.starred ? query.data.starred === 'true' : undefined,
      dueToday: query.data.dueToday === 'true',
      query: query.data.query,
    });

    logApi(route, 'list_tasks', { total: tasks.length });
    return ok(tasks);
  } catch (error) {
    return fromServiceError(error, route);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = taskCreateSchema.safeParse(body);
    if (!input.success) {
      return fail('请求体不合法', 400, 'INVALID_TASK_INPUT', input.error.flatten());
    }

    const task = await tasksService.createTask(input.data);
    logApi(route, 'create_task', { taskId: task.id });
    return ok(task, { status: 201 });
  } catch (error) {
    return fromServiceError(error, route);
  }
}
