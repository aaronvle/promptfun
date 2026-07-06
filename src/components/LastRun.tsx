import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { MODELS } from "@/lib/models";

interface LastRunData {
  id: string;
  prompt: string;
  created_at: string;
  submitter_handle: string | null;
  wants_credit: boolean;
  responses: {
    model: string;
    output: string | null;
    error: string | null;
    latency_ms: number | null;
  }[];
}

function labelFor(slug: string) {
  return MODELS.find((m) => m.slug === slug)?.label ?? slug;
}

async function getLastRun(): Promise<LastRunData | null> {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("runs")
      .select(
        "id, prompt, created_at, submitter_handle, wants_credit, responses(model, output, error, latency_ms)"
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// Renders nothing when there are no runs yet (or the DB is unreachable)
// so the homepage stays clean before the first window is ever won.
export default async function LastRun() {
  const run = await getLastRun();
  if (!run) return null;

  const responses = [...run.responses].sort(
    (a, b) => (a.latency_ms ?? Infinity) - (b.latency_ms ?? Infinity)
  );

  return (
    <section className="flex w-full flex-col gap-6">
      <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-center">
        Last run
      </h2>

      <div className="rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-6 flex flex-col gap-3">
        <p className="text-base font-medium leading-7 text-zinc-900 dark:text-zinc-100">
          &ldquo;{run.prompt}&rdquo;
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(run.created_at).toUTCString()}
          {run.wants_credit && run.submitter_handle && (
            <> · prompted by @{run.submitter_handle}</>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {responses.map((r) => (
          <article
            key={r.model}
            className="rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-5 flex flex-col gap-2"
          >
            <header className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {labelFor(r.model)}
              </h3>
              {r.latency_ms != null && (
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {(r.latency_ms / 1000).toFixed(1)}s
                </span>
              )}
            </header>
            {r.output ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300 line-clamp-6">
                {r.output}
              </p>
            ) : (
              <p className="text-sm text-red-500 dark:text-red-400">
                {r.error ?? "no output"}
              </p>
            )}
          </article>
        ))}
      </div>

      <Link
        href={`/runs/${run.id}`}
        className="self-center text-sm font-medium text-zinc-700 dark:text-zinc-300 underline-offset-4 hover:underline"
      >
        See the full run →
      </Link>
    </section>
  );
}
