import { fromServiceError, logApi, ok, fail } from '@/lib/api';
import { getTasksService } from '@/services/tasks-service';
import { taskUpdateSchema } from '@/validators/task';

const route = '/api/tasks/:id';
const tasksService = getTasksService();

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await tasksService.getTask(id);
    logApi(route, 'get_task', { taskId: id });
    return ok(task);
  } catch (error) {
    return fromServiceError(error, route);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = taskUpdateSchema.safeParse(body);
    if (!input.success) {
      return fail('请求体不合法', 400, 'INVALID_TASK_PATCH', input.error.flatten());
    }

    const task = await tasksService.updateTask(id, input.data);
    logApi(route, 'update_task', { taskId: id, fields: Object.keys(input.data) });
    return ok(task);
  } catch (error) {
    return fromServiceError(error, route);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await tasksService.deleteTask(id);
    logApi(route, 'delete_task', { taskId: id });
    return ok(result);
  } catch (error) {
    return fromServiceError(error, route);
  }
}
