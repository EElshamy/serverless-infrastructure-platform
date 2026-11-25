"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { fetchArticles, fetchCategories } from "@/services/content.service";
import { addBookmark, removeBookmark } from "@/services/engagement.service";
import type { Article, Category, PaginationMeta } from "@/types";

export default function ArticlesPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "popular" | "title">("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchArticles({
          page,
          limit: 9,
          q: search.trim() || undefined,
          category: selectedCategory || undefined,
          sort,
        });
        if (!cancelled) {
          setArticles(res.items);
          setMeta(res.meta);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [page, search, selectedCategory, sort, user?.id]);

  async function handleToggleBookmark(article: Article) {
    if (!user) return;
    setBusyId(article.id);
    try {
      if (article.bookmarked) {
        await removeBookmark(article.id);
      } else {
        await addBookmark(article.id);
      }
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, bookmarked: !a.bookmarked } : a)),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Engineering Articles</h1>
        <p className="mt-2 text-sm text-slate-400">
          Practical guides, deep dives, and operational patterns across the DevOps lifecycle.
        </p>
      </div>

      <div className="mb-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search articles by keyword, tool, or concept..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setPage(1);
            setSelectedCategory(e.target.value);
          }}
          aria-label="Filter by category"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value as "newest" | "oldest" | "popular" | "title");
          }}
          aria-label="Sort articles"
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="popular">Most viewed</option>
          <option value="title">Alphabetical</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading articles..." />
      ) : articles.length === 0 ? (
        <EmptyState
          title="No matching articles"
          description="Try clearing your search query or selecting a different category."
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleBookmark={user ? handleToggleBookmark : undefined}
                bookmarkBusy={busyId === article.id}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
