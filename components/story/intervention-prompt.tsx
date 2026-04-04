"use client";

import { useEffect, useMemo, useState } from "react";

type ChoiceOption = {
  id: string;
  label: string;
  action: string;
  target?: string | null;
};

type InterventionPromptProps = {
  prompt: string;
  choices: ChoiceOption[];
  loading: boolean;
  onChoose: (choice: ChoiceOption) => void;
};

type PromptMode = "coherence" | "suppression" | "boundary" | "fragmentation";

export default function InterventionPrompt({
  prompt,
  choices,
  loading,
  onChoose,
}: InterventionPromptProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 60);

    return () => clearTimeout(timer);
  }, []);

  const mode = useMemo<PromptMode>(() => {
    const text = `${prompt} ${choices.map((choice) => choice.label).join(" ")}`.toLowerCase();

    if (
      text.includes("rupture") ||
      text.includes("fracture") ||
      text.includes("fragment") ||
      text.includes("collapse") ||
      text.includes("unravel") ||
      text.includes("break") ||
      text.includes("shatter") ||
      text.includes("ruin")
    ) {
      return "fragmentation";
    }

    if (
      text.includes("surface") ||
      text.includes("calm") ||
      text.includes("holds") ||
      text.includes("hold") ||
      text.includes("restrain") ||
      text.includes("rest") ||
      text.includes("stillness") ||
      text.includes("uneasy")
    ) {
      return "suppression";
    }

    if (
      text.includes("pressure") ||
      text.includes("strain") ||
      text.includes("tension") ||
      text.includes("unstable") ||
      text.includes("edge") ||
      text.includes("threshold") ||
      text.includes("gathers")
    ) {
      return "boundary";
    }

    if (
      text.includes("cohere") ||
      text.includes("alignment") ||
      text.includes("resolve") ||
      text.includes("settle") ||
      text.includes("unity") ||
      text.includes("stability")
    ) {
      return "coherence";
    }

    return "boundary";
  }, [prompt, choices]);

  const atmosphereLine = useMemo(() => {
    if (mode === "coherence") return "The structure holds.";
    if (mode === "suppression") return "The surface is calm, but it does not rest.";
    if (mode === "fragmentation") return "The realm is close to rupture.";
    return "Pressure gathers.";
  }, [mode]);

  const panelClass = useMemo(() => {
    if (mode === "coherence") {
      return "border-emerald-500/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(16,185,129,0.03))] shadow-[0_0_0_1px_rgba(16,185,129,0.04),0_16px_34px_rgba(0,0,0,0.22)]";
    }

    if (mode === "suppression") {
      return "border-sky-200/10 bg-[linear-gradient(180deg,rgba(148,163,184,0.08),rgba(120,113,108,0.04))] shadow-[0_0_0_1px_rgba(245,158,11,0.03),0_18px_36px_rgba(0,0,0,0.24)]";
    }

    if (mode === "fragmentation") {
      return "border-red-500/25 bg-[linear-gradient(180deg,rgba(127,29,29,0.20),rgba(251,191,36,0.04))] shadow-[0_0_0_1px_rgba(239,68,68,0.06),0_22px_44px_rgba(0,0,0,0.30)]";
    }

    return "border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.10),rgba(251,191,36,0.04))] shadow-[0_0_0_1px_rgba(251,191,36,0.05),0_20px_40px_rgba(0,0,0,0.25)]";
  }, [mode]);

  const atmosphereClass = useMemo(() => {
    if (mode === "coherence") return "text-emerald-100/70";
    if (mode === "suppression") return "text-stone-300/70";
    if (mode === "fragmentation") return "text-red-100/75";
    return "text-amber-100/70";
  }, [mode]);

  function handleSelect(choice: ChoiceOption) {
    if (loading) return;

    setSelected(choice.id);

    setTimeout(() => {
      onChoose(choice);
    }, 300);
  }

  if (selected) return null;

  return (
    <section
      className={`rounded-3xl border p-5 transition-all duration-500 sm:p-6 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } ${panelClass}`}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/80">
        Intervention
      </p>

      <p className={`mt-3 text-sm italic leading-6 ${atmosphereClass}`}>
        {atmosphereLine}
      </p>

      <p
        className={`mt-4 text-[17px] leading-8 sm:text-[18px] ${
          mode === "fragmentation" ? "text-stone-50" : "text-stone-100"
        }`}
      >
        {prompt}
      </p>

      <div className="mt-6 space-y-4">
        {choices.map((choice, index) => {
          const choiceClass =
            mode === "coherence"
              ? "border-stone-700/80 bg-stone-950/35 hover:border-emerald-400/30 hover:bg-emerald-950/15"
              : mode === "suppression"
              ? "border-stone-700/85 bg-stone-950/40 hover:border-sky-200/15 hover:bg-stone-900/65"
              : mode === "fragmentation"
              ? "border-stone-700/90 bg-stone-950/50 hover:border-red-400/35 hover:bg-red-950/20"
              : "border-stone-700/90 bg-stone-950/45 hover:border-amber-400/40 hover:bg-stone-900/70";

          const arrowClass =
            mode === "coherence"
              ? "text-emerald-200/60"
              : mode === "suppression"
              ? "text-stone-300/55"
              : mode === "fragmentation"
              ? "text-red-200/70"
              : "text-amber-200/70";

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={loading}
              className={`w-full rounded-2xl border px-4 py-4 text-left text-sm text-stone-200 shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${choiceClass} hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)] active:translate-y-0 active:scale-[0.995]`}
              style={{
                transitionDelay: visible ? `${index * 40}ms` : "0ms",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="leading-6 text-stone-100">{choice.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
                    {choice.target ? `Move through ${choice.target}` : "Affect the structure"}
                  </p>
                </div>
                <span className={`mt-0.5 text-xs ${arrowClass}`}>→</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
