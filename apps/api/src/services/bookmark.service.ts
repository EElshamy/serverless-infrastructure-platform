import { and, desc, eq } from "drizzle-orm";
import { articles, bookmarks, categories, db, users } from "@devops-academy/database";
import type { Bookmark } from "@devops-academy/shared";
import { notFound } from "../lib/errors.ts";
import { toArticleDto } from "./article.service.ts";

export async function listUserBookmarks(userId: string): Promise<Bookmark[]> {
  const rows = await db
    .select({
      bookmark: bookmarks,
      article: articles,
      category: categories,
      author: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(bookmarks)
    .innerJoin(articles, eq(bookmarks.articleId, articles.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  return rows.map((row) => ({
    id: row.bookmark.id,
    articleId: row.bookmark.articleId,
    createdAt: row.bookmark.createdAt.toISOString(),
    article: toArticleDto(row.article, row.category, row.author, true),
  }));
}

export async function addBookmark(userId: string, articleId: string): Promise<Bookmark> {
  const [articleRow] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!articleRow) {
    throw notFound("Article not found");
  }

  await db
    .insert(bookmarks)
    .values({ userId, articleId })
    .onConflictDoNothing({ target: [bookmarks.userId, bookmarks.articleId] });

  const [bookmark] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, articleId)))
    .limit(1);

  if (!bookmark) {
    throw new Error("Failed to create bookmark");
  }

  return {
    id: bookmark.id,
    articleId: bookmark.articleId,
    createdAt: bookmark.createdAt.toISOString(),
  };
}

export async function removeBookmark(userId: string, articleId: string): Promise<void> {
  const [deleted] = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, articleId)))
    .returning({ id: bookmarks.id });

  if (!deleted) {
    throw notFound("Bookmark not found");
  }
}
