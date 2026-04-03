"use client";

import { useState } from "react";

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
      className={`rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 transition-opacity duration-500 ${
        selected ? "opacity-0" : "opacity-100"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/85">
        Intervention
      </p>

      <p className="mt-3 text-[15px] leading-8 text-stone-100">
        {prompt}
      </p>

      <div className="mt-5 space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => handleSelect(choice)}
            disabled={loading}
            className="w-full rounded-2xl border border-stone-700 bg-stone-950/40 px-4 py-4 text-left text-sm text-stone-200 transition hover:border-amber-400/40 hover:bg-stone-900/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}
