import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import { articleCreateSchema, articleQuerySchema, articleUpdateSchema } from "@devops-academy/shared/validators";
import { created, ok } from "../lib/response.ts";
import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  listArticles,
  updateArticle,
} from "../services/article.service.ts";
import { assertSlug, assertUuid, parseJsonBody, parseQueryParams } from "../validators/index.ts";

export async function listArticlesHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const query = parseQueryParams(c, articleQuerySchema);
  const result = await listArticles({
    ...query,
    userId: user?.id,
    includeDrafts: user?.role === "admin",
  });
  return ok(c, result.items, result.meta);
}

export async function getArticleHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const slug = assertSlug(c.req.param("slug"), "article slug");
  const article = await getArticleBySlug(slug, user?.id, user?.role === "admin");
  return ok(c, article);
}

export async function createArticleHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const body = await parseJsonBody(c, articleCreateSchema);
  const article = await createArticle(user.id, body);
  return created(c, article);
}

export async function updateArticleHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "article ID");
  const body = await parseJsonBody(c, articleUpdateSchema);
  const article = await updateArticle(id, body);
  return ok(c, article);
}

export async function deleteArticleHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "article ID");
  await deleteArticle(id);
  return ok(c, { deleted: true });
}
