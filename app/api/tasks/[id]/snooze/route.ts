import { ok, fail } from '@/lib/api';
import { getTask, updateTask } from '@/lib/tasks-store';
import { snoozeInputSchema } from '@/lib/task-schema';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return fail('任务不存在', 404);

    const body = await request.json();
    const { minutes } = snoozeInputSchema.parse(body);
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    const updated = await updateTask(id, {
      snooze_until: snoozeUntil,
      reminder_sent: false,
      reminder_enabled: true,
    });

    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : '稍后提醒失败', 400);
  }
}
