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

  const atmosphereLine = useMemo(() => {
    const actions = choices.map((choice) => choice.action);

    if (actions.includes("fragmentation") || actions.includes("corrupt")) {
      return "Something is about to give.";
    }

    if (actions.includes("pressure") || actions.includes("boundary")) {
      return "Pressure gathers beneath the surface.";
    }

    if (actions.includes("protect") || actions.includes("unity")) {
      return "The structure tightens.";
    }

    return "The moment asks for intervention.";
  }, [choices]);

  function handleSelect(choice: ChoiceOption) {
    if (loading) return;

    setSelected(choice.id);

    // small delay so fade feels intentional
    setTimeout(() => {
      onChoose(choice);
    }, 300);
  }

  // after selection, fully remove prompt (clean narrative flow)
  if (selected) return null;

  return (
    <section
      className={`rounded-3xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.10),rgba(251,191,36,0.04))] p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.05),0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-500 sm:p-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/80">
        Intervention
      </p>

      <p className="mt-3 text-sm italic leading-6 text-amber-100/70">
        {atmosphereLine}
      </p>

      <p className="mt-4 text-[17px] leading-8 text-stone-50 sm:text-[18px]">
        {prompt}
      </p>

      <div className="mt-6 space-y-4">
        {choices.map((choice, index) => {
          const toneClass =
            choice.action === "corrupt" || choice.action === "fragmentation"
              ? "hover:border-red-400/35 hover:bg-red-950/20"
              : choice.action === "protect" || choice.action === "unity"
              ? "hover:border-emerald-400/35 hover:bg-emerald-950/20"
              : "hover:border-amber-400/40 hover:bg-stone-900/70";

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={loading}
              className={`w-full rounded-2xl border border-stone-700/90 bg-stone-950/45 px-4 py-4 text-left text-sm text-stone-200 shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)] active:translate-y-0 active:scale-[0.995]`}
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
                <span className="mt-0.5 text-xs text-amber-200/70">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
