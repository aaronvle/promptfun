"use client";

import { useEffect, useState } from "react";

function ScrambledClock() {
  const [digits, setDigits] = useState("??:??:??");

  useEffect(() => {
    const chars = "0123456789";
    const interval = setInterval(() => {
      const d = () => chars[Math.floor(Math.random() * chars.length)];
      setDigits(`${d()}${d()}:${d()}${d()}:${d()}${d()}`);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono tabular-nums text-zinc-400 dark:text-zinc-500 select-none">
      {digits}
    </span>
  );
}

export default function WindowStatus() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            The window is closed
          </span>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <span className="hidden sm:inline">next opening</span>
          <ScrambledClock />
        </div>
      </div>

      <textarea
        disabled
        rows={3}
        placeholder="When the window opens, whoever types here first gets the run..."
        className="w-full resize-none rounded-xl border border-black/[.08] dark:border-white/[.145] bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 disabled:cursor-not-allowed"
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Opens at a random moment, once every ~12 hours. No schedule. No
          warning.
        </p>
        <button
          disabled
          className="shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
