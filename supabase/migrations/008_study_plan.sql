-- ============================================================
-- SDLE Compass — Migration 008: Study Plan
-- Phase 10: Personalised study sessions
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.study_sessions (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references public.users(id) on delete cascade,
  topic_id       uuid        references public.topics(id) on delete set null,
  subject_id     uuid        references public.subjects(id) on delete set null,
  session_type   text        not null default 'study'
                             check (session_type in ('study', 'review', 'mock_exam', 'break')),
  scheduled_date date        not null,
  duration_mins  integer     not null default 60,
  title          text        not null,
  is_completed   boolean     not null default false,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.study_sessions enable row level security;

drop policy if exists "Study sessions: own" on public.study_sessions;
create policy "Study sessions: own" on public.study_sessions
  for all using (auth.uid() = user_id);

drop trigger if exists study_sessions_updated_at on public.study_sessions;
create trigger study_sessions_updated_at
  before update on public.study_sessions
  for each row execute procedure public.touch_updated_at();
