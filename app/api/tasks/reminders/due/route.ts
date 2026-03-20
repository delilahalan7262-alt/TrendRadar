import { fromServiceError, logApi, ok } from '@/lib/api';
import { getTasksService } from '@/services/tasks-service';

const route = '/api/tasks/reminders/due';
const tasksService = getTasksService();

export async function GET() {
  try {
    const dueTasks = await tasksService.listDueReminders();
    logApi(route, 'list_due_reminders', { total: dueTasks.length });
    return ok(dueTasks);
  } catch (error) {
    return fromServiceError(error, route);
  }
}
