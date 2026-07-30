-- Rate limiting: submissions are capped per IP via a sliding window
-- over this table. Only salted SHA-256 hashes are stored, never raw
-- IPs. The daily cron prunes rows older than 24h. The app fails open
-- until this migration is applied.
create table submit_attempts (
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);

create index submit_attempts_by_ip_time
  on submit_attempts (ip_hash, attempted_at desc);

alter table submit_attempts enable row level security; -- no policies: server-only
