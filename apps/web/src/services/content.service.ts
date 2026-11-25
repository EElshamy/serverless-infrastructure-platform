import { apiRequest } from "@/lib/api";
import type { Article, Category, Difficulty, LearningPath, Lesson, PaginationMeta } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiRequest<Category[]>("/api/categories");
  return data;
}

export async function fetchCategory(slug: string): Promise<Category> {
  const { data } = await apiRequest<Category>(`/api/categories/${encodeURIComponent(slug)}`);
  return data;
}

export async function fetchArticles(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  featured?: boolean;
  sort?: "newest" | "oldest" | "popular" | "title";
}): Promise<{ items: Article[]; meta?: PaginationMeta }> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.q) search.set("q", params.q);
  if (params?.category) search.set("category", params.category);
  if (params?.featured !== undefined) search.set("featured", String(params.featured));
  if (params?.sort) search.set("sort", params.sort);

  const qs = search.toString();
  const { data, meta } = await apiRequest<Article[]>(`/api/articles${qs ? `?${qs}` : ""}`);
  return { items: data, meta };
}

export async function fetchArticle(slug: string): Promise<Article> {
  const { data } = await apiRequest<Article>(`/api/articles/${encodeURIComponent(slug)}`);
  return data;
}

export async function fetchLearningPaths(difficulty?: Difficulty): Promise<LearningPath[]> {
  const qs = difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : "";
  const { data } = await apiRequest<LearningPath[]>(`/api/paths${qs}`);
  return data;
}

export async function fetchLearningPath(slug: string): Promise<LearningPath> {
  const { data } = await apiRequest<LearningPath>(`/api/paths/${encodeURIComponent(slug)}`);
  return data;
}

export async function fetchLessonBySlug(
  pathSlug: string,
  lessonSlug: string,
): Promise<{
  path: { id: string; title: string; slug: string; difficulty: Difficulty };
  lesson: Lesson;
  siblings: Lesson[];
}> {
  const { data } = await apiRequest<{
    path: { id: string; title: string; slug: string; difficulty: Difficulty };
    lesson: Lesson;
    siblings: Lesson[];
  }>(`/api/paths/${encodeURIComponent(pathSlug)}/lessons/${encodeURIComponent(lessonSlug)}`);
  return data;
}
