import { apiRequest } from "@/lib/api";
import type {
  Article,
  ArticleStatus,
  Category,
  Comment,
  ContactMessage,
  Difficulty,
  LearningPath,
  Lesson,
  PlatformStats,
  Role,
  UserPublic,
} from "@/types";

export async function fetchAdminStats(): Promise<PlatformStats> {
  const { data } = await apiRequest<PlatformStats>("/api/admin/stats");
  return data;
}

export async function fetchAdminUsers(): Promise<UserPublic[]> {
  const { data } = await apiRequest<UserPublic[]>("/api/admin/users");
  return data;
}

export async function updateAdminUserRole(id: string, role: Role): Promise<UserPublic> {
  const { data } = await apiRequest<UserPublic>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return data;
}

export async function fetchAdminArticles(): Promise<Article[]> {
  const { data } = await apiRequest<Article[]>("/api/admin/articles?limit=100");
  return data;
}

export async function createArticleAdmin(input: {
  title: string;
  slug?: string;
  description: string;
  content: string;
  categoryId: string;
  status: ArticleStatus;
  featured: boolean;
}): Promise<Article> {
  const { data } = await apiRequest<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function updateArticleAdmin(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    content: string;
    categoryId: string;
    status: ArticleStatus;
    featured: boolean;
  }>,
): Promise<Article> {
  const { data } = await apiRequest<Article>(`/api/articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data;
}

export async function deleteArticleAdmin(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/articles/${id}`, { method: "DELETE" });
}

export async function createCategoryAdmin(input: {
  name: string;
  slug: string;
  description: string;
  icon?: string | null;
  color?: string | null;
}): Promise<Category> {
  const { data } = await apiRequest<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function deleteCategoryAdmin(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/categories/${id}`, { method: "DELETE" });
}

export async function fetchAdminPaths(): Promise<LearningPath[]> {
  const { data } = await apiRequest<LearningPath[]>("/api/admin/paths");
  return data;
}

export async function createLearningPathAdmin(input: {
  title: string;
  slug?: string;
  description: string;
  difficulty: Difficulty;
  durationHours: number;
  objectives: string[];
  sortOrder: number;
  status: ArticleStatus;
}): Promise<LearningPath> {
  const { data } = await apiRequest<LearningPath>("/api/paths", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function deleteLearningPathAdmin(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/paths/${id}`, { method: "DELETE" });
}

export async function createLessonAdmin(input: {
  pathId: string;
  title: string;
  description: string;
  content: string;
  codeExample?: string | null;
  practicalInstructions?: string | null;
  orderIndex: number;
  durationMinutes: number;
  isPublished: boolean;
}): Promise<Lesson> {
  const { data } = await apiRequest<Lesson>("/api/lessons", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function deleteLessonAdmin(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/lessons/${id}`, { method: "DELETE" });
}

export async function fetchAdminComments(): Promise<
  Array<Comment & { articleTitle?: string; articleSlug?: string }>
> {
  const { data } = await apiRequest<Array<Comment & { articleTitle?: string; articleSlug?: string }>>(
    "/api/admin/comments",
  );
  return data;
}

export async function moderateCommentAdmin(id: string, isApproved: boolean): Promise<Comment> {
  const { data } = await apiRequest<Comment>(`/api/comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isApproved }),
  });
  return data;
}

export async function fetchAdminContactMessages(): Promise<ContactMessage[]> {
  const { data } = await apiRequest<ContactMessage[]>("/api/admin/contact");
  return data;
}

export async function markContactMessageAdmin(id: string, isRead: boolean): Promise<ContactMessage> {
  const { data } = await apiRequest<ContactMessage>(`/api/admin/contact/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
  return data;
}

export async function deleteContactMessageAdmin(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/admin/contact/${id}`, { method: "DELETE" });
}
