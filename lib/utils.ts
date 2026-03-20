import { clsx } from 'clsx';
import { Task, TaskFilters, TaskView } from '@/lib/types';

export function cn(...classes: Array<string | false | null | undefined>) {
  return clsx(classes);
}

export function formatDateTime(value: string | null) {
  if (!value) return '未设置';
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateTimeInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isToday(dateString: string | null) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export function isOverdue(task: Task) {
  return task.status !== 'completed' && !!task.due_at && new Date(task.due_at).getTime() < Date.now();
}

export function matchesView(task: Task, view: TaskView) {
  switch (view) {
    case 'inbox':
      return task.status === 'pending';
    case 'today':
      return task.status === 'pending' && (isToday(task.due_at) || isToday(task.remind_at));
    case 'starred':
      return task.is_starred;
    case 'completed':
      return task.status === 'completed';
    case 'all':
    default:
      return true;
  }
}

export function matchesFilters(task: Task, filters: TaskFilters) {
  const query = filters.query.trim().toLowerCase();
  const inQuery =
    !query ||
    task.title.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query) ||
    task.tags.some((tag) => tag.toLowerCase().includes(query));

  const inStatus = filters.status === 'all' || task.status === filters.status;
  const inPriority = filters.priority === 'all' || task.priority === filters.priority;
  const inStarred =
    filters.starred === 'all' ||
    (filters.starred === 'starred' ? task.is_starred : !task.is_starred);
  const inDue =
    filters.due === 'all' ||
    (filters.due === 'today' ? isToday(task.due_at) : isOverdue(task));
  const inTag = filters.tag === 'all' || task.tags.includes(filters.tag);

  return inQuery && inStatus && inPriority && inStarred && inDue && inTag;
}

export function reminderBaseTime(task: Task) {
  return task.snooze_until ?? task.remind_at;
}
