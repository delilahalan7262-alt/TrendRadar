import { TaskFilters, TaskView } from '@/lib/types';

export const defaultFilters: TaskFilters = {
  query: '',
  status: 'all',
  priority: 'all',
  starred: 'all',
  due: 'all',
  tag: 'all',
};

export const sidebarItems: { key: TaskView; label: string }[] = [
  { key: 'inbox', label: '待处理' },
  { key: 'today', label: '今日任务' },
  { key: 'starred', label: '星标任务' },
  { key: 'completed', label: '已完成' },
  { key: 'all', label: '全部任务' },
];

export const priorityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
] as const;
