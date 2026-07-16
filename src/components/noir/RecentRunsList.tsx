"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RecentRun {
  id: string;
  prompt: string;
  created_at: string;
}

// The last five runs, fetched on mount. Shared by the gallery
// quick-view; each row links to its run page.
export default function RecentRunsList() {
  const [runs, setRuns] = useState<RecentRun[] | null | undefined>(undefined);

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

  return (
    <div className="flex flex-col gap-[10px]">
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
      {runs?.map((run) => (
        <Link
          key={run.id}
          href={`/runs/${run.id}`}
          className="block rounded-[8px] border border-noir-border bg-noir-panel px-3 py-2.5 transition-colors hover:border-noir-border-strong"
        >
          <p className="line-clamp-1 font-mono-space text-[12px] text-noir-text">
            &gt; &ldquo;{run.prompt}&rdquo;
          </p>
          <p className="mt-1 font-mono-space text-[8px] tracking-[1px] text-noir-faint">
            {new Date(run.created_at).toUTCString()}
          </p>
        </Link>
      ))}
      <Link
        href="/gallery"
        className="self-start font-mono-space text-[11px] text-noir-red underline underline-offset-2"
      >
        full gallery ▸
      </Link>
    </div>
  );
}
