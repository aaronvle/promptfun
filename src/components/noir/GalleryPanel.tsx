"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { labelFor } from "@/lib/models";

interface PreviewResponse {
  model: string;
  output: string | null;
  error: string | null;
  latency_ms: number | null;
}

interface RecentRun {
  id: string;
  prompt: string;
  created_at: string;
  responses: PreviewResponse[];
}

// Inline gallery panel, opened below the knob rail like the how-panel.
// Each prompt row expands to preview what every model said; the full
// responses live on the run page.
export default function GalleryPanel() {
  const [runs, setRuns] = useState<RecentRun[] | null | undefined>(undefined);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/runs/recent", { cache: "no-store" })
      .then((res) => res.json())
      .then(({ runs }) => {
        if (!cancelled) setRuns(runs);
      })
      .catch(() => {
        if (!cancelled) setRuns(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-noir-border bg-noir-bg p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bebas text-lg tracking-[2px] text-noir-text">
          RECENT <span className="text-noir-red">RUNS</span>
        </span>
        <Link
          href="/gallery"
          className="font-mono-space text-[10px] text-noir-red underline underline-offset-2"
        >
          full gallery ▸
        </Link>
      </div>

      {runs === undefined && (
        <p className="font-mono-space text-[10px] text-noir-muted">
          loading
          <span className="motion-safe:animate-[pf-cursor_1s_steps(1)_infinite]">
            _
          </span>
        </p>
      )}
      {runs === null && (
        <p className="font-mono-space text-[10px] text-noir-muted">
          the archive is unreachable right now.
        </p>
      )}
      {runs && runs.length === 0 && (
        <p className="font-mono-space text-[10px] text-noir-muted">
          no runs yet. the first window hasn&apos;t been won.
        </p>
      )}

      {runs?.map((run) => {
        const open = expanded.has(run.id);
        const responses = [...run.responses].sort(
          (a, b) => (a.latency_ms ?? Infinity) - (b.latency_ms ?? Infinity)
        );
        return (
          <div
            key={run.id}
            className="flex flex-col gap-2 rounded-[8px] border border-noir-border bg-noir-panel px-3 py-2.5"
          >
            <button
              type="button"
              onClick={() => toggle(run.id)}
              aria-expanded={open}
              className="flex cursor-pointer items-baseline gap-2 text-left"
            >
              <span
                className={`inline-block shrink-0 font-mono-space text-[12px] text-noir-red transition-transform duration-200 ${
                  open ? "rotate-90" : ""
                }`}
              >
                ▸
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block font-mono-space text-[12px] text-noir-text ${
                    open ? "" : "line-clamp-1"
                  }`}
                >
                  &gt; &ldquo;{run.prompt}&rdquo;
                </span>
                <span className="mt-0.5 block font-mono-space text-[8px] tracking-[1px] text-noir-faint">
                  {new Date(run.created_at).toUTCString()} ·{" "}
                  {responses.length} responses
                </span>
              </span>
            </button>

            {open && (
              <div className="flex flex-col gap-1.5 border-t border-noir-border pt-2">
                {responses.map((r) => (
                  <p
                    key={r.model}
                    className="font-mono-space text-[11px] leading-[1.5] text-noir-body"
                  >
                    <span className="font-bold text-noir-red">
                      [{labelFor(r.model)}
                      {r.latency_ms != null &&
                        ` ${(r.latency_ms / 1000).toFixed(1)}s`}
                      ]
                    </span>{" "}
                    {r.output ?? (
                      <span className="text-noir-faint">
                        {r.error ?? "no output"}
                      </span>
                    )}
                  </p>
                ))}
                <Link
                  href={`/runs/${run.id}`}
                  className="mt-1 self-start font-mono-space text-[11px] text-noir-red underline underline-offset-2"
                >
                  full responses ▸
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
