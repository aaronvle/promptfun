-- Per-response usage metadata: token counts and USD cost as reported
-- by OpenRouter's usage accounting, so runs double as a live cost
-- comparison across models.
-- NOTE: already applied to the production Supabase project (2026-07);
-- checked in so the repo stays the schema's source of truth.
alter table responses
  add column prompt_tokens integer,
  add column completion_tokens integer,
  add column cost numeric(12, 8);
