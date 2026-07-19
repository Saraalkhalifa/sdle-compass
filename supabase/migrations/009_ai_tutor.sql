-- ============================================================
-- SDLE Compass — Migration 009: AI Tutor
-- Phase 11: Conversation history storage
-- Safe to re-run: all statements are idempotent
-- ============================================================

create table if not exists public.ai_conversations (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references public.users(id) on delete cascade,
  title      text        not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id              uuid        primary key default uuid_generate_v4(),
  conversation_id uuid        not null references public.ai_conversations(id) on delete cascade,
  role            text        not null check (role in ('user', 'assistant')),
  content         text        not null,
  created_at      timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "AI conversations: own" on public.ai_conversations;
create policy "AI conversations: own" on public.ai_conversations
  for all using (auth.uid() = user_id);

drop policy if exists "AI messages: own conversation" on public.ai_messages;
create policy "AI messages: own conversation" on public.ai_messages
  for all using (
    exists (
      select 1 from public.ai_conversations
      where id = conversation_id and user_id = auth.uid()
    )
  );

drop trigger if exists ai_conversations_updated_at on public.ai_conversations;
create trigger ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute procedure public.touch_updated_at();

create index if not exists ai_messages_conversation_id_idx on public.ai_messages(conversation_id);
create index if not exists ai_conversations_user_id_idx on public.ai_conversations(user_id);
