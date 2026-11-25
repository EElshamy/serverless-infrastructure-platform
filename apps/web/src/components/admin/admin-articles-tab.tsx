"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createArticleAdmin,
  createCategoryAdmin,
  deleteArticleAdmin,
  deleteCategoryAdmin,
  updateArticleAdmin,
} from "@/services/admin.service";
import type { Article, ArticleStatus, Category } from "@/types";

interface Props {
  articles: Article[];
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export function AdminArticlesTab({ articles, categories, onRefresh }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [status, setStatus] = useState<ArticleStatus>("published");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");

  async function handleCreateArticle(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await createArticleAdmin({
        title,
        description,
        content,
        categoryId: categoryId || categories[0]?.id || "",
        status,
        featured,
      });
      setTitle("");
      setDescription("");
      setContent("");
      setFeatured(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create article");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await createCategoryAdmin({ name: catName, slug: catSlug, description: catDesc });
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setBusy(false);
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
          onSubmit={handleCreateArticle}
          className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Plus className="h-4 w-4 text-sky-400" />
            Publish New Article
          </h2>
          <input
            type="text"
            required
            minLength={5}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            type="text"
            required
            minLength={20}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (min 20 chars)"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <textarea
            rows={4}
            required
            minLength={40}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdown content (min 40 chars)"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={categoryId || categories[0]?.id || ""}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Feature on home page
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Create Article
          </button>
        </form>

        <form
          onSubmit={handleCreateCategory}
          className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Plus className="h-4 w-4 text-sky-400" />
            Add Category
          </h2>
          <input
            type="text"
            required
            minLength={2}
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Category name (e.g. Observability)"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            type="text"
            required
            minLength={2}
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            placeholder="lowercase-slug"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <textarea
            rows={3}
            required
            minLength={10}
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
            placeholder="Category description"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Create Category
          </button>

          <div className="pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-400">
              Existing Categories ({categories.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-200"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteCategoryAdmin(cat.id);
                      await onRefresh();
                    }}
                    aria-label={`Delete ${cat.name}`}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">All Articles ({articles.length})</h2>
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="min-w-0">
                <div className="font-semibold text-slate-100">{article.title}</div>
                <div className="text-xs text-slate-400">
                  {article.category?.name ?? "Uncategorized"} · {article.status} · {article.views} views
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updateArticleAdmin(article.id, {
                      status: article.status === "published" ? "draft" : "published",
                    });
                    await onRefresh();
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                >
                  {article.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteArticleAdmin(article.id);
                    await onRefresh();
                  }}
                  aria-label="Delete article"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
