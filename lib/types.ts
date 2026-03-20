export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskView = 'inbox' | 'today' | 'starred' | 'completed' | 'all';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  is_starred: boolean;
  due_at: string | null;
  remind_at: string | null;
  reminder_enabled: boolean;
  reminder_sent: boolean;
  snooze_until: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  query: string;
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
  starred: 'all' | 'starred' | 'unstarred';
  due: 'all' | 'today' | 'overdue';
  tag: string;
}

export interface TaskFormInput {
  title: string;
  description: string;
  priority: TaskPriority;
  tags: string[];
  due_at: string | null;
  reminder_enabled: boolean;
  remind_at: string | null;
  is_starred: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
