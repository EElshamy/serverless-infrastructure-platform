"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock, Eye } from "lucide-react";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  onToggleBookmark?: (article: Article) => void;
  bookmarkBusy?: boolean;
}

export function ArticleCard({ article, onToggleBookmark, bookmarkBusy }: ArticleCardProps) {
  const coverSrc = article.coverImage ?? "/covers/devops.svg";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-sky-500/40 hover:bg-slate-900">
      <Link href={`/articles/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-950">
        <Image
          src={coverSrc}
          alt={article.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        {article.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-sky-500/90 px-2.5 py-0.5 text-xs font-semibold text-slate-950">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          {article.category ? (
            <Link
              href={`/categories/${article.category.slug}`}
              className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-sky-300 hover:border-sky-500/50"
            >
              {article.category.name}
            </Link>
          ) : (
            <span />
          )}

          {onToggleBookmark && (
            <button
              type="button"
              disabled={bookmarkBusy}
              onClick={() => onToggleBookmark(article)}
              aria-label={article.bookmarked ? "Remove bookmark" : "Bookmark article"}
              className={`rounded-lg p-1.5 transition ${
                article.bookmarked
                  ? "bg-sky-500/20 text-sky-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${article.bookmarked ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        <Link href={`/articles/${article.slug}`} className="mb-2 block">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-100 transition group-hover:text-sky-400">
            {article.title}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-400">{article.description}</p>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
          <span>{article.author?.name ?? "DevOps Academy"}</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
