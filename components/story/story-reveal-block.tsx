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

function getRevealDuration(text: string): number {
  const length = text.trim().length;

  if (length <= 120) return 2200;
  if (length <= 240) return 3000;
  if (length <= 420) return 4000;
  return 4800;
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

  const duration = useMemo(() => getRevealDuration(fullText), [fullText]);

  useEffect(() => {
    if (!isLatest || !enabled) {
      setProgress(1);
      return;
    }

    let animationFrame = 0;
    let cancelled = false;
    const start = performance.now();

    setProgress(0);

    const tick = (now: number) => {
      if (cancelled) return;

      const elapsed = now - start;
      const nextProgress = Math.min(elapsed / duration, 1);

      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, enabled, fullText, isLatest, onComplete]);

  const renderedEntry: ChronicleEntry = {
    ...entry,
    body: getVisibleText(fullText, progress),
  };

  return (
    <div className={isLatest ? "animate-[fadeIn_0.35s_ease-out]" : undefined}>
      <NarrativeBlock entry={renderedEntry} />
    </div>
  );
}
