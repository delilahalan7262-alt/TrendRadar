import { createTask, listTasks } from '@/lib/tasks-store';
import { ok, fail } from '@/lib/api';
import { taskInputSchema } from '@/lib/task-schema';

export async function GET() {
  try {
    const tasks = await listTasks();
    return ok(tasks);
  } catch (error) {
    return fail(error instanceof Error ? error.message : '获取任务失败', 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = taskInputSchema.parse(body);
    const task = await createTask(input);
    return ok(task, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : '创建任务失败', 400);
  }
}
