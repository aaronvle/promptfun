import Link from "next/link";
import type { LatestRun } from "@/lib/runs";
import { labelFor } from "@/lib/models";
import ResponseCard from "./ResponseCard";

// Noir-styled record of the most recent run, below the meter strip.
export default function LastRunPanel({ run }: { run: LatestRun }) {
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
      <div className="font-mono-space text-[13px] text-noir-text">
        &gt; &ldquo;{run.prompt}&rdquo;
      </div>
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
      <Link
        href={`/runs/${run.id}`}
        className="self-start font-mono-space text-[11px] text-noir-red underline"
      >
        full run ▸
      </Link>
    </div>
  );
}
