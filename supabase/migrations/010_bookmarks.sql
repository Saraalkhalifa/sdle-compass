-- ============================================================
-- SDLE Compass — Migration 010: Bookmarks
-- Phase 13: Student bookmark collection
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.student_bookmarks (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  item_type   text        not null
              check (item_type in ('question', 'topic', 'flashcard_deck')),
  item_id     uuid        not null,
  title       text        not null,
  subtitle    text,
  item_route  text,
  created_at  timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.student_bookmarks enable row level security;

drop policy if exists "Bookmarks: own" on public.student_bookmarks;
create policy "Bookmarks: own" on public.student_bookmarks
  for all using (auth.uid() = user_id);

create index if not exists student_bookmarks_user_type_idx
  on public.student_bookmarks(user_id, item_type);
