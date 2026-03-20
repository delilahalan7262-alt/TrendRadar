'use client';

import { Task } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export function ReminderCenter({
  tasks,
  onComplete,
  onSnooze,
  onView,
}: {
  tasks: Task[];
  onComplete: (taskId: string) => Promise<void>;
  onSnooze: (taskId: string, minutes: number) => Promise<void>;
  onView: (taskId: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-30 flex w-full max-w-sm flex-col gap-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-3xl border border-brand-100 bg-white/95 p-4 shadow-card backdrop-blur">
          <p className="text-sm font-semibold text-brand-600">你有一个待处理任务</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{task.title}</h3>
          <div className="mt-3 space-y-1 text-sm text-slate-500">
            <p>提醒时间：{formatDateTime(task.snooze_until ?? task.remind_at)}</p>
            <p>截止时间：{formatDateTime(task.due_at)}</p>
            <p>优先级：{task.priority}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full bg-brand-500 px-3 py-2 text-xs font-medium text-white" onClick={() => onComplete(task.id)}>完成任务</button>
            <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium" onClick={() => onSnooze(task.id, 10)}>稍后10分钟</button>
            <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium" onClick={() => onSnooze(task.id, 30)}>稍后30分钟</button>
            <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-medium text-amber-700" onClick={() => onView(task.id)}>查看任务</button>
          </div>
        </div>
      ))}
    </div>
  );
}
