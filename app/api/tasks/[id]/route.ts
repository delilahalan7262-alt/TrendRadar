import { deleteTask, getTask, updateTask } from '@/lib/tasks-store';
import { ok, fail } from '@/lib/api';
import { taskInputSchema } from '@/lib/task-schema';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id);
  return task ? ok(task) : fail('任务不存在', 404);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = taskInputSchema.partial().parse(body);
    const task = await updateTask(id, input);
    return task ? ok(task) : fail('任务不存在', 404);
  } catch (error) {
    return fail(error instanceof Error ? error.message : '更新任务失败', 400);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteTask(id);
  return removed ? ok({ id }) : fail('任务不存在', 404);
}
