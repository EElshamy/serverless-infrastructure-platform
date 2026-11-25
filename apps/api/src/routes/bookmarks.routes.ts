import { Hono } from "hono";
import {
  createBookmarkHandler,
  deleteBookmarkHandler,
  listBookmarksHandler,
} from "../controllers/bookmark.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

export const bookmarkRoutes = new Hono();

bookmarkRoutes.use("*", requireAuth);
bookmarkRoutes.get("/", listBookmarksHandler);
bookmarkRoutes.post("/", createBookmarkHandler);
bookmarkRoutes.delete("/:articleId", deleteBookmarkHandler);
