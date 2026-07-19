-- Phase 17: Notifications
-- Safe to re-run (idempotent)

create table if not exists public.notifications (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  type        text        not null default 'system'
                check (type in ('exam_result', 'study_reminder', 'ai_response', 'system', 'achievement')),
  title       text        not null,
  title_ar    text,
  body        text,
  body_ar     text,
  href        text,
  is_read     boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Notifications: own" on public.notifications;
create policy "Notifications: own" on public.notifications
  for all using (auth.uid() = user_id);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

-- Enable realtime for this table (run in SQL Editor or via dashboard)
-- alter publication supabase_realtime add table public.notifications;
