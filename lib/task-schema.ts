import { z } from 'zod';

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, '任务标题不能为空'),
  description: z.string().optional().default(''),
  status: z.enum(['pending', 'completed']).optional().default('pending'),
  priority: taskPrioritySchema.optional().default('medium'),
  is_starred: z.boolean().optional().default(false),
  due_at: z.string().datetime().nullable().optional(),
  remind_at: z.string().datetime().nullable().optional(),
  reminder_enabled: z.boolean().optional().default(false),
  reminder_sent: z.boolean().optional().default(false),
  snooze_until: z.string().datetime().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
});

export const snoozeInputSchema = z.object({
  minutes: z.number().int().min(1).max(24 * 60),
});
