"use client";

import Link from "next/link";
import { useState } from "react";
import { labelFor } from "@/lib/models";

export interface GalleryRun {
  id: string;
  prompt: string;
  created_at: string;
  submitter_handle: string | null;
  wants_credit: boolean;
  responseCount: number;
}

interface PreviewResponse {
  model: string;
  output: string | null;
  error: string | null;
  latency_ms: number | null;
}

// Expandable run rows for the gallery page: clicking a prompt drops
// down truncated per-model previews (fetched lazily, cached per row);
// the dedicated run page stays one click away.
export default function GalleryRunList({ runs }: { runs: GalleryRun[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [previews, setPreviews] = useState<
    Record<string, PreviewResponse[] | null>
  >({});

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!(id in previews)) {
      fetch(`/api/runs/${id}`, { cache: "no-store" })
        .then((res) => res.json())
        .then(({ responses }) =>
          setPreviews((prev) => ({ ...prev, [id]: responses }))
        )
        .catch(() => setPreviews((prev) => ({ ...prev, [id]: null })));
    }
  }

  return (
    <ul className="flex flex-col gap-[10px]">
      {runs.map((run) => {
        const isOpen = open.has(run.id);
        const preview = previews[run.id];
        return (
          <li
            key={run.id}
            className="rounded-[10px] border border-noir-border bg-noir-bg p-4"
          >
            <button
              type="button"
              onClick={() => toggle(run.id)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-baseline gap-2 text-left"
            >
              <span
                className={`inline-block shrink-0 font-mono-space text-[13px] text-noir-red transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                ▸
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block font-mono-space text-[13px] leading-[1.5] text-noir-text ${
                    isOpen ? "" : "line-clamp-2"
                  }`}
                >
                  &gt; &ldquo;{run.prompt}&rdquo;
                </span>
                <span className="mt-2 block font-mono-space text-[9px] tracking-[1px] text-noir-faint">
                  {new Date(run.created_at).toUTCString()}
                  {" · "}
                  {run.responseCount} responses
                  {run.wants_credit && run.submitter_handle && (
                    <> · by @{run.submitter_handle}</>
                  )}
                </span>
              </span>
            </button>

            {isOpen && (
              <div className="mt-3 flex flex-col gap-1.5 border-t border-noir-border pt-3">
                {preview === undefined && (
                  <p className="font-mono-space text-[10px] text-noir-muted">
                    loading
                    <span className="motion-safe:animate-[pf-cursor_1s_steps(1)_infinite]">
                      _
                    </span>
                  </p>
                )}
                {preview === null && (
                  <p className="font-mono-space text-[10px] text-noir-muted">
                    couldn&apos;t load previews. try the full run.
                  </p>
                )}
                {preview?.map((r) => (
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
          </li>
        );
      })}
    </ul>
  );
}
