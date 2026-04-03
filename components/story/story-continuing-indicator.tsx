export default function StoryContinuingIndicator() {
  return (
    <div className="flex items-center gap-3 py-2 text-stone-500 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-stone-500/70 animate-[pulse_1.2s_ease-in-out_infinite]" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-500/70 animate-[pulse_1.2s_ease-in-out_0.2s_infinite]" />
        <span className="h-1.5 w-1.5 rounded-full bg-stone-500/70 animate-[pulse_1.2s_ease-in-out_0.4s_infinite]" />
      </div>

      <p className="text-sm tracking-[0.08em]">The world is still moving.</p>
    </div>
  );
}
