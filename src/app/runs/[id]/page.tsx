import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { MODELS, labelFor } from "@/lib/models";
import ResponseCard from "@/components/noir/ResponseCard";
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
    <div className="flex flex-1 justify-center bg-noir-bg px-4 py-[34px] sm:px-[34px]">
      <main className="w-full max-w-[960px]">
        <div className="flex flex-col gap-5 rounded-2xl border-2 border-noir-border bg-noir-panel px-5 py-7 sm:px-[30px]">
          {/* header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4 font-mono-space text-[10px] tracking-[1px] text-noir-muted">
              <Link href="/" className="hover:text-noir-text">
                ← promptfun
              </Link>
              <Link href="/gallery" className="hover:text-noir-text">
                gallery
              </Link>
            </div>
            <span className="font-bebas text-[26px] leading-[1] tracking-[2px] text-noir-text">
              THE <span className="text-noir-red">RUN</span>
            </span>
            <span className="font-mono-space text-[9px] tracking-[1px] text-noir-faint">
              {new Date(run.created_at).toUTCString()}
              {run.wants_credit && run.submitter_handle && (
                <>
                  {" · prompted by "}
                  <a
                    href={`https://twitter.com/${run.submitter_handle}`}
                    className="text-noir-red underline underline-offset-2"
                  >
                    @{run.submitter_handle}
                  </a>
                </>
              )}
            </span>
          </div>

          {/* prompt echo */}
          <div className="rounded-xl border-2 border-noir-border-strong bg-noir-bg px-[22px] py-4">
            <p className="font-mono-space text-[15px] leading-[1.6] text-noir-text">
              <span className="font-bold text-noir-red">&gt;</span> &ldquo;
              {run.prompt}&rdquo;
            </p>
          </div>

          {stillRunning && (
            <p className="font-mono-space text-[10px] text-noir-muted">
              {rows.length}/{MODELS.length} models in — refresh for more
              <span className="motion-safe:animate-[pf-cursor_1s_steps(1)_infinite]">
                _
              </span>
            </p>
          )}

          <div className="flex flex-col gap-[10px]">
            {rows.map((r) => (
              <ResponseCard
                key={r.model}
                r={{
                  label: labelFor(r.model),
                  slug: r.model,
                  latencySec:
                    r.latency_ms != null
                      ? (r.latency_ms / 1000).toFixed(1)
                      : null,
                  text: r.output ?? r.error ?? "no output",
                  isError: !r.output,
                }}
              />
            ))}
            {rows.length === 0 && (
              <p className="font-mono-space text-[11px] text-noir-muted">
                responses are still being collected. refresh in a moment.
              </p>
            )}
          </div>

          <div className="flex justify-center font-mono-space text-[10px] text-noir-faint">
            <span>
              a living log of how models handle normal prompts — not benchmarks
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
