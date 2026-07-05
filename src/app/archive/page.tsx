import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface RunRow {
  id: string;
  prompt: string;
  created_at: string;
  submitter_handle: string | null;
  wants_credit: boolean;
  responses: { count: number }[];
}

async function getRuns(): Promise<RunRow[] | null> {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("runs")
      .select(
        "id, prompt, created_at, submitter_handle, wants_credit, responses(count)"
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function ArchivePage() {
  const runs = await getRuns();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="text-xs text-zinc-500 dark:text-zinc-400 underline-offset-4 hover:underline"
          >
            ← promptfun
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            The archive
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Every prompt that ever won a window, and how every model answered.
          </p>
        </div>

        {runs === null && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The archive is unavailable right now. Try again in a bit.
          </p>
        )}

        {runs !== null && runs.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nothing here yet. The first window hasn&apos;t been won — maybe
            you&apos;ll be the one.
          </p>
        )}

        <ul className="flex flex-col gap-4">
          {runs?.map((run) => (
            <li key={run.id}>
              <Link
                href={`/runs/${run.id}`}
                className="block rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-5 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
              >
                <p className="text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  &ldquo;{run.prompt}&rdquo;
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(run.created_at).toUTCString()}
                  {" · "}
                  {run.responses?.[0]?.count ?? 0} responses
                  {run.wants_credit && run.submitter_handle && (
                    <> · by @{run.submitter_handle}</>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
