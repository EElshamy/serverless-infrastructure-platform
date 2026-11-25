import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import {
  difficultySchema,
  learningPathCreateSchema,
  learningPathUpdateSchema,
} from "@devops-academy/shared/validators";
import { badRequest } from "../lib/errors.ts";
import { created, ok } from "../lib/response.ts";
import {
  createLearningPath,
  deleteLearningPath,
  getLearningPathBySlug,
  listLearningPaths,
  updateLearningPath,
} from "../services/learning-path.service.ts";
import { assertSlug, assertUuid, parseJsonBody } from "../validators/index.ts";

export async function listPathsHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const difficultyParam = c.req.query("difficulty");
  let difficulty: "beginner" | "intermediate" | "advanced" | undefined;
  if (difficultyParam) {
    const parsed = difficultySchema.safeParse(difficultyParam);
    if (!parsed.success) {
      throw badRequest("Invalid difficulty filter");
    }
    difficulty = parsed.data;
  }

  const paths = await listLearningPaths({
    userId: user?.id,
    includeDrafts: user?.role === "admin",
    difficulty,
  });
  return ok(c, paths);
}

export async function getPathHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const slug = assertSlug(c.req.param("slug"), "learning path slug");
  const path = await getLearningPathBySlug(slug, {
    userId: user?.id,
    includeDrafts: user?.role === "admin",
  });
  return ok(c, path);
}

export async function createPathHandler(c: Context) {
  const body = await parseJsonBody(c, learningPathCreateSchema);
  const path = await createLearningPath(body);
  return created(c, path);
}

export async function updatePathHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "learning path ID");
  const body = await parseJsonBody(c, learningPathUpdateSchema);
  const path = await updateLearningPath(id, body);
  return ok(c, path);
}

export async function deletePathHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "learning path ID");
  await deleteLearningPath(id);
  return ok(c, { deleted: true });
}
