import { fromServiceError, logApi, ok, fail } from '@/lib/api';
import { getTasksService } from '@/services/tasks-service';
import { snoozeInputSchema } from '@/validators/task';

const route = '/api/tasks/:id/snooze';
const tasksService = getTasksService();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = snoozeInputSchema.safeParse(body);
    if (!input.success) {
      return fail('请求体不合法', 400, 'INVALID_SNOOZE_INPUT', input.error.flatten());
    }

    const task = await tasksService.snoozeTask(id, input.data.minutes);
    logApi(route, 'snooze_task', { taskId: id, minutes: input.data.minutes });
    return ok(task);
  } catch (error) {
    return fromServiceError(error, route);
  }
}
