-- Initial schema: windows, runs, responses.
-- Already applied to the production Supabase project (2026-07); kept
-- here as the source of truth for recreating the database.

-- Prompt windows: one row per opening. opens_at is the secret.
create table windows (
  id uuid primary key default gen_random_uuid(),
  opens_at timestamptz not null,
  claimed_run_id uuid,
  created_at timestamptz not null default now()
);

-- A run: the winning prompt submitted during a window
create table runs (
  id uuid primary key default gen_random_uuid(),
  window_id uuid not null references windows(id),
  prompt text not null check (char_length(prompt) <= 2000),
  submitter_handle text,
  wants_credit boolean not null default false,
  created_at timestamptz not null default now()
);

-- One row per model per run
create table responses (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id),
  model text not null,
  output text,
  error text,
  latency_ms integer,
  created_at timestamptz not null default now(),
  unique (run_id, model)
);

alter table windows add constraint windows_claimed_run_fk
  foreign key (claimed_run_id) references runs(id);

-- A window can only ever be claimed once (first come, first served)
create unique index one_claim_per_window on windows (id)
  where claimed_run_id is not null;

create index responses_by_run on responses (run_id);
create index runs_by_created on runs (created_at desc);

-- Lock it down: public can READ runs/responses (the archive), write
-- nothing. All writes go through server routes using the secret key.
alter table windows enable row level security;
alter table runs enable row level security;
alter table responses enable row level security;

create policy "public read runs" on runs for select using (true);
create policy "public read responses" on responses for select using (true);
-- Note: NO select policy on windows — future opens_at must never be
-- readable by clients, or the random opening time leaks.
