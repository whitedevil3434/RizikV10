-- C-Link isolated persistence boundary.
-- This migration intentionally has no foreign keys to legacy Rizik tables.

create extension if not exists pgcrypto;
create schema if not exists clink;

create table if not exists clink.parties (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('person', 'business')),
  name text not null,
  business_type text,
  phone text,
  email text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists clink.party_members (
  party_id uuid not null references clink.parties(id) on delete cascade,
  auth_subject_id uuid not null,
  role text not null check (role in ('owner', 'admin', 'member', 'observer')),
  created_at timestamptz not null default now(),
  primary key (party_id, auth_subject_id)
);

create table if not exists clink.commitments (
  id uuid primary key default gen_random_uuid(),
  creator_party_id uuid not null references clink.parties(id),
  counterparty_party_id uuid not null references clink.parties(id),
  status text not null default 'draft',
  current_version integer not null default 1,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  fulfilled_at timestamptz,
  closed_at timestamptz,
  aggregate_version integer not null default 0
);

create table if not exists clink.commitment_versions (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references clink.commitments(id) on delete cascade,
  version_number integer not null,
  item text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  price numeric not null check (price >= 0),
  currency text not null default 'BDT',
  deadline timestamptz not null,
  location text,
  payment_terms text,
  acceptance_criteria text not null,
  previous_version_id uuid references clink.commitment_versions(id),
  created_by uuid not null references clink.parties(id),
  created_at timestamptz not null default now(),
  unique (commitment_id, version_number)
);

create table if not exists clink.events (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references clink.commitments(id) on delete cascade,
  type text not null,
  actor_party_id uuid not null references clink.parties(id),
  payload jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  correlation_id uuid,
  causation_id uuid,
  occurred_at timestamptz not null default now()
);

create table if not exists clink.evidence (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references clink.commitments(id) on delete cascade,
  event_id uuid references clink.events(id),
  uploader_party_id uuid not null references clink.parties(id),
  type text not null,
  object_key text,
  content_hash text,
  description text,
  visibility text not null default 'shared' check (visibility in ('private', 'shared', 'dispute_only')),
  created_at timestamptz not null default now()
);

create table if not exists clink.disputes (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references clink.commitments(id) on delete cascade,
  opened_by uuid not null references clink.parties(id),
  issue_type text not null,
  claim jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  resolution jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists clink.settlements (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references clink.commitments(id) on delete cascade,
  amount_due numeric not null default 0,
  amount_paid numeric not null default 0,
  currency text not null default 'BDT',
  status text not null default 'not_due',
  payment_reference text,
  recorded_by uuid not null references clink.parties(id),
  recorded_at timestamptz not null default now()
);

create table if not exists clink.share_tokens (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references clink.commitments(id) on delete cascade,
  token_hash text not null unique,
  permission text not null default 'respond',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  opened_at timestamptz
);

create table if not exists clink.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_party_id uuid,
  action text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists commitments_creator_idx on clink.commitments(creator_party_id, created_at desc);
create index if not exists commitments_counterparty_idx on clink.commitments(counterparty_party_id, created_at desc);
create index if not exists events_commitment_idx on clink.events(commitment_id, occurred_at);
create index if not exists evidence_commitment_idx on clink.evidence(commitment_id, created_at);

-- RLS is enabled at the isolated boundary. The service role may operate the
-- command side, while user-facing reads must resolve through party_members.
alter table clink.parties enable row level security;
alter table clink.party_members enable row level security;
alter table clink.commitments enable row level security;
alter table clink.commitment_versions enable row level security;
alter table clink.events enable row level security;
alter table clink.evidence enable row level security;
alter table clink.disputes enable row level security;
alter table clink.settlements enable row level security;
alter table clink.share_tokens enable row level security;
alter table clink.audit_log enable row level security;

create policy clink_party_member_read on clink.party_members for select
  using (auth_subject_id = auth.uid());
create policy clink_party_read on clink.parties for select
  using (exists (select 1 from clink.party_members m where m.party_id = id and m.auth_subject_id = auth.uid()));
create policy clink_commitment_read on clink.commitments for select
  using (exists (select 1 from clink.party_members m where m.party_id in (creator_party_id, counterparty_party_id) and m.auth_subject_id = auth.uid()));
create policy clink_commitment_version_read on clink.commitment_versions for select
  using (exists (select 1 from clink.commitments c join clink.party_members m on m.party_id in (c.creator_party_id, c.counterparty_party_id) where c.id = commitment_id and m.auth_subject_id = auth.uid()));
create policy clink_event_read on clink.events for select
  using (exists (select 1 from clink.commitments c join clink.party_members m on m.party_id in (c.creator_party_id, c.counterparty_party_id) where c.id = commitment_id and m.auth_subject_id = auth.uid()));
create policy clink_evidence_read on clink.evidence for select
  using (exists (select 1 from clink.commitments c join clink.party_members m on m.party_id in (c.creator_party_id, c.counterparty_party_id) where c.id = commitment_id and m.auth_subject_id = auth.uid()));
create policy clink_dispute_read on clink.disputes for select
  using (exists (select 1 from clink.commitments c join clink.party_members m on m.party_id in (c.creator_party_id, c.counterparty_party_id) where c.id = commitment_id and m.auth_subject_id = auth.uid()));
create policy clink_settlement_read on clink.settlements for select
  using (exists (select 1 from clink.commitments c join clink.party_members m on m.party_id in (c.creator_party_id, c.counterparty_party_id) where c.id = commitment_id and m.auth_subject_id = auth.uid()));
