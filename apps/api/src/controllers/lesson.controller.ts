import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import {
  lessonCreateSchema,
  lessonUpdateSchema,
  progressCreateSchema,
} from "@devops-academy/shared/validators";
import { created, ok } from "../lib/response.ts";
import {
  createLesson,
  deleteLesson,
  getLessonById,
  getLessonByPathAndSlug,
  listUserProgress,
  updateLesson,
  upsertLessonProgress,
} from "../services/lesson.service.ts";
import { assertSlug, assertUuid, parseJsonBody } from "../validators/index.ts";

export async function getLessonByIdHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const id = assertUuid(c.req.param("id"), "lesson ID");
  const lesson = await getLessonById(id, {
    userId: user?.id,
    includeUnpublished: user?.role === "admin",
  });
  return ok(c, lesson);
}

export async function getLessonBySlugHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const pathSlug = assertSlug(c.req.param("slug"), "learning path slug");
  const lessonSlug = assertSlug(c.req.param("lessonSlug"), "lesson slug");
  const result = await getLessonByPathAndSlug(pathSlug, lessonSlug, {
    userId: user?.id,
    includeUnpublished: user?.role === "admin",
  });
  return ok(c, result);
}

export async function createLessonHandler(c: Context) {
  const body = await parseJsonBody(c, lessonCreateSchema);
  const lesson = await createLesson(body);
  return created(c, lesson);
}

export async function updateLessonHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "lesson ID");
  const body = await parseJsonBody(c, lessonUpdateSchema);
  const lesson = await updateLesson(id, body);
  return ok(c, lesson);
}

export async function deleteLessonHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "lesson ID");
  await deleteLesson(id);
  return ok(c, { deleted: true });
}

export async function getProgressHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const progress = await listUserProgress(user.id);
  return ok(c, progress);
}

export async function updateProgressHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const body = await parseJsonBody(c, progressCreateSchema);
  const record = await upsertLessonProgress(user.id, body.lessonId, body.completed);
  return ok(c, record);
}
