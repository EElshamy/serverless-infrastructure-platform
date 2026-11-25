import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { TopicIcon } from "@/lib/icons";
import type { LearningPath } from "@/types";
import { DifficultyBadge } from "./ui-states";

export function PathCard({ path }: { path: LearningPath }) {
  const lessonCount = path.lessonCount ?? path.lessons?.length ?? 0;
  const completed = path.completedLessons ?? 0;
  const pct = lessonCount > 0 && path.completedLessons !== undefined ? Math.round((completed / lessonCount) * 100) : null;

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-sky-500/40 hover:bg-slate-900"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800"
          style={path.color ? { color: path.color } : undefined}
        >
          <TopicIcon name={path.icon} className="h-5 w-5" />
        </div>
        <DifficultyBadge difficulty={path.difficulty} />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-slate-100 transition group-hover:text-sky-400">
        {path.title}
      </h3>
      <p className="mb-5 flex-1 text-sm text-slate-400">{path.description}</p>

      {pct !== null && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>
              {completed}/{lessonCount} lessons ({pct}%)
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {path.durationHours}h
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-medium text-sky-400">
          Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
