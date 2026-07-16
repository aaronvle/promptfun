"use client";

import { useEffect } from "react";
import RecentRunsList from "./RecentRunsList";

export default function GalleryModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recent runs"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-noir-border bg-noir-bg p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="font-bebas text-xl tracking-[2px] text-noir-text">
            RECENT <span className="text-noir-red">RUNS</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer font-mono-space text-sm text-noir-muted hover:text-noir-text"
          >
            ✕
          </button>
        </div>
        <RecentRunsList />
      </div>
    </div>
  );
}
