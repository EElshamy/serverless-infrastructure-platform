import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import { commentCreateSchema } from "@devops-academy/shared/validators";
import { z } from "zod";
import { created, ok } from "../lib/response.ts";
import {
  createComment,
  deleteComment,
  listCommentsForArticle,
  moderateComment,
} from "../services/comment.service.ts";
import { assertUuid, parseJsonBody } from "../validators/index.ts";

const moderateSchema = z.object({
  isApproved: z.boolean(),
});

export async function listArticleCommentsHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const articleId = assertUuid(c.req.param("id"), "article ID");
  const items = await listCommentsForArticle(articleId, user?.role === "admin");
  return ok(c, items);
}

export async function createArticleCommentHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const articleId = assertUuid(c.req.param("id"), "article ID");
  const body = await parseJsonBody(c, commentCreateSchema);
  const comment = await createComment(articleId, user.id, body.content);
  return created(c, comment);
}

export async function moderateCommentHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "comment ID");
  const body = await parseJsonBody(c, moderateSchema);
  const updated = await moderateComment(id, body.isApproved);
  return ok(c, updated);
}

export async function deleteCommentHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const id = assertUuid(c.req.param("id"), "comment ID");
  await deleteComment(id, user);
  return ok(c, { deleted: true });
}
