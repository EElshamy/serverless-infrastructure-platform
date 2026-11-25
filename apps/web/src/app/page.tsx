"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Layers, ShieldCheck, Terminal } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { PathCard } from "@/components/path-card";
import { LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { TopicIcon } from "@/lib/icons";
import { fetchArticles, fetchCategories, fetchLearningPaths } from "@/services/content.service";
import { addBookmark, removeBookmark } from "@/services/engagement.service";
import type { Article, Category, LearningPath } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyArticleId, setBusyArticleId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [articlesRes, pathsRes, categoriesRes] = await Promise.all([
          fetchArticles({ featured: true, limit: 3 }),
          fetchLearningPaths(),
          fetchCategories(),
        ]);
        if (!cancelled) {
          setArticles(articlesRes.items);
          setPaths(pathsRes.slice(0, 3));
          setCategories(categoriesRes);
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleToggleBookmark(article: Article) {
    if (!user) return;
    setBusyArticleId(article.id);
    try {
      if (article.bookmarked) {
        await removeBookmark(article.id);
      } else {
        await addBookmark(article.id);
      }
      setArticles((prev) =>
        prev.map((item) => (item.id === article.id ? { ...item, bookmarked: !item.bookmarked } : item)),
      );
    } finally {
      setBusyArticleId(null);
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300">
              <Terminal className="h-3.5 w-3.5" />
              Practical DevOps &amp; Cloud Engineering Curriculum
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Master infrastructure from Linux basics to production Kubernetes.
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-300">
              Explore structured learning paths, hands-on terminal exercises, and field-tested engineering
              articles. Track your progress lesson by lesson and build real operational confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/paths"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Explore Learning Paths
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
              >
                Browse Articles
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Structured Paths",
                desc: "Step-by-step tracks with difficulty levels, clear objectives, and ordered lessons.",
              },
              {
                icon: BookOpen,
                title: "Deep Technical Guides",
                desc: "Actionable articles with real CLI commands, architecture notes, and references.",
              },
              {
                icon: CheckCircle2,
                title: "Progress & Bookmarks",
                desc: "Save articles for later and track completed lessons across every curriculum.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5"
              >
                <item.icon className="mb-3 h-5 w-5 text-sky-400" />
                <h2 className="mb-1 text-base font-semibold text-slate-100">{item.title}</h2>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Featured Articles</h2>
            <p className="mt-1 text-sm text-slate-400">
              High-signal engineering writeups to sharpen your day-to-day operations.
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            View all articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingState label="Loading featured articles..." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleBookmark={user ? handleToggleBookmark : undefined}
                bookmarkBusy={busyArticleId === article.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Learning Paths</h2>
              <p className="mt-1 text-sm text-slate-400">
                Guided tracks combining theory, code examples, and practical labs.
              </p>
            </div>
            <Link
              href="/paths"
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 hover:text-sky-300"
            >
              All learning paths <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingState label="Loading learning paths..." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Core Topics</h2>
            <p className="mt-1 text-sm text-slate-400">
              Jump directly into the infrastructure domains that power modern systems.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            Browse categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-start gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-500/40 hover:bg-slate-900"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800"
                style={cat.color ? { color: cat.color } : undefined}
              >
                <TopicIcon name={cat.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-100 group-hover:text-sky-400">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {cat.articleCount ?? 0} {cat.articleCount === 1 ? "article" : "articles"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <ShieldCheck className="h-4 w-4" />
              Ready to track your progress?
            </div>
            <h2 className="text-2xl font-bold text-white">
              Create your learner account in seconds.
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Bookmark guides, join discussions, and monitor your path completion from one dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              {user ? "Open Dashboard" : "Create Free Account"}
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
