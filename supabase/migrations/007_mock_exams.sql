-- ============================================================
-- SDLE Compass — Migration 007: Mock Exams
-- Phase 8: Exam templates, sessions, and student answers
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.mock_exams (
  id             uuid        primary key default uuid_generate_v4(),
  title          text        not null,
  title_ar       text        not null default '',
  description    text,
  description_ar text,
  duration_mins  integer     not null default 60,
  passing_score  integer     not null default 60,
  is_active      boolean     not null default true,
  created_by     uuid        references public.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.mock_exam_questions (
  id            uuid    primary key default uuid_generate_v4(),
  exam_id       uuid    not null references public.mock_exams(id) on delete cascade,
  question_id   uuid    not null references public.questions(id) on delete cascade,
  display_order integer not null default 0,
  unique (exam_id, question_id)
);

create table if not exists public.student_exam_sessions (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.users(id) on delete cascade,
  exam_id         uuid        not null references public.mock_exams(id) on delete cascade,
  started_at      timestamptz not null default now(),
  submitted_at    timestamptz,
  score           integer,
  is_passed       boolean,
  time_taken_secs integer,
  created_at      timestamptz not null default now()
);

create table if not exists public.student_exam_answers (
  id                 uuid        primary key default uuid_generate_v4(),
  session_id         uuid        not null references public.student_exam_sessions(id) on delete cascade,
  question_id        uuid        not null references public.questions(id) on delete cascade,
  selected_option_id uuid        references public.question_options(id) on delete set null,
  is_correct         boolean     not null default false,
  created_at         timestamptz not null default now(),
  unique (session_id, question_id)
);

-- RLS: mock_exams
alter table public.mock_exams enable row level security;
drop policy if exists "Exams: read active" on public.mock_exams;
create policy "Exams: read active" on public.mock_exams
  for select using (is_active = true or public.is_admin());
drop policy if exists "Exams: admin write" on public.mock_exams;
create policy "Exams: admin write" on public.mock_exams
  for all using (public.is_admin());

-- RLS: mock_exam_questions
alter table public.mock_exam_questions enable row level security;
drop policy if exists "ExamQ: read" on public.mock_exam_questions;
create policy "ExamQ: read" on public.mock_exam_questions
  for select using (auth.role() = 'authenticated');
drop policy if exists "ExamQ: admin write" on public.mock_exam_questions;
create policy "ExamQ: admin write" on public.mock_exam_questions
  for all using (public.is_admin());

-- RLS: student_exam_sessions
alter table public.student_exam_sessions enable row level security;
drop policy if exists "Sessions: own" on public.student_exam_sessions;
create policy "Sessions: own" on public.student_exam_sessions
  for all using (auth.uid() = user_id);
drop policy if exists "Sessions: admin read" on public.student_exam_sessions;
create policy "Sessions: admin read" on public.student_exam_sessions
  for select using (public.is_admin());

-- RLS: student_exam_answers
alter table public.student_exam_answers enable row level security;
drop policy if exists "ExamAnswers: own" on public.student_exam_answers;
create policy "ExamAnswers: own" on public.student_exam_answers
  for all using (
    exists (
      select 1 from public.student_exam_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
drop policy if exists "ExamAnswers: admin read" on public.student_exam_answers;
create policy "ExamAnswers: admin read" on public.student_exam_answers
  for select using (public.is_admin());

-- Trigger
drop trigger if exists mock_exams_updated_at on public.mock_exams;
create trigger mock_exams_updated_at
  before update on public.mock_exams
  for each row execute procedure public.touch_updated_at();
