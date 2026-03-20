import { getTasksRepository } from '@/repositories/tasks-repository';
import { ListTasksOptions, Task, TaskMutationInput } from '@/types/task';

export class TaskServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

function isToday(dateString: string | null) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function matchesQuery(task: Task, query?: string) {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return (
    task.title.toLowerCase().includes(normalized) ||
    task.description.toLowerCase().includes(normalized) ||
    task.tags.some((tag) => tag.toLowerCase().includes(normalized))
  );
}

export class TasksService {
  constructor(private readonly repository = getTasksRepository()) {}

  async listTasks(options: ListTasksOptions = {}) {
    const tasks = await this.repository.list();
    return tasks.filter((task) => {
      if (options.status && task.status !== options.status) return false;
      if (options.priority && task.priority !== options.priority) return false;
      if (options.tag && !task.tags.includes(options.tag)) return false;
      if (typeof options.starred === 'boolean' && task.isStarred !== options.starred) return false;
      if (options.dueToday && !isToday(task.dueAt)) return false;
      if (!matchesQuery(task, options.query)) return false;
      return true;
    });
  }

  async getTask(taskId: string) {
    const task = await this.repository.getById(taskId);
    if (!task) {
      throw new TaskServiceError('任务不存在', 404, 'TASK_NOT_FOUND');
    }
    return task;
  }

  async createTask(input: TaskMutationInput) {
    return this.repository.create({
      description: '',
      status: 'pending',
      priority: 'medium',
      tags: [],
      isStarred: false,
      dueAt: null,
      remindAt: null,
      reminderEnabled: false,
      reminderSent: false,
      snoozeUntil: null,
      ...input,
    });
  }

  async updateTask(taskId: string, patch: Partial<Task>) {
    await this.getTask(taskId);
    const task = await this.repository.update(taskId, patch);
    if (!task) {
      throw new TaskServiceError('任务不存在', 404, 'TASK_NOT_FOUND');
    }
    return task;
  }

  async deleteTask(taskId: string) {
    const removed = await this.repository.remove(taskId);
    if (!removed) {
      throw new TaskServiceError('任务不存在', 404, 'TASK_NOT_FOUND');
    }
    return { id: taskId };
  }

  async completeTask(taskId: string) {
    return this.updateTask(taskId, { status: 'completed', reminderSent: true });
  }

  async uncompleteTask(taskId: string) {
    return this.updateTask(taskId, { status: 'pending', reminderSent: false });
  }

  async starTask(taskId: string) {
    return this.updateTask(taskId, { isStarred: true });
  }

  async unstarTask(taskId: string) {
    return this.updateTask(taskId, { isStarred: false });
  }

  async snoozeTask(taskId: string, minutes: number) {
    await this.getTask(taskId);
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    return this.updateTask(taskId, {
      snoozeUntil,
      reminderSent: false,
      reminderEnabled: true,
    });
  }

  async listDueReminders() {
    const now = Date.now();
    const tasks = await this.repository.list();
    return tasks.filter((task) => {
      const reminderTime = task.snoozeUntil ?? task.remindAt;
      return Boolean(
        task.reminderEnabled &&
          task.status !== 'completed' &&
          !task.reminderSent &&
          reminderTime &&
          new Date(reminderTime).getTime() <= now,
      );
    });
  }
}

let service: TasksService | null = null;

export function getTasksService() {
  if (!service) {
    service = new TasksService();
  }
  return service;
}
