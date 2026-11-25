import { and, asc, eq, inArray } from "drizzle-orm";
import { db, learningPaths, lessonProgress, lessons } from "@devops-academy/database";
import type { ArticleStatus, Difficulty, LearningPath, Lesson } from "@devops-academy/shared";
import { badRequest, notFound } from "../lib/errors.ts";
import { slugify } from "../lib/slug.ts";

export function toLessonDto(row: typeof lessons.$inferSelect, completed?: boolean): Lesson {
  return {
    id: row.id,
    pathId: row.pathId,
    title: row.title,
    slug: row.slug,
    description: row.description,
    content: row.content,
    codeExample: row.codeExample ?? null,
    practicalInstructions: row.practicalInstructions ?? null,
    orderIndex: row.orderIndex,
    durationMinutes: row.durationMinutes,
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(completed !== undefined ? { completed } : {}),
  };
}

function toLearningPathDto(
  row: typeof learningPaths.$inferSelect,
  extra?: { lessonCount?: number; completedLessons?: number; lessons?: Lesson[] },
): LearningPath {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    difficulty: row.difficulty,
    durationHours: row.durationHours,
    objectives: row.objectives,
    icon: row.icon ?? null,
    color: row.color ?? null,
    sortOrder: row.sortOrder,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(extra?.lessonCount !== undefined ? { lessonCount: extra.lessonCount } : {}),
    ...(extra?.completedLessons !== undefined ? { completedLessons: extra.completedLessons } : {}),
    ...(extra?.lessons !== undefined ? { lessons: extra.lessons } : {}),
  };
}

export async function listLearningPaths(options?: {
  userId?: string;
  includeDrafts?: boolean;
  difficulty?: Difficulty;
}): Promise<LearningPath[]> {
  const conditions = [];
  if (!options?.includeDrafts) {
    conditions.push(eq(learningPaths.status, "published"));
  }
  if (options?.difficulty) {
    conditions.push(eq(learningPaths.difficulty, options.difficulty));
  }

  const paths = await db
    .select()
    .from(learningPaths)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(learningPaths.sortOrder), asc(learningPaths.createdAt));

  if (paths.length === 0) return [];

  const pathIds = paths.map((p) => p.id);
  const allLessons = await db
    .select({ id: lessons.id, pathId: lessons.pathId, isPublished: lessons.isPublished })
    .from(lessons)
    .where(
      options?.includeDrafts
        ? inArray(lessons.pathId, pathIds)
        : and(inArray(lessons.pathId, pathIds), eq(lessons.isPublished, true)),
    );

  const completedSet = new Set<string>();
  if (options?.userId && allLessons.length > 0) {
    const lessonIds = allLessons.map((l) => l.id);
    const progressRows = await db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, options.userId),
          eq(lessonProgress.completed, true),
          inArray(lessonProgress.lessonId, lessonIds),
        ),
      );
    for (const row of progressRows) {
      completedSet.add(row.lessonId);
    }
  }

  return paths.map((path) => {
    const pathLessons = allLessons.filter((l) => l.pathId === path.id);
    const completedLessons = options?.userId
      ? pathLessons.filter((l) => completedSet.has(l.id)).length
      : undefined;
    return toLearningPathDto(path, {
      lessonCount: pathLessons.length,
      completedLessons,
    });
  });
}

export async function getLearningPathBySlug(
  slug: string,
  options?: { userId?: string; includeDrafts?: boolean },
): Promise<LearningPath> {
  const conditions = [eq(learningPaths.slug, slug)];
  if (!options?.includeDrafts) {
    conditions.push(eq(learningPaths.status, "published"));
  }

  const [path] = await db
    .select()
    .from(learningPaths)
    .where(and(...conditions))
    .limit(1);

  if (!path) {
    throw notFound("Learning path not found");
  }

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(
      options?.includeDrafts
        ? eq(lessons.pathId, path.id)
        : and(eq(lessons.pathId, path.id), eq(lessons.isPublished, true)),
    )
    .orderBy(asc(lessons.orderIndex));

  const completedSet = new Set<string>();
  if (options?.userId && lessonRows.length > 0) {
    const lessonIds = lessonRows.map((l) => l.id);
    const progressRows = await db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, options.userId),
          eq(lessonProgress.completed, true),
          inArray(lessonProgress.lessonId, lessonIds),
        ),
      );
    for (const row of progressRows) {
      completedSet.add(row.lessonId);
    }
  }

  const lessonDtos = lessonRows.map((row) =>
    toLessonDto(row, options?.userId ? completedSet.has(row.id) : false),
  );

  return toLearningPathDto(path, {
    lessonCount: lessonDtos.length,
    completedLessons: options?.userId ? lessonDtos.filter((l) => l.completed).length : undefined,
    lessons: lessonDtos,
  });
}

export async function createLearningPath(input: {
  title: string;
  slug?: string;
  description: string;
  difficulty: Difficulty;
  durationHours: number;
  objectives: string[];
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  status: ArticleStatus;
}): Promise<LearningPath> {
  const finalSlug = input.slug ?? slugify(input.title);
  if (finalSlug.length < 3) {
    throw badRequest("Slug must be at least 3 characters");
  }

  const [created] = await db
    .insert(learningPaths)
    .values({
      title: input.title,
      slug: finalSlug,
      description: input.description,
      difficulty: input.difficulty,
      durationHours: input.durationHours,
      objectives: input.objectives,
      icon: input.icon ?? null,
      color: input.color ?? null,
      sortOrder: input.sortOrder,
      status: input.status,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create learning path");
  }

  return toLearningPathDto(created, { lessonCount: 0, lessons: [] });
}

export async function updateLearningPath(
  id: string,
  input: Partial<{
    title: string;
    slug: string;
    description: string;
    difficulty: Difficulty;
    durationHours: number;
    objectives: string[];
    icon: string | null;
    color: string | null;
    sortOrder: number;
    status: ArticleStatus;
  }>,
): Promise<LearningPath> {
  const [updated] = await db
    .update(learningPaths)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(learningPaths.id, id))
    .returning();

  if (!updated) {
    throw notFound("Learning path not found");
  }

  return toLearningPathDto(updated);
}

export async function deleteLearningPath(id: string): Promise<void> {
  const [deleted] = await db
    .delete(learningPaths)
    .where(eq(learningPaths.id, id))
    .returning({ id: learningPaths.id });

  if (!deleted) {
    throw notFound("Learning path not found");
  }
}
