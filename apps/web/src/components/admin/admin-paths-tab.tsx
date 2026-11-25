"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createLearningPathAdmin,
  createLessonAdmin,
  deleteLearningPathAdmin,
} from "@/services/admin.service";
import type { Difficulty, LearningPath } from "@/types";

interface Props {
  paths: LearningPath[];
  onRefresh: () => Promise<void>;
}

export function AdminPathsTab({ paths, onRefresh }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [durationHours, setDurationHours] = useState(6);
  const [objective, setObjective] = useState("");

  const [lessonPathId, setLessonPathId] = useState(paths[0]?.id ?? "");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonOrder, setLessonOrder] = useState(0);
  const [lessonMinutes, setLessonMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);

  async function handleCreatePath(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createLearningPathAdmin({
        title,
        description,
        difficulty,
        durationHours,
        objectives: [objective || "Master core workflow concepts"],
        sortOrder: paths.length + 1,
        status: "published",
      });
      setTitle("");
      setDescription("");
      setObjective("");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create learning path");
    }
  }

  async function handleCreateLesson(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createLessonAdmin({
        pathId: lessonPathId || paths[0]?.id || "",
        title: lessonTitle,
        description: lessonDesc,
        content: lessonContent,
        orderIndex: lessonOrder,
        durationMinutes: lessonMinutes,
        isPublished: true,
      });
      setLessonTitle("");
      setLessonDesc("");
      setLessonContent("");
      setLessonOrder((n) => n + 1);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson");
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleCreatePath}
          className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Plus className="h-4 w-4 text-sky-400" />
            Create Learning Path
          </h2>
          <input
            type="text"
            required
            minLength={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Path title"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <textarea
            rows={3}
            required
            minLength={20}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Path description (min 20 chars)"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            type="text"
            required
            minLength={5}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Primary learning objective"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input
              type="number"
              min={1}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Create Learning Path
          </button>
        </form>

        <form
          onSubmit={handleCreateLesson}
          className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Plus className="h-4 w-4 text-sky-400" />
            Add Lesson to Path
          </h2>
          <select
            value={lessonPathId || paths[0]?.id || ""}
            onChange={(e) => setLessonPathId(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            minLength={3}
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="Lesson title"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            type="text"
            required
            minLength={10}
            value={lessonDesc}
            onChange={(e) => setLessonDesc(e.target.value)}
            placeholder="Lesson summary"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <textarea
            rows={3}
            required
            minLength={30}
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            placeholder="Markdown lesson content"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={0}
              value={lessonOrder}
              onChange={(e) => setLessonOrder(Number(e.target.value))}
              placeholder="Order index"
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
            <input
              type="number"
              min={1}
              value={lessonMinutes}
              onChange={(e) => setLessonMinutes(Number(e.target.value))}
              placeholder="Minutes"
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Add Lesson
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Learning Paths ({paths.length})</h2>
        <div className="space-y-3">
          {paths.map((path) => (
            <div
              key={path.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div>
                <div className="font-semibold text-slate-100">{path.title}</div>
                <div className="text-xs text-slate-400">
                  {path.difficulty} · {path.lessonCount ?? 0} lessons · {path.durationHours}h
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await deleteLearningPathAdmin(path.id);
                  await onRefresh();
                }}
                aria-label="Delete path"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
