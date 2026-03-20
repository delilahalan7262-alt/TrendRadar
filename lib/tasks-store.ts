import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Task } from '@/lib/types';

type TaskInput = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>> & Pick<Task, 'title'>;

const dataFile = path.join(process.cwd(), '.data', 'tasks.json');

const seedTasks: Task[] = [
  {
    id: randomUUID(),
    title: '完善本地 MVP 界面',
    description: '检查任务列表、弹窗表单和筛选交互是否顺畅。',
    status: 'pending',
    priority: 'high',
    is_starred: true,
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    remind_at: new Date(Date.now() + 1000 * 60 * 2).toISOString(),
    reminder_enabled: true,
    reminder_sent: false,
    snooze_until: null,
    tags: ['MVP', 'UI'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    title: '补充 Supabase 初始化 SQL',
    description: '为后续接入 PostgreSQL 提供完整表结构。',
    status: 'pending',
    priority: 'medium',
    is_starred: false,
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    remind_at: null,
    reminder_enabled: false,
    reminder_sent: false,
    snooze_until: null,
    tags: ['Supabase'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(seedTasks, null, 2), 'utf8');
  }
}

async function readLocalTasks() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw) as Task[];
}

async function writeLocalTasks(tasks: Task[]) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2), 'utf8');
}

function normalizeTask(task: TaskInput & Partial<Task>): Task {
  const now = new Date().toISOString();
  return {
    id: task.id ?? randomUUID(),
    title: task.title,
    description: task.description ?? '',
    status: task.status ?? 'pending',
    priority: task.priority ?? 'medium',
    is_starred: task.is_starred ?? false,
    due_at: task.due_at ?? null,
    remind_at: task.remind_at ?? null,
    reminder_enabled: task.reminder_enabled ?? false,
    reminder_sent: task.reminder_sent ?? false,
    snooze_until: task.snooze_until ?? null,
    tags: task.tags ?? [],
    created_at: task.created_at ?? now,
    updated_at: now,
  };
}

export async function listTasks() {
  const tasks = await readLocalTasks();
  return tasks.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
}

export async function getTask(id: string) {
  const tasks = await listTasks();
  return tasks.find((task) => task.id === id) ?? null;
}

export async function createTask(input: TaskInput) {
  const task = normalizeTask(input);
  const tasks = await readLocalTasks();
  tasks.unshift(task);
  await writeLocalTasks(tasks);
  return task;
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const tasks = await readLocalTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index < 0) return null;
  tasks[index] = { ...tasks[index], ...patch, updated_at: new Date().toISOString() };
  await writeLocalTasks(tasks);
  return tasks[index];
}

export async function deleteTask(id: string) {
  const tasks = await readLocalTasks();
  const next = tasks.filter((task) => task.id !== id);
  await writeLocalTasks(next);
  return next.length !== tasks.length;
}
