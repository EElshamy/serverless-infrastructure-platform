"use client";

import { useEffect, useState } from "react";
import { PathCard } from "@/components/path-card";
import { EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { fetchLearningPaths } from "@/services/content.service";
import type { Difficulty, LearningPath } from "@/types";

const DIFFICULTIES: Array<{ value: "" | Difficulty; label: string }> = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function PathsPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [difficulty, setDifficulty] = useState<"" | Difficulty>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchLearningPaths(difficulty || undefined);
        if (!cancelled) setPaths(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [difficulty, user?.id]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Learning Paths</h1>
          <p className="mt-2 text-sm text-slate-400">
            Structured, ordered lessons with practical labs to build real infrastructure skills.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setDifficulty(item.value)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                difficulty === item.value
                  ? "bg-sky-500 text-slate-950"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading learning paths..." />
      ) : paths.length === 0 ? (
        <EmptyState
          title="No learning paths found"
          description="Try choosing a different difficulty level."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      )}
    </div>
  );
}
