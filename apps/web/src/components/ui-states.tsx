import type { Difficulty } from "@/types";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    advanced: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
      <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-14 text-center">
      <h3 className="mb-1.5 text-base font-semibold text-slate-200">{title}</h3>
      <p className="mx-auto max-w-md text-sm text-slate-400">{description}</p>
    </div>
  );
}
