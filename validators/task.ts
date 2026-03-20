import { z } from 'zod';

const isoDateSchema = z.string().datetime().nullable().optional();

export const taskStatusSchema = z.enum(['pending', 'completed']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const taskCreateSchema = z
  .object({
    title: z.string().trim().min(1, '任务标题不能为空'),
    description: z.string().optional().default(''),
    status: taskStatusSchema.optional().default('pending'),
    priority: taskPrioritySchema.optional().default('medium'),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
    isStarred: z.boolean().optional().default(false),
    dueAt: isoDateSchema,
    remindAt: isoDateSchema,
    reminderEnabled: z.boolean().optional().default(false),
    reminderSent: z.boolean().optional().default(false),
    snoozeUntil: isoDateSchema,
  })
  .superRefine((value, ctx) => {
    if (value.reminderEnabled && !value.remindAt && !value.snoozeUntil) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['remindAt'], message: '开启提醒后必须提供提醒时间' });
    }
  });

export const taskUpdateSchema = taskCreateSchema.partial();

export const snoozeInputSchema = z.object({
  minutes: z.number().int().min(1, '至少延后 1 分钟').max(24 * 60, '最多延后 24 小时'),
});

export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  tag: z.string().trim().min(1).optional(),
  starred: z.enum(['true', 'false']).optional(),
  dueToday: z.enum(['true', 'false']).optional(),
  query: z.string().trim().optional(),
});
