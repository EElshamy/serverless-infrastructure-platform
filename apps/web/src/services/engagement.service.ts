import { apiRequest } from "@/lib/api";
import type { Bookmark, Comment, ContactMessage, LessonProgress } from "@/types";

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const { data } = await apiRequest<Bookmark[]>("/api/bookmarks");
  return data;
}

export async function addBookmark(articleId: string): Promise<Bookmark> {
  const { data } = await apiRequest<Bookmark>("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ articleId }),
  });
  return data;
}

export async function removeBookmark(articleId: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/bookmarks/${articleId}`, {
    method: "DELETE",
  });
}

export async function fetchProgress(): Promise<{
  items: LessonProgress[];
  completedCount: number;
  totalPublishedLessons: number;
}> {
  const { data } = await apiRequest<{
    items: LessonProgress[];
    completedCount: number;
    totalPublishedLessons: number;
  }>("/api/progress");
  return data;
}

export async function setLessonProgress(lessonId: string, completed: boolean): Promise<LessonProgress> {
  const { data } = await apiRequest<LessonProgress>("/api/progress", {
    method: "POST",
    body: JSON.stringify({ lessonId, completed }),
  });
  return data;
}

export async function fetchArticleComments(articleId: string): Promise<Comment[]> {
  const { data } = await apiRequest<Comment[]>(`/api/articles/${articleId}/comments`);
  return data;
}

export async function postArticleComment(articleId: string, content: string): Promise<Comment> {
  const { data } = await apiRequest<Comment>(`/api/articles/${articleId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const { data } = await apiRequest<ContactMessage>("/api/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}
