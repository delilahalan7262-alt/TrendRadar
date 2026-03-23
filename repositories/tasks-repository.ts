import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Task, TaskMutationInput } from '@/types/task';

export interface TasksRepository {
  list(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(input: TaskMutationInput): Promise<Task>;
  update(id: string, patch: Partial<Task>): Promise<Task | null>;
  remove(id: string): Promise<boolean>;
}

const dataFile = path.join(process.cwd(), '.data', 'tasks.json');

const seedTasks: Task[] = [
  {
    id: randomUUID(),
    title: '完善本地 MVP 界面',
    description: '检查任务列表、弹窗表单和筛选交互是否顺畅。',
    status: 'pending',
    priority: 'high',
    tags: ['MVP', 'UI'],
    isStarred: true,
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    remindAt: new Date(Date.now() + 1000 * 60 * 2).toISOString(),
    reminderEnabled: true,
    reminderSent: false,
    snoozeUntil: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    title: '补充 MCP / HTTPS 部署规划',
    description: '整理 v2 文档结构，方便未来接入 ChatGPT Connector。',
    status: 'pending',
    priority: 'medium',
    tags: ['MCP', 'Docs'],
    isStarred: false,
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    remindAt: null,
    reminderEnabled: false,
    reminderSent: false,
    snoozeUntil: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function normalizeTask(task: TaskMutationInput & Partial<Task>): Task {
  const now = new Date().toISOString();

  return {
    id: task.id ?? randomUUID(),
    title: task.title,
    description: task.description ?? '',
    status: task.status ?? 'pending',
    priority: task.priority ?? 'medium',
    tags: task.tags ?? [],
    isStarred: task.isStarred ?? false,
    dueAt: task.dueAt ?? null,
    remindAt: task.remindAt ?? null,
    reminderEnabled: task.reminderEnabled ?? false,
    reminderSent: task.reminderSent ?? false,
    snoozeUntil: task.snoozeUntil ?? null,
    createdAt: task.createdAt ?? now,
    updatedAt: now,
  };
}

export class LocalJsonTasksRepository implements TasksRepository {
  private async ensureDataFile() {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    try {
      await fs.access(dataFile);
    } catch {
      await fs.writeFile(dataFile, JSON.stringify(seedTasks, null, 2), 'utf8');
    }
  }

  private async read() {
    await this.ensureDataFile();
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw) as Task[];
  }

  private async write(tasks: Task[]) {
    await this.ensureDataFile();
    await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2), 'utf8');
  }

  async list() {
    const tasks = await this.read();
    return tasks.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }

  async getById(id: string) {
    const tasks = await this.list();
    return tasks.find((task) => task.id === id) ?? null;
  }

  async create(input: TaskMutationInput) {
    const task = normalizeTask(input);
    const tasks = await this.read();
    tasks.unshift(task);
    await this.write(tasks);
    return task;
  }

  async update(id: string, patch: Partial<Task>) {
    const tasks = await this.read();
    const index = tasks.findIndex((task) => task.id === id);
    if (index < 0) return null;
    tasks[index] = { ...tasks[index], ...patch, updatedAt: new Date().toISOString() };
    await this.write(tasks);
    return tasks[index];
  }

  async remove(id: string) {
    const tasks = await this.read();
    const next = tasks.filter((task) => task.id !== id);
    await this.write(next);
    return next.length !== tasks.length;
  }
}

let repository: TasksRepository | null = null;

export function getTasksRepository() {
  if (!repository) {
    repository = new LocalJsonTasksRepository();
  }
  return repository;
}
