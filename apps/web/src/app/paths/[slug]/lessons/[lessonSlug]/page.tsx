"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, Terminal } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { fetchLessonBySlug } from "@/services/content.service";
import { setLessonProgress } from "@/services/engagement.service";
import type { Difficulty, Lesson } from "@/types";

export default function LessonDetailPage() {
  const params = useParams<{ slug: string; lessonSlug: string }>();
  const pathSlug = params?.slug;
  const lessonSlug = params?.lessonSlug;
  const { user } = useAuth();

  const [data, setData] = useState<{
    path: { id: string; title: string; slug: string; difficulty: Difficulty };
    lesson: Lesson;
    siblings: Lesson[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!pathSlug || !lessonSlug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLessonBySlug(pathSlug, lessonSlug);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Lesson not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [pathSlug, lessonSlug, user?.id]);

  async function handleToggleComplete() {
    if (!data || !user) return;
    setToggling(true);
    try {
      const nextCompleted = !data.lesson.completed;
      await setLessonProgress(data.lesson.id, nextCompleted);
      setData((prev) =>
        prev
          ? {
              ...prev,
              lesson: { ...prev.lesson, completed: nextCompleted },
              siblings: prev.siblings.map((item) =>
                item.id === prev.lesson.id ? { ...item, completed: nextCompleted } : item,
              ),
            }
          : prev,
      );
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <LoadingState label="Loading lesson..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <EmptyState title="Lesson unavailable" description={error ?? "Could not load this lesson."} />
      </div>
    );
  }

  const { path, lesson, siblings } = data;
  const currentIdx = siblings.findIndex((item) => item.id === lesson.id);
  const prevLesson = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/paths/${path.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-sky-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {path.title}
      </Link>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="order-2 lg:order-1 lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Path Lessons
            </h2>
            <nav className="space-y-1.5">
              {siblings.map((item, idx) => {
                const active = item.id === lesson.id;
                return (
                  <Link
                    key={item.id}
                    href={`/paths/${path.slug}/lessons/${item.slug}`}
                    className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs transition ${
                      active
                        ? "bg-sky-500/15 font-semibold text-sky-300"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                    )}
                    <span>
                      {idx + 1}. {item.title}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="order-1 lg:order-2 lg:col-span-3">
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {lesson.durationMinutes} minutes
              </span>

              {user ? (
                <button
                  type="button"
                  disabled={toggling}
                  onClick={handleToggleComplete}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    lesson.completed
                      ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "bg-sky-500 text-slate-950 hover:bg-sky-400"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {lesson.completed ? "Completed" : "Mark as Completed"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-sky-400 hover:bg-slate-800"
                >
                  Sign in to track progress
                </Link>
              )}
            </div>

            <h1 className="mb-2 text-2xl font-extrabold text-white sm:text-3xl">{lesson.title}</h1>
            <p className="text-sm text-slate-300">{lesson.description}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <MarkdownRenderer content={lesson.content} />
          </div>

          {lesson.practicalInstructions && (
            <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6">
              <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-sky-300">
                <Terminal className="h-4 w-4" />
                Hands-On Lab Instructions
              </h2>
              <p className="text-sm leading-relaxed text-slate-200">{lesson.practicalInstructions}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-800 pt-6">
            {prevLesson ? (
              <Link
                href={`/paths/${path.slug}/lessons/${prevLesson.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous: {prevLesson.title}
              </Link>
            ) : (
              <span />
            )}

            {nextLesson && (
              <Link
                href={`/paths/${path.slug}/lessons/${nextLesson.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                Next: {nextLesson.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
