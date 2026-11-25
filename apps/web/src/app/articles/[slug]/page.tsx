"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Bookmark, Clock, Eye, MessageSquare, Trash2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { EmptyState, LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import { fetchArticle } from "@/services/content.service";
import {
  addBookmark,
  deleteComment,
  fetchArticleComments,
  postArticleComment,
  removeBookmark,
} from "@/services/engagement.service";
import type { Article, Comment } from "@/types";

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchArticle(slug);
        if (cancelled) return;
        setArticle(fetched);
        const fetchedComments = await fetchArticleComments(fetched.id);
        if (!cancelled) setComments(fetchedComments);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Article not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, user?.id]);

  async function handleBookmark() {
    if (!article || !user) return;
    setBookmarkBusy(true);
    try {
      if (article.bookmarked) {
        await removeBookmark(article.id);
      } else {
        await addBookmark(article.id);
      }
      setArticle((prev) => (prev ? { ...prev, bookmarked: !prev.bookmarked } : prev));
    } finally {
      setBookmarkBusy(false);
    }
  }

  async function handleCommentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!article || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const created = await postArticleComment(article.id, commentText.trim());
      setComments((prev) => [created, ...prev]);
      setCommentText("");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <LoadingState label="Loading article..." />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState title="Article unavailable" description={error ?? "Could not load this article."} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/articles"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-sky-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to articles
      </Link>

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {article.category && (
            <Link
              href={`/categories/${article.category.slug}`}
              className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300"
            >
              {article.category.name}
            </Link>
          )}

          {user && (
            <button
              type="button"
              disabled={bookmarkBusy}
              onClick={handleBookmark}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                article.bookmarked
                  ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${article.bookmarked ? "fill-current" : ""}`} />
              {article.bookmarked ? "Bookmarked" : "Save Bookmark"}
            </button>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {article.title}
        </h1>
        <p className="mb-5 text-base text-slate-300">{article.description}</p>

        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
          <span>By {article.author?.name ?? "DevOps Academy"}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {article.views} views
          </span>
        </div>
      </header>

      {article.coverImage && (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <MarkdownRenderer content={article.content} />
      </div>

      <section className="mt-12 border-t border-slate-800 pt-10">
        <div className="mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white">Discussion ({comments.length})</h2>
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8 space-y-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share a note, question, or operational lesson learned..."
              required
              minLength={2}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
            <Link href="/login" className="font-semibold text-sky-400 hover:underline">
              Sign in
            </Link>{" "}
            to join the discussion on this article.
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet. Start the conversation.</p>
          ) : (
            comments.map((comment) => {
              const canDelete = user && (user.id === comment.user?.id || user.role === "admin");
              return (
                <div
                  key={comment.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        {comment.user?.name ?? "Learner"}
                      </span>
                      <span>·</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void handleDeleteComment(comment.id)}
                        aria-label="Delete comment"
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{comment.content}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
