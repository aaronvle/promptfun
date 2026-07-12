import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { MODELS, labelFor } from "@/lib/models";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ResponseRow {
  model: string;
  output: string | null;
  error: string | null;
  latency_ms: number | null;
}


export default async function RunPage(props: PageProps<"/runs/[id]">) {
  const { id } = await props.params;

  const db = supabaseAdmin();
  const { data: run } = await db
    .from("runs")
    .select("id, prompt, submitter_handle, wants_credit, created_at")
    .eq("id", id)
    .single();
  if (!run) notFound();

  const { data: responses } = await db
    .from("responses")
    .select("model, output, error, latency_ms")
    .eq("run_id", id)
    .order("latency_ms", { ascending: true });

  const rows: ResponseRow[] = responses ?? [];
  const stillRunning = rows.length < MODELS.length;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-zinc-500 dark:text-zinc-400 underline-offset-4 hover:underline"
            >
              ← promptfun
            </Link>
            <Link
              href="/gallery"
              className="text-xs text-zinc-500 dark:text-zinc-400 underline-offset-4 hover:underline"
            >
              gallery
            </Link>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            &ldquo;{run.prompt}&rdquo;
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(run.created_at).toUTCString()}
            {run.wants_credit && run.submitter_handle && (
              <>
                {" · prompted by "}
                <a
                  href={`https://twitter.com/${run.submitter_handle}`}
                  className="font-medium text-zinc-700 dark:text-zinc-300 underline-offset-4 hover:underline"
                >
                  @{run.submitter_handle}
                </a>
              </>
            )}
          </p>
        </div>

        {stillRunning && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {rows.length}/{MODELS.length} models in — refresh for more.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <article
              key={r.model}
              className="rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-5 flex flex-col gap-3"
            >
              <header className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {labelFor(r.model)}
                </h2>
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {r.model}
                  {r.latency_ms != null && ` · ${(r.latency_ms / 1000).toFixed(1)}s`}
                </span>
              </header>
              {r.output ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {r.output}
                </p>
              ) : (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {r.error ?? "no output"}
                </p>
              )}
            </article>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Responses are still being collected. Refresh in a moment.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
