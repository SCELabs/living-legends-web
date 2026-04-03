type StoryHeaderProps = {
  worldName?: string;
  realmLabel?: string;
  onReset: () => void;
  loading: boolean;
};

export default function StoryHeader({
  worldName,
  realmLabel,
  onReset,
  loading,
}: StoryHeaderProps) {
  return (
    <header className="border-b border-stone-800/80 px-5 py-4 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-400/80">
            Living Legends
          </p>
          <h1 className="mt-2 truncate text-2xl font-semibold text-stone-50 sm:text-3xl">
            {worldName || "The Realm"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {realmLabel ? (
            <span className="rounded-full border border-stone-700 bg-stone-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-300">
              {realmLabel}
            </span>
          ) : null}

          <button
            onClick={onReset}
            disabled={loading}
            className="rounded-full border border-stone-700 bg-stone-900/70 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-500 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
