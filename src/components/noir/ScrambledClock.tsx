"use client";

import { useEffect, useState } from "react";

// Pure theater: nobody knows the opening time, so the clock rolls
// random digits forever (~130ms per re-roll, per the design).
export default function ScrambledClock() {
  const [digits, setDigits] = useState("??:??:??");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      const d = () => Math.floor(Math.random() * 10);
      setDigits(`${d()}${d()}:${d()}${d()}:${d()}${d()}`);
    }, 130);
    return () => clearInterval(interval);
  }, []);

  return <>{digits}</>;
}
