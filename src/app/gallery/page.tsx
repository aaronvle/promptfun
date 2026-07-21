import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import GalleryRunList from "@/components/noir/GalleryRunList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "gallery — promptfun",
  description: "Every prompt that ever won a window, searchable.",
};

interface RunRow {
  id: string;
  prompt: string;
  created_at: string;
  submitter_handle: string | null;
  wants_credit: boolean;
  responses: { count: number }[];
}

async function getRuns(query: string): Promise<RunRow[] | null> {
  try {
    const db = supabaseAdmin();
    let req = db
      .from("runs")
      .select(
        "id, prompt, created_at, submitter_handle, wants_credit, responses(count)"
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (query) {
      // Escape LIKE wildcards so users search literal text.
      const escaped = query.replace(/[%_\\]/g, "\\$&");
      req = req.ilike("prompt", `%${escaped}%`);
    }
    const { data, error } = await req;
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function GalleryPage(props: PageProps<"/gallery">) {
  const searchParams = await props.searchParams;
  const q = (typeof searchParams.q === "string" ? searchParams.q : "").slice(
    0,
    200
  );
  const runs = await getRuns(q);

  return (
    <div className="flex flex-1 justify-center bg-noir-bg px-4 py-[34px] sm:px-[34px]">
      <main className="w-full max-w-[960px]">
        <div className="flex flex-col gap-5 rounded-2xl border-2 border-noir-border bg-noir-panel px-5 py-7 sm:px-[30px]">
          {/* header */}
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="font-mono-space text-[10px] tracking-[1px] text-noir-muted hover:text-noir-text"
            >
              ← promptfun
            </Link>
            <span className="font-bebas text-[34px] leading-[.95] tracking-[2px] text-noir-text">
              THE <span className="text-noir-red">GALLERY</span>
            </span>
            <span className="font-mono-space text-[9px] tracking-[3px] text-noir-muted">
              EVERY PROMPT THAT EVER WON A WINDOW
            </span>
          </div>

          {/* search */}
          <form action="/gallery" method="get" className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="search past prompts..."
              className="w-full rounded-[10px] border border-noir-border-strong bg-noir-bg px-4 py-2.5 font-mono-space text-[13px] text-noir-text caret-noir-red outline-none placeholder:text-noir-muted focus:border-noir-red"
            />
            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded-[10px] border-2 border-noir-bg bg-noir-red px-5 font-bebas text-base tracking-[2px] text-noir-bg shadow-[0_0_0_2px_#35353a,0_4px_0_#000] active:translate-y-[2px] active:shadow-[0_0_0_2px_#35353a,0_2px_0_#000]"
            >
              SEARCH
            </button>
          </form>

          {q && runs !== null && (
            <p className="font-mono-space text-[10px] text-noir-faint">
              {runs.length}
              {runs.length === 50 ? "+" : ""} result
              {runs.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo; ·{" "}
              <Link
                href="/gallery"
                className="text-noir-red underline underline-offset-2"
              >
                clear
              </Link>
            </p>
          )}

          {runs === null && (
            <p className="font-mono-space text-[11px] text-noir-muted">
              the gallery is unavailable right now. try again in a bit.
            </p>
          )}

          {runs !== null && runs.length === 0 && (
            <p className="font-mono-space text-[11px] text-noir-muted">
              {q
                ? "no runs match that search."
                : "nothing here yet. the first window hasn't been won — maybe you'll be the one."}
            </p>
          )}

          {runs && runs.length > 0 && (
            <GalleryRunList
              runs={runs.map((run) => ({
                id: run.id,
                prompt: run.prompt,
                created_at: run.created_at,
                submitter_handle: run.submitter_handle,
                wants_credit: run.wants_credit,
                responseCount: run.responses?.[0]?.count ?? 0,
              }))}
            />
          )}

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
