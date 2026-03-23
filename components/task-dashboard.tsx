'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Pencil, Plus, RefreshCcw, Search, Settings, Star, Trash2 } from 'lucide-react';
import { ApiResponse } from '@/lib/types';
import { defaultFilters, priorityOptions, sidebarItems } from '@/lib/constants';
import { Task, TaskFilters, TaskFormInput, TaskView } from '@/types/task';
import { cn, formatDateTime, matchesFilters, matchesView } from '@/lib/utils';
import { TaskModal } from '@/components/task-modal';
import { ReminderCenter } from '@/components/reminder-center';
import { useTaskReminders } from '@/hooks/use-task-reminders';

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? '请求失败');
  }
  return json.data;
}

const viewLabelMap: Record<TaskView, string> = {
  inbox: '待处理',
  today: '今日任务',
  starred: '星标任务',
  completed: '已完成',
  all: '全部任务',
};

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<TaskView>('inbox');
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readJson<Task[]>('/api/tasks');
      setTasks(data);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : '加载任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }
    setNotificationState(Notification.permission);
  }, []);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  const upsertTask = useCallback((task: Task) => {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);
      return exists ? current.map((item) => (item.id === task.id ? task : item)) : [task, ...current];
    });
  }, []);

  const reminders = useTaskReminders(upsertTask);

  const tags = useMemo(() => Array.from(new Set(tasks.flatMap((task) => task.tags))).sort(), [tasks]);
  const visibleTasks = useMemo(
    () => tasks.filter((task) => matchesView(task, view) && matchesFilters(task, filters)),
    [tasks, view, filters],
  );
  const pendingCount = useMemo(() => tasks.filter((task) => task.status === 'pending').length, [tasks]);
  const starredCount = useMemo(() => tasks.filter((task) => task.isStarred).length, [tasks]);
  const todayCount = useMemo(() => tasks.filter((task) => matchesView(task, 'today')).length, [tasks]);

  const saveTask = async (payload: TaskFormInput) => {
    setSaving(true);
    setError(null);
    try {
      const task = activeTask
        ? await readJson<Task>(`/api/tasks/${activeTask.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await readJson<Task>('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      upsertTask(task);
      setActiveTask(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存任务失败');
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const patchTask = async (endpoint: string, init?: RequestInit) => {
    try {
      const task = await readJson<Task>(endpoint, init);
      upsertTask(task);
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : '任务更新失败');
    }
  };

  const deleteOne = async (taskId: string) => {
    try {
      await readJson<{ id: string }>(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '删除任务失败');
    }
  };

  const createReminderDemo = async () => {
    const target = new Date(Date.now() + 60 * 1000).toISOString();
    await saveTask({
      title: '1 分钟后提醒我测试通知',
      description: '这是一个自动创建的提醒测试任务，用来验证页面提醒和浏览器通知。',
      priority: 'high',
      tags: ['提醒测试'],
      dueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      reminderEnabled: true,
      remindAt: target,
      isStarred: false,
    });
  };

  const requestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  };

  const viewTask = (taskId: string) => {
    setHighlightId(taskId);
    document.getElementById(`task-${taskId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => setHighlightId(null), 1800);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-100 to-brand-50 p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl gap-6">
        <aside className="hidden w-64 shrink-0 rounded-3xl bg-white p-5 shadow-card md:block">
          <h1 className="text-xl font-semibold">Task Radar</h1>
          <p className="mt-1 text-sm text-slate-500">轻量级本地待办系统</p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">待处理</p><p className="mt-1 text-2xl font-semibold">{pendingCount}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">今日任务</p><p className="mt-1 text-2xl font-semibold">{todayCount}</p></div>
          </div>
          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <button key={item.key} onClick={() => setView(item.key)} className={cn('flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium', view === item.key ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100')}>
                <span>{item.label}</span>
                {item.key === 'starred' ? <span className="text-xs text-slate-400">{starredCount}</span> : null}
              </button>
            ))}
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">标签管理与设置在此 MVP 中整合到顶部筛选区与通知权限流程。</div>
            <button className="mt-2 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-slate-500"><Settings size={16} /> 设置</button>
          </nav>
        </aside>

        <section className="flex-1 rounded-3xl bg-white p-5 shadow-card md:p-6">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 md:hidden">
            {sidebarItems.map((item) => <button key={item.key} onClick={() => setView(item.key)} className={cn('rounded-full px-4 py-2 text-sm', view === item.key ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600')}>{item.label}</button>)}
          </div>

          <div className="mt-0 flex flex-col gap-4 border-b border-slate-100 pb-5 pt-5 md:mt-0 md:pt-0 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"><Search size={18} className="text-slate-400" /><input className="w-full text-sm" placeholder="搜索标题、描述、标签" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:flex">
              <select className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskFilters['status'] })}><option value="all">全部状态</option><option value="pending">待处理</option><option value="completed">已完成</option></select>
              <select className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskFilters['priority'] })}><option value="all">全部优先级</option>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <select className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={filters.due} onChange={(e) => setFilters({ ...filters, due: e.target.value as TaskFilters['due'] })}><option value="all">全部时间</option><option value="today">今日到期</option><option value="overdue">已过期</option></select>
              <select className="rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}><option value="all">全部标签</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select>
              <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium" onClick={() => setFilters(defaultFilters)}>重置筛选</button>
              <button className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-medium text-white" onClick={() => { setActiveTask(null); setModalOpen(true); }}>新建任务</button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">当前视图</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">{viewLabelMap[view]}</h2><p className="mt-2 text-sm text-slate-500">共 {visibleTasks.length} 条任务，支持新增、编辑、删除、完成、星标与提醒。</p></div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><Bell size={16} /><span>通知权限：{notificationState === 'granted' ? '已允许' : notificationState === 'denied' ? '已拒绝' : notificationState === 'unsupported' ? '当前浏览器不支持' : '未选择'}</span></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => void requestNotifications()}>开启浏览器通知</button>
                <button className="rounded-2xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800" onClick={() => void createReminderDemo()}><Plus size={16} className="mr-1 inline-block" />创建 1 分钟测试提醒</button>
                <button className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm" onClick={() => void refreshTasks()}><RefreshCcw size={16} className="mr-1 inline-block" />刷新</button>
              </div>
              <p className="mt-3 text-xs text-slate-400">开发辅助：该一键测试按钮仅用于本地验证提醒链路。</p>
            </div>
          </div>

          {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="mt-6 space-y-4">
            {loading ? <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">正在加载任务...</div> : null}
            {!loading && visibleTasks.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">暂无符合条件的任务，点击右上角“新建任务”开始记录。</div> : null}
            {!loading && visibleTasks.map((task) => (
              <article id={`task-${task.id}`} key={task.id} className={cn('rounded-3xl border border-slate-200 p-5 transition', highlightId === task.id ? 'border-brand-300 bg-brand-50/50' : 'bg-slate-50/70 hover:bg-slate-50')}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{task.status === 'completed' ? '已完成' : '待处理'}</span>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', task.priority === 'high' ? 'bg-rose-100 text-rose-700' : task.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700')}>{task.priority}</span>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-slate-600">{task.description || '暂无描述'}</p>
                    <div className="flex flex-wrap gap-2">{task.tags.length > 0 ? task.tags.map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">#{tag}</span>) : <span className="text-xs text-slate-400">暂无标签</span>}</div>
                    <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                      <p>截止时间：{formatDateTime(task.dueAt)}</p>
                      <p>提醒时间：{formatDateTime(task.snoozeUntil ?? task.remindAt)}</p>
                      <p>星标状态：{task.isStarred ? '已星标' : '普通'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:w-64 lg:justify-end">
                    <button className="rounded-full bg-white p-3 text-amber-500 shadow-sm" aria-label={task.isStarred ? '取消星标' : '加入星标'} onClick={() => void patchTask(`/api/tasks/${task.id}/${task.isStarred ? 'unstar' : 'star'}`, { method: 'POST' })}><Star size={16} fill={task.isStarred ? 'currentColor' : 'none'} /></button>
                    <button className="rounded-full bg-white p-3 text-emerald-600 shadow-sm" aria-label={task.status === 'completed' ? '取消完成' : '标记完成'} onClick={() => void patchTask(`/api/tasks/${task.id}/${task.status === 'completed' ? 'uncomplete' : 'complete'}`, { method: 'POST' })}><Check size={16} /></button>
                    <button className="rounded-full bg-white p-3 text-sky-600 shadow-sm" aria-label="编辑任务" onClick={() => { setActiveTask(task); setModalOpen(true); }}><Pencil size={16} /></button>
                    <button className="rounded-full bg-white p-3 text-rose-600 shadow-sm" aria-label="删除任务" onClick={() => void deleteOne(task.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <TaskModal open={modalOpen} task={activeTask} onClose={() => { if (!saving) { setModalOpen(false); setActiveTask(null); } }} onSave={saveTask} />
      <ReminderCenter tasks={reminders.queue} onComplete={reminders.complete} onSnooze={reminders.snooze} onView={viewTask} />
    </main>
  );
}
