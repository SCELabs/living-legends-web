import type { AppStateResponse } from "@/lib/api";

type CastMember = AppStateResponse["cast"][number];

export function conditionTone(condition?: string): string {
  if (condition === "loyal") return "text-emerald-300";
  if (condition === "divided") return "text-amber-300";
  if (condition === "unraveling") return "text-red-300";
  return "text-stone-300";
}

export function relationshipLine(state: AppStateResponse | null): string | null {
  if (!state?.relationships?.length) return null;
  const rel = state.relationships[0];
  if (rel.description) return rel.description;
  return `${rel.source} and ${rel.target} are bound by ${rel.type}.`;
}

export function compactRelationshipSummary(
  state: AppStateResponse | null,
  name: string
): string | null {
  if (!state?.relationships?.length) return null;

  const related = state.relationships.filter(
    (rel) => rel.source === name || rel.target === name
  );

  if (!related.length) return null;

  const summaries = related.slice(0, 2).map((rel) => {
    const counterpart = rel.source === name ? rel.target : rel.source;
    const relationType = String(rel.type || "bond").replace(/_/g, " ");
    return `${counterpart} (${relationType})`;
  });

  return summaries.join(" • ");
}

export function getSpotlightCast(
  state: AppStateResponse | null,
  latestFocusCharacter: string | null
): CastMember[] {
  if (!state?.cast?.length) return [];

  const scored = [...state.cast].map((member) => {
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
}
