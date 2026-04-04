"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChronicleEntry } from "@/components/story/narrative-block";
import NarrativeBlock from "@/components/story/narrative-block";

type StoryRevealBlockProps = {
  entry: ChronicleEntry;
  isLatest?: boolean;
  enabled?: boolean;
  onComplete?: () => void;
};

function getRevealDuration(text: string, pressure?: string): number {
  const length = text.trim().length;

  let base =
    length <= 120 ? 1400 :
    length <= 240 ? 2000 :
    length <= 420 ? 2600 :
    3200;

  if (!pressure) return base;

  if (pressure === "unity") return base * 1.25;
  if (pressure === "boundary") return base * 1.0;
  if (pressure === "fragmentation") return base * 0.65;

  return base;
}

function getVisibleText(text: string, progress: number): string {
  if (progress >= 1) return text;
  const chars = Math.max(1, Math.floor(text.length * progress));
  return text.slice(0, chars);
}

export default function StoryRevealBlock({
  entry,
  isLatest = false,
  enabled = true,
  onComplete,
}: StoryRevealBlockProps) {
  const fullText = entry.body || "";
  const [progress, setProgress] = useState(isLatest && enabled ? 0 : 1);
  const [showPressure, setShowPressure] = useState(!isLatest || !enabled);

  const duration = useMemo(
  () => getRevealDuration(fullText, entry.pressure),
  [fullText, entry.pressure]
);

  useEffect(() => {
    if (!isLatest || !enabled) {
      setProgress(1);
      setShowPressure(true);
      return;
    }

    let animationFrame = 0;
    let pressureTimer: ReturnType<typeof setTimeout> | null = null;
    let completeTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const start = performance.now();

    setProgress(0);
    setShowPressure(false);

    const tick = (now: number) => {
      if (cancelled) return;

      const elapsed = now - start;
      const nextProgress = Math.min(elapsed / duration, 1);

      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        pressureTimer = setTimeout(() => {
          setShowPressure(true);

          completeTimer = setTimeout(() => {
            onComplete?.();
          }, 250);
        }, 180);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (pressureTimer) {
        clearTimeout(pressureTimer);
      }
      if (completeTimer) {
        clearTimeout(completeTimer);
      }
    };
  }, [duration, enabled, fullText, isLatest, onComplete]);

  const renderedEntry: ChronicleEntry = {
    ...entry,
    body: getVisibleText(fullText, progress),
    pressure: showPressure ? entry.pressure : undefined,
  };

  return (
    <div className={isLatest ? "animate-[fadeIn_0.35s_ease-out]" : undefined}>
      <NarrativeBlock entry={renderedEntry} />
    </div>
  );
}
