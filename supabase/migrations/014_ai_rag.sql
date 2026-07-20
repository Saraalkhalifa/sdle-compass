-- ============================================================
-- SDLE Compass — Migration 014: AI RAG Infrastructure
-- Adds tables for resource chunking, embeddings, usage logging,
-- and user feedback on AI responses.
-- Safe to re-run: all statements are idempotent.
-- ============================================================

-- Requires pgvector extension (declared in schema.sql)
create extension if not exists vector;

-- ── 1. Resource Chunks (for RAG retrieval) ───────────────────────
-- Stores processed text segments from resources and topic notes,
-- with optional vector embeddings for semantic search.
-- Chunks without embeddings still support full-text search.

create table if not exists public.ai_resource_chunks (
  id              uuid        primary key default uuid_generate_v4(),
  -- Source: exactly one of resource_id or topic_note_id must be set
  resource_id     uuid        references public.resources(id)    on delete cascade,
  topic_note_id   uuid        references public.topic_notes(id)  on delete cascade,
  chunk_index     integer     not null default 0,
  -- Full text content of this chunk
  content         text        not null,
  content_length  integer     generated always as (length(content)) stored,
  -- Structured metadata for filtering and citation display
  -- Fields: title, resource_type, chapter, section, page_number,
  --         pdf_page_index, subject_id, topic_id, language,
  --         review_status, access_level, author, edition, timestamp_start, timestamp_end
  metadata        jsonb       not null default '{}'::jsonb,
  -- Processing status
  embedding_status text       not null default 'pending'
                              check (embedding_status in (
                                'pending','processing','indexed','failed','skipped'
                              )),
  -- Vector embedding (gte-small = 384 dims; OpenAI ada-002 / text-embedding-3-small = 1536 dims)
  -- Column accepts either dimension — insert will fail if dimension mismatch, so pick one and stick to it.
  embedding       vector(1536),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint ai_resource_chunks_source_check check (
    (resource_id is not null) != (topic_note_id is not null)
  )
);

-- Indexes
create index if not exists idx_ai_chunks_resource_id     on public.ai_resource_chunks(resource_id);
create index if not exists idx_ai_chunks_topic_note_id   on public.ai_resource_chunks(topic_note_id);
create index if not exists idx_ai_chunks_embedding_status on public.ai_resource_chunks(embedding_status);
create index if not exists idx_ai_chunks_metadata        on public.ai_resource_chunks using gin(metadata);

-- Full-text search index (works even without embeddings)
create index if not exists idx_ai_chunks_fts_en
  on public.ai_resource_chunks
  using gin(to_tsvector('english', content));

-- Vector index for semantic search (only useful once embeddings exist)
-- Using HNSW for fast approximate nearest-neighbor search
create index if not exists idx_ai_chunks_embedding_hnsw
  on public.ai_resource_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Updated-at trigger
drop trigger if exists ai_resource_chunks_updated_at on public.ai_resource_chunks;
create trigger ai_resource_chunks_updated_at
  before update on public.ai_resource_chunks
  for each row execute procedure public.touch_updated_at();

-- RLS: chunks are managed by admins and read by the edge function (service role)
-- Students do NOT get direct read access — all retrieval goes through the edge function
alter table public.ai_resource_chunks enable row level security;

drop policy if exists "ai_resource_chunks: admin manage" on public.ai_resource_chunks;
create policy "ai_resource_chunks: admin manage" on public.ai_resource_chunks
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('admin', 'main_admin')
    )
  );

-- ── 2. Vector similarity search function ─────────────────────────
-- Called by the edge function (service role) for semantic retrieval.
-- Falls back cleanly if no embeddings exist.

create or replace function public.search_resource_chunks_semantic(
  query_embedding   vector(1536),
  match_count       integer   default 6,
  similarity_threshold float  default 0.3,
  subject_id_filter uuid      default null,
  topic_id_filter   uuid      default null
)
returns table (
  id        uuid,
  content   text,
  metadata  jsonb,
  similarity float
)
language plpgsql security definer
set search_path = public
as $$
begin
  return query
  select
    c.id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.ai_resource_chunks c
  where
    c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= similarity_threshold
    and (subject_id_filter is null or c.metadata->>'subject_id' = subject_id_filter::text)
    and (topic_id_filter is null  or c.metadata->>'topic_id'   = topic_id_filter::text)
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ── 3. Full-text search function ──────────────────────────────────
-- Used when embeddings are not available (or as a hybrid complement).

