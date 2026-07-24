import { TwitterApi } from "twitter-api-v2";
import type { SupabaseClient } from "@supabase/supabase-js";
import { labelFor, MODELS } from "./models";

// Posts each completed run to X as a thread: the prompt first, then
// one reply per model response. No-op until all four X_* env vars are
// set, so this ships safely ahead of the developer account existing.
// Uses OAuth 1.0a user context (the bot account's own credentials).

const TWEET_MAX = 280;

export function isXConfigured(): boolean {
  return Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET
  );
}

function client(): TwitterApi {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_SECRET!,
  });
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

// Fetches the run and posts the thread. Never throws — a failed tweet
// must not break anything else; errors are logged for Vercel logs.
export async function postRunThread(db: SupabaseClient, runId: string) {
  if (!isXConfigured()) return;

  try {
    const { data: run } = await db
      .from("runs")
      .select(
        "id, prompt, submitter_handle, wants_credit, responses(model, output, error, latency_ms)"
      )
      .eq("id", runId)
      .single();
    if (!run) return;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptfun-xi.vercel.app";
    const runUrl = `${siteUrl}/runs/${run.id}`;

    const credit =
      run.wants_credit && run.submitter_handle
        ? ` prompted by @${run.submitter_handle}.`
        : "";
    // Leave room for the credit, link, and framing around the prompt.
    const head =
      `“${clip(run.prompt, 170)}”\n\n` +
      `one prompt · ${MODELS.length} models · every ~12h.${credit}\n${runUrl}`;

    const answered = [...run.responses]
      .filter((r) => r.output)
      .sort((a, b) => (a.latency_ms ?? Infinity) - (b.latency_ms ?? Infinity));
    if (answered.length === 0) return;

    const api = client();
    const first = await api.v2.tweet(clip(head, TWEET_MAX));
    let replyTo = first.data.id;

    for (const r of answered) {
      const label = `[${labelFor(r.model)}${
        r.latency_ms != null ? ` · ${(r.latency_ms / 1000).toFixed(1)}s` : ""
      }] `;
      const body = clip(label + r.output, TWEET_MAX);
      const reply = await api.v2.tweet(body, {
        reply: { in_reply_to_tweet_id: replyTo },
      });
      replyTo = reply.data.id;
    }
  } catch (err) {
    console.error("x thread failed:", err);
  }
}
