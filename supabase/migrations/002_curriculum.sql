-- ============================================================
-- SDLE Compass — Migration 002: Curriculum tables
-- Phase 3: Subtopics, learning objectives, student topic progress
-- Safe to re-run: all statements are idempotent
-- ============================================================

-- Add description_ar column to topics if not present
alter table public.topics add column if not exists description_ar text not null default '';

-- ── SUBTOPICS ──────────────────────────────────────────────────────
create table if not exists public.subtopics (
  id            uuid         primary key default uuid_generate_v4(),
  topic_id      uuid         not null references public.topics(id) on delete cascade,
  name          text         not null,
  name_ar       text         not null default '',
  description   text,
  display_order integer      not null default 0,
  is_active     boolean      not null default true,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

alter table public.subtopics enable row level security;

drop policy if exists "Subtopics: read active" on public.subtopics;
create policy "Subtopics: read active" on public.subtopics
  for select using (is_active = true or public.is_admin());

drop policy if exists "Subtopics: admin write" on public.subtopics;
create policy "Subtopics: admin write" on public.subtopics
  for all using (public.is_admin());

drop trigger if exists subtopics_updated_at on public.subtopics;
create trigger subtopics_updated_at
  before update on public.subtopics
  for each row execute procedure public.touch_updated_at();

-- ── LEARNING OBJECTIVES ────────────────────────────────────────────
create table if not exists public.learning_objectives (
  id            uuid         primary key default uuid_generate_v4(),
  subtopic_id   uuid         not null references public.subtopics(id) on delete cascade,
  text          text         not null,
  text_ar       text         not null default '',
  bloom_level   text         not null default 'knowledge'
                             check (bloom_level in (
                               'knowledge','comprehension','application',
                               'analysis','synthesis','evaluation'
                             )),
  display_order integer      not null default 0,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

alter table public.learning_objectives enable row level security;

drop policy if exists "LOs: all can read" on public.learning_objectives;
create policy "LOs: all can read" on public.learning_objectives
  for select using (true);

drop policy if exists "LOs: admin write" on public.learning_objectives;
create policy "LOs: admin write" on public.learning_objectives
  for all using (public.is_admin());

drop trigger if exists learning_objectives_updated_at on public.learning_objectives;
create trigger learning_objectives_updated_at
  before update on public.learning_objectives
  for each row execute procedure public.touch_updated_at();

-- ── STUDENT TOPIC PROGRESS ─────────────────────────────────────────
create table if not exists public.student_topic_progress (
  id              uuid         primary key default uuid_generate_v4(),
  user_id         uuid         not null references public.users(id) on delete cascade,
  topic_id        uuid         not null references public.topics(id) on delete cascade,
  status          text         not null default 'not_started'
                               check (status in ('not_started','in_progress','completed')),
  last_studied_at timestamptz,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now(),
  unique (user_id, topic_id)
);

alter table public.student_topic_progress enable row level security;

drop policy if exists "Topic progress: own" on public.student_topic_progress;
create policy "Topic progress: own" on public.student_topic_progress
  for all using (auth.uid() = user_id);

drop policy if exists "Topic progress: admin read" on public.student_topic_progress;
create policy "Topic progress: admin read" on public.student_topic_progress
  for select using (public.is_admin());

drop trigger if exists student_topic_progress_updated_at on public.student_topic_progress;
create trigger student_topic_progress_updated_at
  before update on public.student_topic_progress
  for each row execute procedure public.touch_updated_at();
