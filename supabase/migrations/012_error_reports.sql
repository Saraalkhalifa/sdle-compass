-- ── Error reports (student-flagged content issues) ────────────────────────────
create table if not exists public.error_reports (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  question_id   uuid references public.questions(id) on delete set null,
  resource_id   uuid references public.resources(id)  on delete set null,
  type          text not null default 'other'
    check (type in ('wrong_answer', 'broken_link', 'typo', 'outdated_content', 'other')),
  description   text not null,
  status        text not null default 'open'
    check (status in ('open', 'in_review', 'resolved', 'dismissed')),
  admin_notes   text,
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

alter table public.error_reports enable row level security;

-- Students: can insert and see their own reports
drop policy if exists "Error reports: student own" on public.error_reports;
create policy "Error reports: student own" on public.error_reports
  for all using (auth.uid() = user_id);

-- Admins: full access
drop policy if exists "Error reports: admin all" on public.error_reports;
create policy "Error reports: admin all" on public.error_reports
  for all using (public.is_admin());

create index if not exists error_reports_status_idx  on public.error_reports (status, created_at desc);
create index if not exists error_reports_user_idx    on public.error_reports (user_id);
create index if not exists error_reports_question_idx on public.error_reports (question_id);
