"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChronicleEntry } from "@/components/story/narrative-block";
import NarrativeBlock from "@/components/story/narrative-block";

type Props = {
  entry: ChronicleEntry;
  isLatest?: boolean;
  enabled?: boolean;
  onComplete?: () => void;
};

function getRevealDuration(text: string, weight?: string): number {
  const length = text.trim().length;

  let base =
    length <= 120 ? 1800 :
    length <= 240 ? 2400 :
    length <= 420 ? 3000 :
    3600;

  // heavier events linger longer
  if (weight === "major") base += 600;

  return base;
}

function getVisibleText(text: string, progress: number): string {
  if (progress >= 1) return text;
  const chars = Math.max(1, Math.floor(text.length * progress));
  return text.slice(0, chars);
}

function getPressureVisuals(pressure?: string) {
  if (!pressure) return "opacity-40";

  if (pressure.includes("severe") || pressure.includes("rupture")) {
    return "opacity-100 scale-[1.02]";
  }

  if (pressure.includes("building") || pressure.includes("tightens")) {
    return "opacity-80";
  }

  if (pressure.includes("holding") || pressure.includes("eased")) {
    return "opacity-50";
  }

  return "opacity-60";
}

export default function StoryRevealBlock({
  entry,
  isLatest = false,
  enabled = true,
  onComplete,
}: Props) {
  const fullText = entry.body || "";
  const [progress, setProgress] = useState(isLatest && enabled ? 0 : 1);

  const duration = useMemo(
    () => getRevealDuration(fullText, entry.weight),
    [fullText, entry.weight]
  );

  useEffect(() => {
    if (!isLatest || !enabled) {
      setProgress(1);
      return;
    }

    let raf = 0;
    let cancelled = false;
    const start = performance.now();

    setProgress(0);

    const tick = (now: number) => {
      if (cancelled) return;

      const elapsed = now - start;
      const next = Math.min(elapsed / duration, 1);

      setProgress(next);

      if (next < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [duration, enabled, isLatest, fullText, onComplete]);

  const renderedEntry: ChronicleEntry = {
    ...entry,
    body: getVisibleText(fullText, progress),
  };

  const pressureVisual = getPressureVisuals(entry.pressure);

  return (
    <div
      className={`transition-all duration-700 ease-out ${pressureVisual} ${
        isLatest ? "animate-[fadeIn_0.5s_ease-out]" : ""
      }`}
    >
      {/* subtle pressure bar */}
      {isLatest && entry.pressure ? (
        <div className="mb-4 h-[2px] w-full overflow-hidden rounded bg-stone-800">
          <div
            className="h-full bg-amber-400/70 transition-all duration-700"
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
            }}
          />
        </div>
      ) : null}

      <NarrativeBlock entry={renderedEntry} />
    </div>
  );
}
