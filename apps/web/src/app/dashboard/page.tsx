"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Bookmark, CheckCircle2, Layers, Trash2, User } from "lucide-react";
import { EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile } from "@/services/auth.service";
import { fetchLearningPaths } from "@/services/content.service";
import { fetchBookmarks, fetchProgress, removeBookmark } from "@/services/engagement.service";
import type { Bookmark as BookmarkType, LearningPath } from "@/types";

export default function DashboardPage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    let cancelled = false;
    async function load() {
      try {
        const [bookmarkList, progressData, pathList] = await Promise.all([
          fetchBookmarks(),
          fetchProgress(),
          fetchLearningPaths(),
        ]);
        if (!cancelled) {
          setName(currentUser.name);
          setBio(currentUser.bio ?? "");
          setBookmarks(bookmarkList);
          setCompletedCount(progressData.completedCount);
          setTotalLessons(progressData.totalPublishedLessons);
          setPaths(pathList);
          setLoadedUserId(currentUser.id);
        }
      } catch {
        if (!cancelled) setLoadedUserId(currentUser.id);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = authLoading || (Boolean(user) && loadedUserId !== user?.id);

  async function handleRemoveBookmark(articleId: string) {
    await removeBookmark(articleId);
    setBookmarks((prev) => prev.filter((item) => item.articleId !== articleId));
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileNotice(null);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
      });
      setUser(updated);
      setProfileNotice("Profile updated.");
    } finally {
      setSavingProfile(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <LoadingState label="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Sign in required</h1>
          <p className="mb-6 text-sm text-slate-400">
            Access your personal dashboard to review lesson progress and saved bookmarks.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your active learning paths, saved articles, and account settings.
          </p>
        </div>
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            Open Admin Dashboard
          </Link>
        )}
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Lessons Completed
          </div>
          <div className="text-3xl font-bold text-white">
            {completedCount} <span className="text-base font-normal text-slate-400">/ {totalLessons}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers className="h-4 w-4 text-sky-400" />
            Overall Progress
          </div>
          <div className="text-3xl font-bold text-white">{completionPct}%</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Bookmark className="h-4 w-4 text-amber-400" />
            Saved Bookmarks
          </div>
          <div className="text-3xl font-bold text-white">{bookmarks.length}</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Learning Path Progress</h2>
            <div className="space-y-4">
              {paths.map((path) => {
                const count = path.lessonCount ?? 0;
                const done = path.completedLessons ?? 0;
                const pct = count > 0 ? Math.round((done / count) * 100) : 0;
                return (
                  <Link
                    key={path.id}
                    href={`/paths/${path.slug}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-sky-500/40"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">{path.title}</span>
                      <span className="text-xs text-slate-400">
                        {done}/{count} lessons ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-sky-400" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Bookmarked Articles</h2>
            {bookmarks.length === 0 ? (
              <EmptyState
                title="No bookmarks saved"
                description="Save any article while reading to build your quick reference list."
              />
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="min-w-0">
                      {bm.article ? (
                        <Link
                          href={`/articles/${bm.article.slug}`}
                          className="block truncate font-semibold text-slate-100 hover:text-sky-400"
                        >
                          {bm.article.title}
                        </Link>
                      ) : (
                        <span className="text-slate-300">Saved article</span>
                      )}
                      {bm.article?.category && (
                        <span className="text-xs text-slate-400">{bm.article.category.name}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemoveBookmark(bm.articleId)}
                      aria-label="Remove bookmark"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <User className="h-5 w-5 text-sky-400" />
              Profile Settings
            </h2>

            {profileNotice && (
              <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                {profileNotice}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-500"
                />
              </div>

              <div>
                <label htmlFor="profile-name" className="mb-1 block text-xs font-medium text-slate-300">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="profile-bio" className="mb-1 block text-xs font-medium text-slate-300">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What are you learning or operating?"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
