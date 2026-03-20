'use client';

import { useEffect, useState } from 'react';
import { priorityOptions } from '@/lib/constants';
import { Task, TaskFormInput } from '@/lib/types';
import { formatDateTimeInput } from '@/lib/utils';

const emptyTask: TaskFormInput = {
  title: '',
  description: '',
  priority: 'medium',
  tags: [],
  due_at: null,
  reminder_enabled: false,
  remind_at: null,
  is_starred: false,
};

export function TaskModal({
  open,
  task,
  onClose,
  onSave,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (payload: TaskFormInput) => Promise<void>;
}) {
  const [form, setForm] = useState<TaskFormInput>(emptyTask);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            title: task.title,
            description: task.description,
            priority: task.priority,
            tags: task.tags,
            due_at: task.due_at,
            reminder_enabled: task.reminder_enabled,
            remind_at: task.remind_at,
            is_starred: task.is_starred,
          }
        : emptyTask,
    );
    setError('');
  }, [open, task]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{task ? '编辑任务' : '新建任务'}</h2>
            <p className="text-sm text-slate-500">标题必填，可直接填写提醒时间用于测试通知。</p>
          </div>
          <button className="rounded-full bg-slate-100 px-3 py-1 text-sm" onClick={onClose}>
            取消
          </button>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!form.title.trim()) {
              setError('请输入任务标题');
              return;
            }
            if (form.reminder_enabled && !form.remind_at) {
              setError('开启提醒后，请设置提醒时间');
              return;
            }
            setSaving(true);
            setError('');
            try {
              await onSave(form);
              onClose();
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : '保存失败');
            } finally {
              setSaving(false);
            }
          }}
        >
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">任务标题</span>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="例如：下午 3 点前完成周报"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">任务描述</span>
            <textarea
              className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="补充任务细节、交付内容或备注"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">优先级</span>
            <select className="rounded-2xl border border-slate-200 px-4 py-3" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">标签</span>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="逗号分隔，例如 工作, 重要"
              value={form.tags.join(', ')}
              onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">截止时间</span>
            <input
              type="datetime-local"
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={formatDateTimeInput(form.due_at)}
              onChange={(e) => setForm({ ...form, due_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">提醒时间</span>
            <input
              type="datetime-local"
              className="rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={!form.reminder_enabled}
              value={formatDateTimeInput(form.remind_at)}
              onChange={(e) => setForm({ ...form, remind_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={form.reminder_enabled} onChange={(e) => setForm({ ...form, reminder_enabled: e.target.checked, remind_at: e.target.checked ? form.remind_at : null })} />
            <span className="text-sm font-medium text-slate-700">开启提醒</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={form.is_starred} onChange={(e) => setForm({ ...form, is_starred: e.target.checked })} />
            <span className="text-sm font-medium text-slate-700">加入星标</span>
          </label>
          {error ? <p className="text-sm text-rose-500 md:col-span-2">{error}</p> : null}
          <div className="flex justify-end gap-3 md:col-span-2">
            <button type="button" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium" onClick={onClose}>
              取消
            </button>
            <button type="submit" disabled={saving} className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
              {saving ? '保存中...' : '保存任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
