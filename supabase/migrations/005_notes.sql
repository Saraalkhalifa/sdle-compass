-- ============================================================
-- SDLE Compass — Migration 005: Notes
-- Phase 6: Admin study notes and student personal notes per topic
-- Safe to re-run: all statements are idempotent
-- ============================================================

-- Admin-curated study summaries per topic
create table if not exists public.topic_notes (
  id            uuid         primary key default uuid_generate_v4(),
  topic_id      uuid         not null references public.topics(id) on delete cascade,
  title         text         not null,
  title_ar      text         not null default '',
  content       text         not null default '',
  content_ar    text         not null default '',
  display_order integer      not null default 0,
  is_active     boolean      not null default true,
  created_by    uuid         references public.users(id),
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

-- Student personal notes per topic (one per user per topic)
create table if not exists public.student_notes (
  id         uuid         primary key default uuid_generate_v4(),
  user_id    uuid         not null references public.users(id) on delete cascade,
  topic_id   uuid         not null references public.topics(id) on delete cascade,
  content    text         not null default '',
  created_at timestamptz  not null default now(),
  updated_at timestamptz  not null default now(),
  unique(user_id, topic_id)
);

-- RLS: topic_notes
alter table public.topic_notes enable row level security;
drop policy if exists "Topic notes: read active" on public.topic_notes;
create policy "Topic notes: read active" on public.topic_notes
  for select using (is_active = true or public.is_admin());
drop policy if exists "Topic notes: admin write" on public.topic_notes;
create policy "Topic notes: admin write" on public.topic_notes
  for all using (public.is_admin());

-- RLS: student_notes
alter table public.student_notes enable row level security;
drop policy if exists "Student notes: own" on public.student_notes;
create policy "Student notes: own" on public.student_notes
  for all using (auth.uid() = user_id);
drop policy if exists "Student notes: admin read" on public.student_notes;
create policy "Student notes: admin read" on public.student_notes
  for select using (public.is_admin());

-- Triggers
drop trigger if exists topic_notes_updated_at on public.topic_notes;
create trigger topic_notes_updated_at
  before update on public.topic_notes
  for each row execute procedure public.touch_updated_at();

drop trigger if exists student_notes_updated_at on public.student_notes;
create trigger student_notes_updated_at
  before update on public.student_notes
  for each row execute procedure public.touch_updated_at();
