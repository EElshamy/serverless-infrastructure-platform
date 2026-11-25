import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import { bookmarkCreateSchema } from "@devops-academy/shared/validators";
import { created, ok } from "../lib/response.ts";
import { addBookmark, listUserBookmarks, removeBookmark } from "../services/bookmark.service.ts";
import { assertUuid, parseJsonBody } from "../validators/index.ts";

export async function listBookmarksHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const items = await listUserBookmarks(user.id);
  return ok(c, items);
}

export async function createBookmarkHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const body = await parseJsonBody(c, bookmarkCreateSchema);
  const bookmark = await addBookmark(user.id, body.articleId);
  return created(c, bookmark);
}

export async function deleteBookmarkHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const articleId = assertUuid(c.req.param("articleId"), "article ID");
  await removeBookmark(user.id, articleId);
  return ok(c, { deleted: true });
}
