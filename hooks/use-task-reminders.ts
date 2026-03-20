'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiResponse } from '@/lib/types';
import { Task } from '@/types/task';

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message ?? '请求失败');
  }
  return json.data;
}

export function useTaskReminders(onTaskChange: (task: Task) => void) {
  const [queue, setQueue] = useState<Task[]>([]);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    let stopped = false;

    const poll = async () => {
      try {
        const due = await readJson<Task[]>('/api/tasks/reminders/due');
        if (stopped) return;
        setQueue((current) => {
          const next = [...current];
          for (const task of due) {
            if (!seen.current.has(task.id)) {
              seen.current.add(task.id);
              next.push(task);

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                const notification = new Notification('你有一个待处理任务', {
                  body: `${task.title} · ${task.priority.toUpperCase()}`,
                  tag: task.id,
                });
                notification.onclick = () => {
                  window.focus();
                  document.getElementById(`task-${task.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                };
              }

              readJson<Task>(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reminderSent: true }),
              })
                .then(onTaskChange)
                .catch(() => undefined);
            }
          }
          return next;
        });
      } catch {
        // ignore transient polling errors in MVP
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 30_000);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [onTaskChange]);

  const actions = useMemo(
    () => ({
      async complete(taskId: string) {
        const task = await readJson<Task>(`/api/tasks/${taskId}/complete`, { method: 'POST' });
        onTaskChange(task);
        setQueue((current) => current.filter((item) => item.id !== taskId));
        seen.current.delete(taskId);
      },
      async snooze(taskId: string, minutes: number) {
        const task = await readJson<Task>(`/api/tasks/${taskId}/snooze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes }),
        });
        onTaskChange(task);
        setQueue((current) => current.filter((item) => item.id !== taskId));
        seen.current.delete(taskId);
      },
    }),
    [onTaskChange],
  );

  return { queue, ...actions };
}
