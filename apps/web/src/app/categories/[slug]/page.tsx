"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { fetchArticles, fetchCategory } from "@/services/content.service";
import { addBookmark, removeBookmark } from "@/services/engagement.service";
import type { Article, Category } from "@/types";

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [cat, res] = await Promise.all([
          fetchCategory(slug),
          fetchArticles({ category: slug, limit: 50 }),
        ]);
        if (!cancelled) {
          setCategory(cat);
          setArticles(res.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, user?.id]);

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
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-sky-400"
      >
        <ArrowLeft className="h-4 w-4" />
        All categories
      </Link>

      {loading ? (
        <LoadingState label="Loading category..." />
      ) : !category ? (
        <EmptyState title="Category not found" description="This topic category does not exist." />
      ) : (
        <>
          <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{category.description}</p>
          </div>

          {articles.length === 0 ? (
            <EmptyState
              title="No published articles yet"
              description="Check back soon for new guides in this category."
            />
          ) : (
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
          )}
        </>
      )}
    </div>
  );
}
