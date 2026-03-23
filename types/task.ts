export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskView = 'inbox' | 'today' | 'starred' | 'completed' | 'all';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  isStarred: boolean;
  dueAt: string | null;
  remindAt: string | null;
  reminderEnabled: boolean;
  reminderSent: boolean;
  snoozeUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  query: string;
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
  starred: 'all' | 'starred' | 'unstarred';
  due: 'all' | 'today' | 'overdue';
  tag: string;
}

export interface TaskMutationInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  isStarred?: boolean;
  dueAt?: string | null;
  remindAt?: string | null;
  reminderEnabled?: boolean;
  reminderSent?: boolean;
  snoozeUntil?: string | null;
}

export interface TaskFormInput {
  title: string;
  description: string;
  priority: TaskPriority;
  tags: string[];
  dueAt: string | null;
  reminderEnabled: boolean;
  remindAt: string | null;
  isStarred: boolean;
}

export interface ListTasksOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  starred?: boolean;
  dueToday?: boolean;
  query?: string;
}
