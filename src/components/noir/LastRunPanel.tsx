"use client";

import Link from "next/link";
import { useState } from "react";
import type { LatestRun } from "@/lib/runs";
import { labelFor } from "@/lib/models";
import ResponseCard from "./ResponseCard";

// Noir-styled record of the most recent run, below the meter strip.
// Collapsed by default to keep the homepage short — clicking the
// prompt line toggles the responses open and closed.
export default function LastRunPanel({ run }: { run: LatestRun }) {
  const [open, setOpen] = useState(false);

  const responses = [...run.responses].sort(
    (a, b) => (a.latency_ms ?? Infinity) - (b.latency_ms ?? Infinity)
  );

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-noir-border bg-noir-bg p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-bebas text-lg tracking-[2px] text-noir-text">
          LAST RUN
        </span>
        <span className="font-mono-space text-[9px] tracking-[1px] text-noir-faint">
          {new Date(run.created_at).toUTCString()}
          {run.wants_credit && run.submitter_handle && (
            <> · by @{run.submitter_handle}</>
          )}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex cursor-pointer items-baseline gap-2 text-left font-mono-space text-[13px] text-noir-text hover:text-noir-red"
      >
        <span
          className={`inline-block text-noir-red transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        >
          ▸
        </span>
        <span>&gt; &ldquo;{run.prompt}&rdquo;</span>
      </button>

      {!open && (
        <p className="font-mono-space text-[9px] tracking-[1px] text-noir-faint">
          {responses.length} responses · tap the prompt to open
        </p>
      )}

      {open && (
        <div className="flex flex-col gap-[10px]">
          {responses.map((r) => (
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
        </div>
      )}

      <Link
        href={`/runs/${run.id}`}
        className="self-start font-mono-space text-[11px] text-noir-red underline"
      >
        full run ▸
      </Link>
    </div>
  );
}
