"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

// Answers longer than this get visually collapsed with a "show more".
const COLLAPSE_CHARS = 420;

// One model's answer inside an expanded gallery row: markdown
// rendered, collapsed to a fixed height with a fade when long.
function AnswerPreview({ r }: { r: PreviewResponse }) {
  const [showAll, setShowAll] = useState(false);
  const long = (r.output?.length ?? 0) > COLLAPSE_CHARS;

  return (
    <div className="flex flex-col gap-1.5 py-3">
      <p className="font-mono-space text-[12px] font-bold text-noir-red">
        [{labelFor(r.model)}
        {r.latency_ms != null && ` · ${(r.latency_ms / 1000).toFixed(1)}s`}]
      </p>
      {r.output ? (
        <>
          <div
            className={`relative ${!showAll && long ? "max-h-44 overflow-hidden" : ""}`}
          >
            <div className="noir-markdown noir-markdown-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {r.output}
              </ReactMarkdown>
            </div>
            {!showAll && long && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
                style={{
                  background: "linear-gradient(transparent, #0a0a0b)",
                }}
              />
            )}
          </div>
          {long && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="self-start cursor-pointer font-mono-space text-[11px] text-noir-red hover:underline"
            >
              {showAll ? "show less ▴" : "show more ▾"}
            </button>
          )}
        </>
      ) : (
        <p className="font-mono-space text-[12px] text-noir-faint">
          {r.error ?? "no output"}
        </p>
      )}
    </div>
  );
}

// Expandable run rows for the gallery page: clicking a prompt drops
// down each model's answer (fetched lazily, cached per row); the
// dedicated run page stays one click away.
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
              <div className="mt-3 border-t border-noir-border-strong/60 pt-1">
                {preview === undefined && (
                  <p className="py-2 font-mono-space text-[11px] text-noir-muted">
                    loading
                    <span className="motion-safe:animate-[pf-cursor_1s_steps(1)_infinite]">
                      _
                    </span>
                  </p>
                )}
                {preview === null && (
                  <p className="py-2 font-mono-space text-[11px] text-noir-muted">
                    couldn&apos;t load responses. try the full run.
                  </p>
                )}
                {preview && (
                  <div className="divide-y divide-noir-border-strong/60">
                    {preview.map((r) => (
                      <AnswerPreview key={r.model} r={r} />
                    ))}
                  </div>
                )}
                <Link
                  href={`/runs/${run.id}`}
                  className="mt-2 inline-block font-mono-space text-[11px] text-noir-red underline underline-offset-2"
                >
                  full run page ▸
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