create or replace function public.search_resource_chunks_text(
  query_text        text,
  match_count       integer default 6,
  subject_id_filter uuid    default null,
  topic_id_filter   uuid    default null
)
returns table (
  id        uuid,
  content   text,
  metadata  jsonb,
  rank      real
)
language plpgsql security definer
set search_path = public
as $$
begin
  return query
  select
    c.id,
    c.content,
    c.metadata,
    ts_rank_cd(
      to_tsvector('english', c.content),
      plainto_tsquery('english', query_text)
    ) as rank
  from public.ai_resource_chunks c
  where
    to_tsvector('english', c.content) @@ plainto_tsquery('english', query_text)
    and (subject_id_filter is null or c.metadata->>'subject_id' = subject_id_filter::text)
    and (topic_id_filter is null  or c.metadata->>'topic_id'   = topic_id_filter::text)
  order by rank desc
  limit match_count;
end;
$$;

grant execute on function public.search_resource_chunks_semantic to service_role;
grant execute on function public.search_resource_chunks_text     to service_role;

-- ── 4. AI Usage Log ──────────────────────────────────────────────
-- Records each AI request for analytics, cost monitoring, and debugging.

create table if not exists public.ai_usage_log (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  conversation_id  uuid        references public.ai_conversations(id) on delete set null,
  request_id       text,
  model_used       text,
  input_tokens     integer,
  output_tokens    integer,
  latency_ms       integer,
  retrieved_chunks integer     not null default 0,
  evidence_level   text        check (evidence_level in ('strong','supported','partial','insufficient')),
  error_code       text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_ai_usage_user_id    on public.ai_usage_log(user_id);
create index if not exists idx_ai_usage_created_at on public.ai_usage_log(created_at desc);

alter table public.ai_usage_log enable row level security;

drop policy if exists "ai_usage_log: student own" on public.ai_usage_log;
create policy "ai_usage_log: student own" on public.ai_usage_log
  for select using (auth.uid() = user_id);

drop policy if exists "ai_usage_log: admin" on public.ai_usage_log;
create policy "ai_usage_log: admin" on public.ai_usage_log
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('admin', 'main_admin')
    )
  );

-- ── 5. AI Feedback Reports ────────────────────────────────────────
-- Students can flag issues with AI responses.

create table if not exists public.ai_feedback_reports (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  conversation_id  uuid        references public.ai_conversations(id) on delete set null,
  message_id       uuid        references public.ai_messages(id) on delete set null,
  request_id       text,
  category         text        not null check (category in (
    'wrong_explanation',
    'wrong_citation',
    'missing_citation',
    'broken_link',
    'wrong_timestamp',
    'outdated_guidance',
    'unclear_wording',
    'irrelevant_answer',
    'unsafe_answer',
    'other'
  )),
  comment          text,
  status           text        not null default 'open' check (status in (
    'open', 'reviewing', 'resolved', 'dismissed'
  )),
  reviewer_notes   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_ai_feedback_user_id    on public.ai_feedback_reports(user_id);
create index if not exists idx_ai_feedback_created_at on public.ai_feedback_reports(created_at desc);
create index if not exists idx_ai_feedback_status     on public.ai_feedback_reports(status);

drop trigger if exists ai_feedback_reports_updated_at on public.ai_feedback_reports;
create trigger ai_feedback_reports_updated_at
  before update on public.ai_feedback_reports
  for each row execute procedure public.touch_updated_at();

alter table public.ai_feedback_reports enable row level security;

drop policy if exists "ai_feedback_reports: own" on public.ai_feedback_reports;
create policy "ai_feedback_reports: own" on public.ai_feedback_reports
  for all using (auth.uid() = user_id);

drop policy if exists "ai_feedback_reports: admin" on public.ai_feedback_reports;
create policy "ai_feedback_reports: admin" on public.ai_feedback_reports
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('admin', 'main_admin')
    )
  );

-- ── 6. Resource processing status ────────────────────────────────
-- Track AI-indexing status on existing resources and topic_notes tables.
-- These columns record whether a resource has been chunked and indexed.

alter table public.resources
  add column if not exists ai_status text
    not null default 'not_processed'
    check (ai_status in (
      'not_processed','waiting','processing','text_extracted',
      'chunking','embedding','indexed','partially_indexed',
      'needs_review','failed','reprocessing','excluded'
    ));

alter table public.topic_notes
  add column if not exists ai_status text
    not null default 'not_processed'
    check (ai_status in (
      'not_processed','waiting','processing','text_extracted',
      'chunking','embedding','indexed','partially_indexed',
      'needs_review','failed','reprocessing','excluded'
    ));

create index if not exists idx_resources_ai_status    on public.resources(ai_status);
create index if not exists idx_topic_notes_ai_status  on public.topic_notes(ai_status);

-- ── Done ──────────────────────────────────────────────────────────
