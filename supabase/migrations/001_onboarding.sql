-- ============================================================
-- SDLE Compass — Migration 001: Onboarding tables
-- Safe to re-run: all statements are idempotent
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Add onboarding flag to users ──────────────────────────────
alter table public.users
  add column if not exists onboarding_completed boolean not null default false;

-- ── 2. Update handle_new_user to capture preferred_language ──────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role, account_status, preferred_language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'student'),
    'pending',
    coalesce(nullif(new.raw_user_meta_data->>'preferred_language', ''), 'en')
  );
  return new;
end;
$$;

-- ── 3. Student exam settings ──────────────────────────────────────
create table if not exists public.student_exam_settings (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null unique references public.users(id) on delete cascade,
  exam_booked      boolean,
  exam_date        date,
  exam_period      text        check (exam_period in (
                                 'within_1_month','within_2_3_months',
                                 'within_4_6_months','more_than_6_months','not_sure')),
  is_first_attempt boolean     not null default true,
  previous_score   numeric(5,2),
  target_score     numeric(5,2),
  study_start_date date,
  revision_days    integer     not null default 7,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.student_exam_settings enable row level security;
drop policy if exists "ExamSettings: own" on public.student_exam_settings;
create policy "ExamSettings: own" on public.student_exam_settings
  for all using (auth.uid() = user_id);
drop trigger if exists exam_settings_updated_at on public.student_exam_settings;
create trigger exam_settings_updated_at
  before update on public.student_exam_settings
  for each row execute procedure public.touch_updated_at();

-- ── 4. Student current focus ──────────────────────────────────────
create table if not exists public.student_current_focus (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null unique references public.users(id) on delete cascade,
  focus_type          text,
  priority_subject_id uuid        references public.subjects(id) on delete set null,
  focus_duration      text,
  focus_reason        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.student_current_focus enable row level security;
drop policy if exists "CurrentFocus: own" on public.student_current_focus;
create policy "CurrentFocus: own" on public.student_current_focus
  for all using (auth.uid() = user_id);
drop trigger if exists current_focus_updated_at on public.student_current_focus;
create trigger current_focus_updated_at
  before update on public.student_current_focus
  for each row execute procedure public.touch_updated_at();

-- ── 5. Student availability ───────────────────────────────────────
create table if not exists public.student_availability (
  id                       uuid        primary key default uuid_generate_v4(),
  user_id                  uuid        not null unique references public.users(id) on delete cascade,
  monday_hours             numeric(4,1) not null default 0,
  tuesday_hours            numeric(4,1) not null default 0,
  wednesday_hours          numeric(4,1) not null default 0,
  thursday_hours           numeric(4,1) not null default 0,
  friday_hours             numeric(4,1) not null default 0,
  saturday_hours           numeric(4,1) not null default 0,
  sunday_hours             numeric(4,1) not null default 0,
  preferred_session_length text        not null default '45',
  preferred_study_time     text        not null default 'no_preference',
  rest_day                 text,
  has_work_commitments     boolean     not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.student_availability enable row level security;
drop policy if exists "Availability: own" on public.student_availability;
create policy "Availability: own" on public.student_availability
  for all using (auth.uid() = user_id);
drop trigger if exists availability_updated_at on public.student_availability;
create trigger availability_updated_at
  before update on public.student_availability
  for each row execute procedure public.touch_updated_at();

-- ── 6. Study preferences ─────────────────────────────────────────
create table if not exists public.study_preferences (
  id                        uuid        primary key default uuid_generate_v4(),
  user_id                   uuid        not null unique references public.users(id) on delete cascade,
  current_position          text,
  previous_study_methods    text[]      not null default '{}',
  study_style               text,
  resource_order            text        not null default 'mixed',
  preferred_formats         text[]      not null default '{}',
  answer_preference         text        not null default 'after_question',
  explanation_detail        text        not null default 'detailed',
  notification_preferences  text[]      not null default '{}',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.study_preferences enable row level security;
drop policy if exists "StudyPrefs: own" on public.study_preferences;
create policy "StudyPrefs: own" on public.study_preferences
  for all using (auth.uid() = user_id);
drop trigger if exists study_prefs_updated_at on public.study_preferences;
create trigger study_prefs_updated_at
  before update on public.study_preferences
  for each row execute procedure public.touch_updated_at();

-- ── 7. Specialty preferences ─────────────────────────────────────
create table if not exists public.specialty_preferences (
  id                    uuid        primary key default uuid_generate_v4(),
  user_id               uuid        not null unique references public.users(id) on delete cascade,
  primary_specialty     text,
  secondary_specialties text[]      not null default '{}',
  enrichment_level      text        not null default 'none'
                                    check (enrichment_level in ('none','light','moderate','advanced')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.specialty_preferences enable row level security;
drop policy if exists "SpecialtyPrefs: own" on public.specialty_preferences;
create policy "SpecialtyPrefs: own" on public.specialty_preferences
  for all using (auth.uid() = user_id);
drop trigger if exists specialty_prefs_updated_at on public.specialty_preferences;
create trigger specialty_prefs_updated_at
  before update on public.specialty_preferences
  for each row execute procedure public.touch_updated_at();

-- ── 8. Subject confidence ─────────────────────────────────────────
create table if not exists public.subject_confidence (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  subject_id       uuid        not null references public.subjects(id) on delete cascade,
  confidence_level text        not null default 'not_started'
                               check (confidence_level in (
                                 'not_started','low','developing','good','strong','not_sure')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, subject_id)
);

alter table public.subject_confidence enable row level security;
drop policy if exists "SubjectConfidence: own" on public.subject_confidence;
create policy "SubjectConfidence: own" on public.subject_confidence
  for all using (auth.uid() = user_id);
drop trigger if exists subject_confidence_updated_at on public.subject_confidence;
create trigger subject_confidence_updated_at
  before update on public.subject_confidence
  for each row execute procedure public.touch_updated_at();

-- ── 9. Onboarding progress ────────────────────────────────────────
create table if not exists public.onboarding_progress (
  id                         uuid        primary key default uuid_generate_v4(),
  user_id                    uuid        not null unique references public.users(id) on delete cascade,
  last_step                  integer     not null default 1,
  exam_details_done          boolean     not null default false,
  current_position_done      boolean     not null default false,
  immediate_focus_done       boolean     not null default false,
  availability_done          boolean     not null default false,
  resource_preferences_done  boolean     not null default false,
  specialty_preferences_done boolean     not null default false,
  learning_preferences_done  boolean     not null default false,
  completed_at               timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

alter table public.onboarding_progress enable row level security;
drop policy if exists "OnboardingProgress: own" on public.onboarding_progress;
create policy "OnboardingProgress: own" on public.onboarding_progress
  for all using (auth.uid() = user_id);
drop trigger if exists onboarding_progress_updated_at on public.onboarding_progress;
create trigger onboarding_progress_updated_at
  before update on public.onboarding_progress
  for each row execute procedure public.touch_updated_at();
