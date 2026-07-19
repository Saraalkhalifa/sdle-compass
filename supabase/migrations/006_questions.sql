-- ============================================================
-- SDLE Compass — Migration 006: Question Bank
-- Phase 7: MCQ questions, answer options, and student attempts
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.questions (
  id               uuid         primary key default uuid_generate_v4(),
  topic_id         uuid         not null references public.topics(id) on delete cascade,
  question_text    text         not null,
  question_text_ar text         not null default '',
  explanation      text,
  explanation_ar   text,
  difficulty       text         not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  display_order    integer      not null default 0,
  is_active        boolean      not null default true,
  created_by       uuid         references public.users(id),
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now()
);

create table if not exists public.question_options (
  id             uuid         primary key default uuid_generate_v4(),
  question_id    uuid         not null references public.questions(id) on delete cascade,
  option_text    text         not null,
  option_text_ar text         not null default '',
  is_correct     boolean      not null default false,
  display_order  integer      not null default 0,
  created_at     timestamptz  not null default now()
);

-- Tracks every student answer attempt (multiple attempts allowed)
create table if not exists public.student_question_attempts (
  id                 uuid         primary key default uuid_generate_v4(),
  user_id            uuid         not null references public.users(id) on delete cascade,
  question_id        uuid         not null references public.questions(id) on delete cascade,
  selected_option_id uuid         references public.question_options(id) on delete set null,
  is_correct         boolean      not null default false,
  created_at         timestamptz  not null default now()
);

-- RLS: questions
alter table public.questions enable row level security;
drop policy if exists "Questions: read active" on public.questions;
create policy "Questions: read active" on public.questions
  for select using (is_active = true or public.is_admin());
drop policy if exists "Questions: admin write" on public.questions;
create policy "Questions: admin write" on public.questions
  for all using (public.is_admin());

-- RLS: question_options (read by authenticated users; write by admin)
alter table public.question_options enable row level security;
drop policy if exists "Options: read" on public.question_options;
create policy "Options: read" on public.question_options
  for select using (auth.role() = 'authenticated');
drop policy if exists "Options: admin write" on public.question_options;
create policy "Options: admin write" on public.question_options
  for all using (public.is_admin());

-- RLS: student_question_attempts
alter table public.student_question_attempts enable row level security;
drop policy if exists "Attempts: own" on public.student_question_attempts;
create policy "Attempts: own" on public.student_question_attempts
  for all using (auth.uid() = user_id);
drop policy if exists "Attempts: admin read" on public.student_question_attempts;
create policy "Attempts: admin read" on public.student_question_attempts
  for select using (public.is_admin());

-- Trigger
drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at
  before update on public.questions
  for each row execute procedure public.touch_updated_at();
