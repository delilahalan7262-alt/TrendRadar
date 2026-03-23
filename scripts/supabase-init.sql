create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  tags text[] not null default '{}',
  "isStarred" boolean not null default false,
  "dueAt" timestamptz,
  "remindAt" timestamptz,
  "reminderEnabled" boolean not null default false,
  "reminderSent" boolean not null default false,
  "snoozeUntil" timestamptz,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_priority_idx on public.tasks (priority);
create index if not exists tasks_due_at_idx on public.tasks ("dueAt");
create index if not exists tasks_remind_at_idx on public.tasks ("remindAt");
create index if not exists tasks_tags_gin_idx on public.tasks using gin (tags);

create or replace function public.set_tasks_updated_at()
returns trigger as $$
begin
  new."updatedAt" = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_tasks_updated_at();
