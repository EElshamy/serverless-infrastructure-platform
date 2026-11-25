"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle, Target } from "lucide-react";
import { DifficultyBadge, EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { fetchLearningPath } from "@/services/content.service";
import type { LearningPath } from "@/types";

export default function PathDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useAuth();

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchLearningPath(slug);
        if (!cancelled) setPath(fetched);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Learning path not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, user?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <LoadingState label="Loading learning path..." />
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <EmptyState title="Learning path unavailable" description={error ?? "Could not load path."} />
      </div>
    );
  }

  const lessons = path.lessons ?? [];
  const completedCount = lessons.filter((l) => l.completed).length;
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/paths"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-sky-400"
      >
        <ArrowLeft className="h-4 w-4" />
        All learning paths
      </Link>

      <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <DifficultyBadge difficulty={path.difficulty} />
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {path.durationHours} hours estimated
          </span>
          <span className="text-xs text-slate-400">· {lessons.length} lessons</span>
        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">{path.title}</h1>
        <p className="mb-6 text-base text-slate-300">{path.description}</p>

        {user && lessons.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-300">
              <span>Your Completion Progress</span>
              <span>
                {completedCount}/{lessons.length} completed ({pct}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {path.objectives.length > 0 && (
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
              <Target className="h-4 w-4 text-sky-400" />
              What you will learn
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {path.objectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-white">Curriculum Lessons</h2>
        {lessons.length === 0 ? (
          <EmptyState
            title="No published lessons yet"
            description="Lessons for this path are being prepared."
          />
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <Link
                key={lesson.id}
                href={`/paths/${path.slug}/lessons/${lesson.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-sky-500/40 hover:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600 group-hover:text-sky-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Lesson {idx + 1}
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-sky-400">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">{lesson.description}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
                  <span>{lesson.durationMinutes} min</span>
                  <PlayCircle className="h-5 w-5 text-sky-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
