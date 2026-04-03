type ScenarioGateProps = {
  loading: boolean;
  onPreset: (preset: string) => void;
};

export default function ScenarioGate({
  loading,
  onPreset,
}: ScenarioGateProps) {
  return (
    <section className="border-t border-stone-800/80 pt-6">
      <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">
        Scenario
      </p>

      <div className="mt-4 space-y-3">
        <button
          onClick={() => onPreset("royal_betrayal")}
          disabled={loading}
          className="block w-full text-left text-sm text-stone-400 transition hover:text-stone-100 disabled:opacity-50"
        >
          Royal Betrayal
        </button>

        <button
          onClick={() => onPreset("fractured_court")}
          disabled={loading}
          className="block w-full text-left text-sm text-stone-400 transition hover:text-stone-100 disabled:opacity-50"
        >
          Fractured Court
        </button>

        <button
          onClick={() => onPreset("collapse_edge")}
          disabled={loading}
          className="block w-full text-left text-sm text-stone-400 transition hover:text-stone-100 disabled:opacity-50"
        >
          Collapse Edge
        </button>
      </div>
    </section>
  );
}
