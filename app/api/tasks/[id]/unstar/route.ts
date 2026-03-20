import { ok, fail } from '@/lib/api';
import { updateTask } from '@/lib/tasks-store';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await updateTask(id, { is_starred: false });
  return task ? ok(task) : fail('任务不存在', 404);
}
