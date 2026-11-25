"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui-states";
import { TopicIcon } from "@/lib/icons";
import { fetchCategories } from "@/services/content.service";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Topic Categories</h1>
        <p className="mt-2 text-sm text-slate-400">
          Explore technical domains from Linux fundamentals to serverless architecture.
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading categories..." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-sky-500/40 hover:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800"
                  style={cat.color ? { color: cat.color } : undefined}
                >
                  <TopicIcon name={cat.icon} className="h-5 w-5" />
                </div>
                  <span className="rounded-full border border-slate-700 px-2.5 py-0.5 text-xs text-slate-300">
                    {cat.articleCount ?? 0} articles
                  </span>
                </div>
                <h2 className="mb-2 text-lg font-semibold text-slate-100 group-hover:text-sky-400">
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-400">{cat.description}</p>
              </Link>
          ))}
        </div>
      )}
    </div>
  );
}
