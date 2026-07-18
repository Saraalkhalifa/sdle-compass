-- ============================================================
-- SDLE Compass — Supabase Production Schema
-- Phase 1: Core user/auth tables
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "vector"; -- for Phase 11 AI embeddings

-- ── USERS (profiles, 1:1 with auth.users) ────────────────────────
create table if not exists public.users (
  id                 uuid        primary key references auth.users(id) on delete cascade,
  email              text        not null unique,
  full_name          text        not null,
  role               text        not null default 'student'
                                 check (role in ('student', 'editor', 'reviewer', 'admin', 'main_admin')),
  account_status     text        not null default 'pending'
                                 check (account_status in ('pending', 'active', 'suspended', 'deleted')),
  preferred_language text        not null default 'en'
                                 check (preferred_language in ('en', 'ar')),
  university         text,
  graduation_year    integer     check (graduation_year is null or (graduation_year >= 1990 and graduation_year <= 2040)),
  exam_date          date,
  weekly_hours       numeric(4,1) check (weekly_hours is null or (weekly_hours > 0 and weekly_hours <= 80)),
  previous_attempt   boolean     not null default false,
  avatar_color       text        not null default 'bg-blue-500',
  notification_prefs jsonb       not null default '{"email": true, "inapp": true}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role, account_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'student'),
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.touch_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────
alter table public.users enable row level security;

-- Users can read their own row
create policy "Users: read own" on public.users
  for select using (auth.uid() = id);

-- Users can update their own non-role fields
create policy "Users: update own (no role change)" on public.users
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));

-- Admins can read all users
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select role in ('admin', 'main_admin') from public.users where id = auth.uid();
$$;

create policy "Admins: read all users" on public.users
  for select using (public.is_admin());

create policy "Admins: update all users" on public.users
  for update using (public.is_admin());

-- ── SUBJECTS ──────────────────────────────────────────────────────
create table if not exists public.subjects (
  id            uuid        primary key default uuid_generate_v4(),
  name          text        not null,
  name_ar       text        not null default '',
  description   text        not null default '',
  description_ar text       not null default '',
  icon          text        not null default '📚',
  color         text        not null default 'bg-blue-500',
  exam_weight   numeric(5,2)not null default 0 check (exam_weight >= 0 and exam_weight <= 100),
  display_order integer     not null default 0,
  is_active     boolean     not null default true,
  created_by    uuid        references public.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.subjects enable row level security;

create policy "Subjects: all read published" on public.subjects
  for select using (is_active = true or public.is_admin());

create policy "Subjects: admin write" on public.subjects
  for all using (public.is_admin());

create trigger subjects_updated_at
  before update on public.subjects
  for each row execute procedure public.touch_updated_at();

-- ── TOPICS ────────────────────────────────────────────────────────
create table if not exists public.topics (
  id              uuid        primary key default uuid_generate_v4(),
  subject_id      uuid        not null references public.subjects(id) on delete cascade,
  name            text        not null,
  name_ar         text        not null default '',
  description     text,
  display_order   integer     not null default 0,
  estimated_hours numeric(4,1)not null default 1,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.topics enable row level security;
create policy "Topics: read active" on public.topics
  for select using (is_active = true or public.is_admin());
create policy "Topics: admin write" on public.topics
  for all using (public.is_admin());
create trigger topics_updated_at
  before update on public.topics
  for each row execute procedure public.touch_updated_at();

-- ── AUDIT LOGS ────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references public.users(id),
  action      text        not null,
  target_type text,
  target_id   uuid,
  details     jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create policy "Audit: admin read" on public.audit_logs
  for select using (public.is_admin());
create policy "Audit: system insert" on public.audit_logs
  for insert with check (true);

-- ── SEED DATA (development) ───────────────────────────────────────
insert into public.subjects (name, name_ar, icon, color, exam_weight, display_order) values
  ('Restorative Dentistry',       'طب الأسنان التحفظي',          '🦷', 'bg-blue-500',    20, 1),
  ('Endodontics',                 'علاج الجذور',                  '🔬', 'bg-teal-500',    15, 2),
  ('Periodontics',                'أمراض اللثة',                  '🩺', 'bg-emerald-500', 15, 3),
  ('Prosthodontics',              'تعويضات الأسنان',              '⚕️', 'bg-violet-500',  12, 4),
  ('Oral & Maxillofacial Surgery','جراحة الفم والوجه والفكين',    '🏥', 'bg-rose-500',    10, 5),
  ('Oral Medicine & Pathology',   'طب الفم وعلم الأمراض',        '📋', 'bg-amber-500',    8, 6),
  ('Pediatric Dentistry',         'طب أسنان الأطفال',            '👶', 'bg-pink-500',     6, 7),
  ('Orthodontics',                'تقويم الأسنان',               '📐', 'bg-indigo-500',   5, 8),
  ('Dental Radiology',            'الأشعة السنية',               '📡', 'bg-cyan-500',     4, 9),
  ('Dental Anatomy',              'تشريح الأسنان',               '🔍', 'bg-lime-500',     3, 10),
  ('Pharmacology',                'علم الأدوية',                 '💊', 'bg-orange-500',   2, 11),
  ('Medical Emergencies',         'الطوارئ الطبية',              '🚨', 'bg-red-500',      1, 12),
  ('Infection Control & Ethics',  'مكافحة العدوى والأخلاقيات',   '🛡️', 'bg-slate-500',   2, 13),
  ('Occlusion',                   'الإطباق',                     '🦴', 'bg-yellow-500',   2, 14),
  ('Basic Implantology',          'أساسيات زراعة الأسنان',       '⚙️', 'bg-stone-500',    1, 15)
on conflict do nothing;
