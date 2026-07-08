# promptfun

**One prompt. Every model. Once every 12 hours. First come, first served.**

promptfun is a fun little experiment in comparing AI models with *normal* prompts — the kind real people actually write — instead of benchmarks.

## How it works

1. **The site opens at a random time, once every ~12 hours.** Nobody knows exactly when. If you want to be the one who gets to prompt, you have to be lurking (or set a reminder and get lucky).
2. **First come, first served.** When the window opens, anyone on the internet who's on the site can write a prompt and hit send. The first submission claims it — then the window slams shut until the next random opening.
3. **The prompt fans out to a handful of flagship models** (roughly 5–8: think Claude, GPT, Gemini, Llama, DeepSeek, Grok, Mistral...) via a single [OpenRouter](https://openrouter.ai) integration, all running the same prompt at the same time.
4. **Every response is stored** in Supabase, building a living, ever-growing log of how models stack up against each other on everyday prompts.
5. **A Twitter/X bot tweets each run as a thread** — the prompt, then every model's response — and tags the person who submitted the prompt, if they want the credit.

The result: a slow-drip, community-driven model comparison log, with a little scarcity-driven game on top. People race to be *the* prompter of the cycle, and everyone else gets an honest look at how the models actually differ.

## Why?

Benchmarks measure what labs optimize for. promptfun logs what happens when a random person on the internet asks a random thing at a random time. That corpus — same prompt, many models, timestamped — gets more interesting the longer it runs.

## Architecture (planned)

| Piece | Choice |
|---|---|
| Web app | Next.js (App Router, TypeScript, Tailwind) — this repo |
| Model fan-out | OpenRouter — one API, many models |
| Storage | Supabase (prompts, responses, window schedule, submitter credits) |
| Distribution | Twitter/X bot posting each run as a thread |
| Window scheduling | Random opening time within each 12-hour cycle, server-side |

### Rough flow

```
random timer fires ──▶ window opens ──▶ first user submits prompt
                                              │
                                              ▼
                              OpenRouter fan-out to 5–8 models
                                              │
                                              ▼
                          responses saved to Supabase ──▶ tweeted as a thread
                                                          (submitter tagged, opt-in)
```

## Status

🚧 The core game loop works. Roadmap:

- [x] Landing page with countdown-ish tease (without revealing the opening time)
- [x] Window scheduler + open/closed state (daily Vercel Cron fills upcoming 12h cycles)
- [x] Prompt submission with first-come-first-served locking (atomic conditional claim)
- [x] OpenRouter fan-out (needs `OPENROUTER_API_KEY`)
- [x] Supabase schema + persistence
- [x] Run page showing each model's response (`/runs/[id]`)
- [ ] Public archive of past runs
- [ ] Twitter/X bot with opt-in submitter tagging

## Environment variables

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | server only | Supabase secret key — all writes and window reads |
| `OPENROUTER_API_KEY` | server only | Model fan-out; without it, runs record an error per model |
| `NEXT_PUBLIC_SITE_URL` | optional | Sent as `HTTP-Referer` app attribution to OpenRouter |
| `CRON_SECRET` | server only | Protects `/api/cron/schedule` (Vercel sends it automatically) |
| `RATE_LIMIT_SALT` | optional | Salts hashed IPs in `submit_attempts`; any random string |

The `windows` table has no public read policy on purpose: future opening
times must never be readable from the client, or the game breaks.

### Rate limiting migration

Submissions are limited to 5 per minute per IP (salted hash, raw IPs are
never stored). Run this once in the Supabase SQL editor; until the table
exists the limiter fails open and submissions work unguarded:

```sql
create table submit_attempts (
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);
create index submit_attempts_by_ip_time
  on submit_attempts (ip_hash, attempted_at desc);
alter table submit_attempts enable row level security; -- no policies: server-only
```

Old attempts are pruned by the daily cron.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To exercise the loop
locally you need the Supabase env vars in `.env.local`; hit
`/api/cron/schedule` once to create windows, and temporarily insert a
window with `opens_at` in the past to force the open state.
