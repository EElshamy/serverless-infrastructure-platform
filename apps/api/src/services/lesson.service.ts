import { and, asc, eq } from "drizzle-orm";
import { db, learningPaths, lessonProgress, lessons } from "@devops-academy/database";
import type { Lesson, LessonProgress } from "@devops-academy/shared";
import { badRequest, notFound } from "../lib/errors.ts";
import { serializeDate, slugify } from "../lib/slug.ts";
import { toLessonDto } from "./learning-path.service.ts";

function toProgressDto(row: typeof lessonProgress.$inferSelect): LessonProgress {
  return {
    id: row.id,
    lessonId: row.lessonId,
    completed: row.completed,
    completedAt: serializeDate(row.completedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getLessonById(
  id: string,
  options?: { userId?: string; includeUnpublished?: boolean },
): Promise<Lesson> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  if (!row || (!options?.includeUnpublished && !row.isPublished)) {
    throw notFound("Lesson not found");
  }

  let completed = false;
  if (options?.userId) {
    const [progress] = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, options.userId), eq(lessonProgress.lessonId, row.id)))
      .limit(1);
    completed = Boolean(progress?.completed);
  }

  return toLessonDto(row, completed);
}

export async function getLessonByPathAndSlug(
  pathSlug: string,
  lessonSlug: string,
  options?: { userId?: string; includeUnpublished?: boolean },
): Promise<{ path: typeof learningPaths.$inferSelect; lesson: Lesson; siblings: Lesson[] }> {
  const [path] = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.slug, pathSlug))
    .limit(1);

  if (!path || (!options?.includeUnpublished && path.status !== "published")) {
    throw notFound("Learning path not found");
  }

  const siblingRows = await db
    .select()
    .from(lessons)
    .where(
      options?.includeUnpublished
        ? eq(lessons.pathId, path.id)
        : and(eq(lessons.pathId, path.id), eq(lessons.isPublished, true)),
    )
    .orderBy(asc(lessons.orderIndex));

  const target = siblingRows.find((l) => l.slug === lessonSlug);
  if (!target) {
    throw notFound("Lesson not found");
  }

  const completedSet = new Set<string>();
  if (options?.userId) {
    const progressRows = await db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, options.userId), eq(lessonProgress.completed, true)));
    for (const p of progressRows) {
      completedSet.add(p.lessonId);
    }
  }

  return {
    path,
    lesson: toLessonDto(target, options?.userId ? completedSet.has(target.id) : false),
    siblings: siblingRows.map((l) => toLessonDto(l, options?.userId ? completedSet.has(l.id) : false)),
  };
}

export async function createLesson(input: {
  pathId: string;
  title: string;
  slug?: string;
  description: string;
  content: string;
  codeExample?: string | null;
  practicalInstructions?: string | null;
  orderIndex: number;
  durationMinutes: number;
  isPublished: boolean;
}): Promise<Lesson> {
  const [path] = await db.select({ id: learningPaths.id }).from(learningPaths).where(eq(learningPaths.id, input.pathId)).limit(1);
  if (!path) {
    throw badRequest("Selected learning path does not exist");
  }

  const finalSlug = input.slug ?? slugify(input.title);
  if (finalSlug.length < 3) {
    throw badRequest("Slug must be at least 3 characters");
  }

  const [created] = await db
    .insert(lessons)
    .values({
      pathId: input.pathId,
      title: input.title,
      slug: finalSlug,
      description: input.description,
      content: input.content,
      codeExample: input.codeExample ?? null,
      practicalInstructions: input.practicalInstructions ?? null,
      orderIndex: input.orderIndex,
      durationMinutes: input.durationMinutes,
      isPublished: input.isPublished,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create lesson");
  }

  return toLessonDto(created);
}

export async function updateLesson(
  id: string,
  input: Partial<{
    pathId: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    codeExample: string | null;
    practicalInstructions: string | null;
    orderIndex: number;
    durationMinutes: number;
    isPublished: boolean;
  }>,
): Promise<Lesson> {
  const [updated] = await db
    .update(lessons)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, id))
    .returning();

  if (!updated) {
    throw notFound("Lesson not found");
  }

  return toLessonDto(updated);
}

export async function deleteLesson(id: string): Promise<void> {
  const [deleted] = await db.delete(lessons).where(eq(lessons.id, id)).returning({ id: lessons.id });
  if (!deleted) {
    throw notFound("Lesson not found");
  }
}

export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<LessonProgress> {
  const [lesson] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lesson) {
    throw notFound("Lesson not found");
  }

  const now = new Date();
  const [row] = await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      completed,
      completedAt: completed ? now : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        completed,
        completedAt: completed ? now : null,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error("Failed to update lesson progress");
  }

  return toProgressDto(row);
}

export async function listUserProgress(userId: string): Promise<{
  items: LessonProgress[];
  completedCount: number;
  totalPublishedLessons: number;
}> {
  const rows = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  const publishedLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.isPublished, true));

  const items = rows.map(toProgressDto);
  return {
    items,
    completedCount: items.filter((item) => item.completed).length,
    totalPublishedLessons: publishedLessons.length,
  };
}
