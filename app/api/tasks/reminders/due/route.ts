import { ok, fail } from '@/lib/api';
import { listTasks } from '@/lib/tasks-store';
import { reminderBaseTime } from '@/lib/utils';

export async function GET() {
  try {
    const now = Date.now();
    const due = (await listTasks()).filter((task) => {
      const base = reminderBaseTime(task);
      return Boolean(
        task.reminder_enabled &&
          task.status !== 'completed' &&
          !task.reminder_sent &&
          base &&
          new Date(base).getTime() <= now,
      );
    });
    return ok(due);
  } catch (error) {
    return fail(error instanceof Error ? error.message : '获取提醒失败', 500);
  }
}
