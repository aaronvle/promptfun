-- Per-response usage metadata: token counts and USD cost as reported
-- by OpenRouter (usage accounting), so runs double as a live cost
-- comparison across models.
-- IMPORTANT: apply this BEFORE deploying the code that selects these
-- columns (adding columns is harmless to the old code; the new code
-- errors without them).
alter table responses
  add column prompt_tokens integer,
  add column completion_tokens integer,
  add column cost numeric(12, 8);
