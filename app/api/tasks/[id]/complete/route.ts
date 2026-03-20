import { fromServiceError, logApi, ok } from '@/lib/api';
import { getTasksService } from '@/services/tasks-service';

const route = '/api/tasks/:id/complete';
const tasksService = getTasksService();

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await tasksService.completeTask(id);
    logApi(route, 'complete_task', { taskId: id });
    return ok(task);
  } catch (error) {
    return fromServiceError(error, route);
  }
}
