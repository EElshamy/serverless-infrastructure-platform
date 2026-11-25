import { and, desc, eq } from "drizzle-orm";
import { articles, comments, db, users } from "@devops-academy/database";
import type { Comment, UserPublic } from "@devops-academy/shared";
import { forbidden, notFound } from "../lib/errors.ts";

function toCommentDto(
  row: typeof comments.$inferSelect,
  user: { id: string; name: string; avatarUrl: string | null } | null,
): Comment {
  return {
    id: row.id,
    articleId: row.articleId,
    content: row.content,
    isApproved: row.isApproved,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? null } : null,
  };
}

export async function listCommentsForArticle(articleId: string, includeUnapproved = false): Promise<Comment[]> {
  const conditions = [eq(comments.articleId, articleId)];
  if (!includeUnapproved) {
    conditions.push(eq(comments.isApproved, true));
  }

  const rows = await db
    .select({
      comment: comments,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(comments.createdAt));

  return rows.map((r) => toCommentDto(r.comment, r.user));
}

export async function listAllCommentsAdmin(): Promise<Array<Comment & { articleTitle?: string; articleSlug?: string }>> {
  const rows = await db
    .select({
      comment: comments,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
      article: {
        title: articles.title,
        slug: articles.slug,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(articles, eq(comments.articleId, articles.id))
    .orderBy(desc(comments.createdAt));

  return rows.map((r) => ({
    ...toCommentDto(r.comment, r.user),
    articleTitle: r.article?.title,
    articleSlug: r.article?.slug,
  }));
}

export async function createComment(articleId: string, userId: string, content: string): Promise<Comment> {
  const [article] = await db
    .select({ id: articles.id, status: articles.status })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article || article.status !== "published") {
    throw notFound("Article not found");
  }

  const [created] = await db
    .insert(comments)
    .values({
      articleId,
      userId,
      content,
      isApproved: true,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create comment");
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return toCommentDto(created, user ?? null);
}

export async function moderateComment(commentId: string, isApproved: boolean): Promise<Comment> {
  const [updated] = await db
    .update(comments)
    .set({ isApproved, updatedAt: new Date() })
    .where(eq(comments.id, commentId))
    .returning();

  if (!updated) {
    throw notFound("Comment not found");
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, updated.userId))
    .limit(1);

  return toCommentDto(updated, user ?? null);
}

export async function deleteComment(commentId: string, actor: UserPublic): Promise<void> {
  const [existing] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!existing) {
    throw notFound("Comment not found");
  }

  if (existing.userId !== actor.id && actor.role !== "admin") {
    throw forbidden("You can only delete your own comments");
  }

  await db.delete(comments).where(eq(comments.id, commentId));
}
