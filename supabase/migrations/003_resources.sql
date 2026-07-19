-- ============================================================
-- SDLE Compass — Migration 003: Resources
-- Phase 4: Topic-linked PDFs, videos, and reference links
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.resources (
  id            uuid         primary key default uuid_generate_v4(),
  topic_id      uuid         not null references public.topics(id) on delete cascade,
  type          text         not null check (type in ('pdf', 'video', 'link')),
  title         text         not null,
  title_ar      text         not null default '',
  description   text,
  url           text         not null,
  duration_mins integer,
  display_order integer      not null default 0,
  is_active     boolean      not null default true,
  created_by    uuid         references public.users(id),
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

alter table public.resources enable row level security;

drop policy if exists "Resources: read active" on public.resources;
create policy "Resources: read active" on public.resources
  for select using (is_active = true or public.is_admin());

drop policy if exists "Resources: admin write" on public.resources;
create policy "Resources: admin write" on public.resources
  for all using (public.is_admin());

drop trigger if exists resources_updated_at on public.resources;
create trigger resources_updated_at
  before update on public.resources
  for each row execute procedure public.touch_updated_at();
