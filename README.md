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

🚧 Early days — currently a fresh Next.js scaffold. Roadmap, roughly:

- [ ] Landing page with countdown-ish tease (without revealing the opening time)
- [ ] Window scheduler + open/closed state
- [ ] Prompt submission with first-come-first-served locking
- [ ] OpenRouter fan-out
- [ ] Supabase schema + persistence
- [ ] Public archive of past runs
- [ ] Twitter/X bot with opt-in submitter tagging

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
