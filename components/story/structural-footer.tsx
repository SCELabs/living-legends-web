// components/story/structural-footer.tsx
"use client";

import { useMemo, useState } from "react";
import StructuralPulseBar from "@/components/story/structural-pulse-bar";
import CourtSheet from "@/components/story/court-sheet";

type CastMember = {
  role_id?: string;
  display_role?: string;
  name?: string;
  condition?: string;
  condition_label?: string;
  bio?: string;
  influence?: number;
  volatility?: number;
};

type CourtData = {
  cast: CastMember[];
  latestFocusCharacter: string | null;
  conditionTone: (condition?: string) => string;
  relationshipSummary: (name: string) => string | null;
};

type StructuralFooterProps = {
  cast: CastMember[];
  latestFocusCharacter: string | null;
  relationshipText: string | null;
  courtData: CourtData;
};

export default function StructuralFooter({
  cast,
  latestFocusCharacter,
  relationshipText,
  courtData,
}: StructuralFooterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const spotlightCast = useMemo(() => {
    const scored = [...cast].map((member) => {
      let score = member.influence || 0;

      if (member.name === latestFocusCharacter) score += 1.5;
      if (member.condition === "unraveling") score += 0.5;
      if (member.condition === "divided") score += 0.3;
      if (member.condition === "uncertain") score += 0.15;

      return { member, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.member);
  }, [cast, latestFocusCharacter]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70]">
      {isOpen && (
        <div
          className="pointer-events-auto absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="pointer-events-none relative flex min-h-screen items-end justify-center px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="pointer-events-auto w-full max-w-5xl overflow-hidden rounded-t-3xl border border-stone-700/70 bg-stone-950/80 shadow-[0_-12px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {!isOpen ? (
            <StructuralPulseBar
              spotlightCast={spotlightCast}
              latestFocusCharacter={latestFocusCharacter}
              relationshipText={relationshipText}
              onOpen={() => setIsOpen(true)}
            />
          ) : (
            <div className="h-[78vh]">
              <CourtSheet
                spotlightCast={spotlightCast}
                latestFocusCharacter={latestFocusCharacter}
                relationshipText={relationshipText}
                courtData={courtData}
                onClose={() => setIsOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
