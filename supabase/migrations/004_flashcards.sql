-- ============================================================
-- SDLE Compass — Migration 004: Flashcards
-- Phase 5: Flashcard decks, cards, and per-user progress
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.flashcard_decks (
  id            uuid         primary key default uuid_generate_v4(),
  topic_id      uuid         not null references public.topics(id) on delete cascade,
  name          text         not null,
  name_ar       text         not null default '',
  description   text,
  display_order integer      not null default 0,
  is_active     boolean      not null default true,
  created_by    uuid         references public.users(id),
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create table if not exists public.flashcards (
  id            uuid         primary key default uuid_generate_v4(),
  deck_id       uuid         not null references public.flashcard_decks(id) on delete cascade,
  front_text    text         not null,
  front_text_ar text         not null default '',
  back_text     text         not null,
  back_text_ar  text         not null default '',
  hint          text,
  display_order integer      not null default 0,
  is_active     boolean      not null default true,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create table if not exists public.student_flashcard_progress (
  id               uuid         primary key default uuid_generate_v4(),
  user_id          uuid         not null references public.users(id) on delete cascade,
  flashcard_id     uuid         not null references public.flashcards(id) on delete cascade,
  status           text         not null default 'new' check (status in ('new', 'learning', 'known')),
  review_count     integer      not null default 0,
  last_reviewed_at timestamptz,
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now(),
  unique(user_id, flashcard_id)
);

-- RLS: flashcard_decks
alter table public.flashcard_decks enable row level security;
drop policy if exists "Decks: read active" on public.flashcard_decks;
create policy "Decks: read active" on public.flashcard_decks
  for select using (is_active = true or public.is_admin());
drop policy if exists "Decks: admin write" on public.flashcard_decks;
create policy "Decks: admin write" on public.flashcard_decks
  for all using (public.is_admin());

-- RLS: flashcards
alter table public.flashcards enable row level security;
drop policy if exists "Flashcards: read active" on public.flashcards;
create policy "Flashcards: read active" on public.flashcards
  for select using (is_active = true or public.is_admin());
drop policy if exists "Flashcards: admin write" on public.flashcards;
create policy "Flashcards: admin write" on public.flashcards
  for all using (public.is_admin());

-- RLS: student_flashcard_progress
alter table public.student_flashcard_progress enable row level security;
drop policy if exists "Flashcard progress: own" on public.student_flashcard_progress;
create policy "Flashcard progress: own" on public.student_flashcard_progress
  for all using (auth.uid() = user_id);
drop policy if exists "Flashcard progress: admin read" on public.student_flashcard_progress;
create policy "Flashcard progress: admin read" on public.student_flashcard_progress
  for select using (public.is_admin());

-- Triggers
drop trigger if exists flashcard_decks_updated_at on public.flashcard_decks;
create trigger flashcard_decks_updated_at
  before update on public.flashcard_decks
  for each row execute procedure public.touch_updated_at();

drop trigger if exists flashcards_updated_at on public.flashcards;
create trigger flashcards_updated_at
  before update on public.flashcards
  for each row execute procedure public.touch_updated_at();

drop trigger if exists student_flashcard_progress_updated_at on public.student_flashcard_progress;
create trigger student_flashcard_progress_updated_at
  before update on public.student_flashcard_progress
  for each row execute procedure public.touch_updated_at();
