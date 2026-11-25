import { desc, eq, sql } from "drizzle-orm";
import {
  articles,
  comments,
  contactMessages,
  db,
  learningPaths,
  lessons,
  users,
} from "@devops-academy/database";
import type { PlatformStats, Role, UserPublic } from "@devops-academy/shared";
import { notFound } from "../lib/errors.ts";
import { toUserPublic } from "../middleware/auth.ts";

async function tableCount(
  table:
    | typeof users
    | typeof articles
    | typeof learningPaths
    | typeof lessons
    | typeof comments
    | typeof contactMessages,
): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(table);
  return row?.count ?? 0;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [userCount, articleCount, pathCount, lessonCount, commentCount, contactCount] =
    await Promise.all([
      tableCount(users),
      tableCount(articles),
      tableCount(learningPaths),
      tableCount(lessons),
      tableCount(comments),
      tableCount(contactMessages),
    ]);

  return {
    users: userCount,
    articles: articleCount,
    learningPaths: pathCount,
    lessons: lessonCount,
    comments: commentCount,
    contactMessages: contactCount,
  };
}

export async function listUsersAdmin(): Promise<UserPublic[]> {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map(toUserPublic);
}

export async function updateUserAdmin(
  id: string,
  input: Partial<{ name: string; bio: string | null; avatarUrl: string | null; role: Role }>,
): Promise<UserPublic> {
  const [updated] = await db
    .update(users)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  if (!updated) {
    throw notFound("User not found");
  }

  return toUserPublic(updated);
}
