-- ── Legal document versioning and user consent records ──────────────────────

-- Registry of document types
create table if not exists public.legal_documents (
  id         uuid primary key default uuid_generate_v4(),
  type       text not null,
  created_at timestamptz not null default now(),
  constraint legal_documents_type_key unique (type),
  constraint legal_documents_type_check check (
    type in ('terms', 'privacy', 'billing', 'cookies', 'cancellation', 'acceptable_use')
  )
);

-- Versioned document metadata and content
create table if not exists public.legal_document_versions (
  id                   uuid primary key default uuid_generate_v4(),
  document_id          uuid not null references public.legal_documents(id) on delete cascade,
  version              text not null,
  status               text not null default 'draft',
  is_material_change   boolean not null default false,
  change_summary_en    text,
  change_summary_ar    text,
  effective_date       date,
  content_en           text,
  content_ar           text,
  content_hash         text,
  published_at         timestamptz,
  published_by         uuid references public.users(id) on delete set null,
  legal_review_status  text not null default 'pending',
  legal_reviewed_at    timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint ldv_status_check check (
    status in ('draft','ai_draft','awaiting_review','approved','scheduled','published','superseded','archived')
  ),
  constraint ldv_review_check check (
    legal_review_status in ('pending','in_review','approved','not_required')
  ),
  constraint ldv_version_unique unique (document_id, version)
);

-- Immutable per-user acceptance record
create table if not exists public.user_legal_acceptances (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  document_version_id uuid not null references public.legal_document_versions(id),
  accepted_at         timestamptz not null default now(),
  acceptance_source   text not null default 'signup',
  is_required         boolean not null default true,
  constraint ula_source_check check (
    acceptance_source in ('signup','reaccept','settings')
  ),
  constraint ula_unique unique (user_id, document_version_id)
);

-- Optional consent preferences (marketing, analytics)
create table if not exists public.user_consent_preferences (
  user_id                          uuid primary key references public.users(id) on delete cascade,
  marketing_consent                boolean not null default false,
  marketing_consent_at             timestamptz,
  marketing_consent_withdrawn_at   timestamptz,
  analytics_consent                boolean not null default false,
  analytics_consent_at             timestamptz,
  created_at                       timestamptz not null default now(),
  updated_at                       timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.legal_documents          enable row level security;
alter table public.legal_document_versions  enable row level security;
alter table public.user_legal_acceptances   enable row level security;
alter table public.user_consent_preferences enable row level security;

-- legal_documents: public read
drop policy if exists "legal_documents public read" on public.legal_documents;
create policy "legal_documents public read" on public.legal_documents
  for select using (true);

-- legal_document_versions: published versions public, admins see all
drop policy if exists "ldv public read published" on public.legal_document_versions;
create policy "ldv public read published" on public.legal_document_versions
  for select using (status = 'published' or public.is_admin());

drop policy if exists "ldv admin all" on public.legal_document_versions;
create policy "ldv admin all" on public.legal_document_versions
  for all using (public.is_admin());

-- user_legal_acceptances: users insert/read own; admins read all
drop policy if exists "ula user insert own" on public.user_legal_acceptances;
create policy "ula user insert own" on public.user_legal_acceptances
  for insert with check (auth.uid() = user_id);

drop policy if exists "ula user read own" on public.user_legal_acceptances;
create policy "ula user read own" on public.user_legal_acceptances
  for select using (auth.uid() = user_id or public.is_admin());

-- user_consent_preferences: users manage own
drop policy if exists "ucp user all" on public.user_consent_preferences;
create policy "ucp user all" on public.user_consent_preferences
  for all using (auth.uid() = user_id);

drop policy if exists "ucp admin read" on public.user_consent_preferences;
create policy "ucp admin read" on public.user_consent_preferences
  for select using (public.is_admin());

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists ldv_document_status_idx on public.legal_document_versions (document_id, status);
create index if not exists ula_user_idx             on public.user_legal_acceptances (user_id, accepted_at desc);
create index if not exists ula_version_idx          on public.user_legal_acceptances (document_version_id);

-- ── Seed document types ───────────────────────────────────────────────────────

insert into public.legal_documents (type) values
  ('terms'), ('privacy'), ('billing'), ('cookies'), ('cancellation'), ('acceptable_use')
on conflict (type) do nothing;

-- Seed v1.0 AI-draft versions for terms and privacy
-- Status: 'ai_draft' — must be reviewed by a qualified Saudi lawyer before publishing
insert into public.legal_document_versions
  (document_id, version, status, is_material_change, effective_date, change_summary_en, legal_review_status)
select id, '1.0', 'ai_draft', false, current_date,
  'Initial version — AI-drafted, awaiting review by qualified Saudi legal counsel',
  'pending'
from public.legal_documents where type = 'terms'
on conflict (document_id, version) do nothing;

insert into public.legal_document_versions
  (document_id, version, status, is_material_change, effective_date, change_summary_en, legal_review_status)
select id, '1.0', 'ai_draft', false, current_date,
  'Initial version — AI-drafted, awaiting review by qualified Saudi legal counsel',
  'pending'
from public.legal_documents where type = 'privacy'
on conflict (document_id, version) do nothing;

insert into public.legal_document_versions
  (document_id, version, status, is_material_change, effective_date, change_summary_en, legal_review_status)
select id, '1.0', 'ai_draft', false, current_date,
  'Initial version — AI-drafted, awaiting review by qualified Saudi legal counsel',
  'pending'
from public.legal_documents where type = 'billing'
on conflict (document_id, version) do nothing;
