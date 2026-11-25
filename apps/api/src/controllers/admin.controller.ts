import type { Context } from "hono";
import { userUpdateSchema } from "@devops-academy/shared/validators";
import { ok } from "../lib/response.ts";
import { getPlatformStats, listUsersAdmin, updateUserAdmin } from "../services/admin.service.ts";
import { listArticles } from "../services/article.service.ts";
import { listAllCommentsAdmin } from "../services/comment.service.ts";
import { listLearningPaths } from "../services/learning-path.service.ts";
import { assertUuid, parseJsonBody } from "../validators/index.ts";

export async function getStatsHandler(c: Context) {
  const stats = await getPlatformStats();
  return ok(c, stats);
}

export async function listUsersAdminHandler(c: Context) {
  const items = await listUsersAdmin();
  return ok(c, items);
}

export async function updateUserAdminHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "user ID");
  const body = await parseJsonBody(c, userUpdateSchema);
  const user = await updateUserAdmin(id, body);
  return ok(c, user);
}

export async function listArticlesAdminHandler(c: Context) {
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 50);
  const q = c.req.query("q");
  const result = await listArticles({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 50,
    q: q || undefined,
    sort: "newest",
    includeDrafts: true,
  });
  return ok(c, result.items, result.meta);
}

export async function listPathsAdminHandler(c: Context) {
  const paths = await listLearningPaths({ includeDrafts: true });
  return ok(c, paths);
}

export async function listCommentsAdminHandler(c: Context) {
  const items = await listAllCommentsAdmin();
  return ok(c, items);
}
