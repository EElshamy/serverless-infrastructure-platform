import { Hono } from "hono";
import {
  createArticleHandler,
  deleteArticleHandler,
  getArticleHandler,
  listArticlesHandler,
  updateArticleHandler,
} from "../controllers/article.controller.ts";
import {
  createArticleCommentHandler,
  listArticleCommentsHandler,
} from "../controllers/comment.controller.ts";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.ts";

export const articleRoutes = new Hono();

articleRoutes.get("/", optionalAuth, listArticlesHandler);
articleRoutes.get("/:slug", optionalAuth, getArticleHandler);
articleRoutes.get("/:id/comments", optionalAuth, listArticleCommentsHandler);
articleRoutes.post("/:id/comments", requireAuth, createArticleCommentHandler);
articleRoutes.post("/", requireAuth, requireAdmin, createArticleHandler);
articleRoutes.patch("/:id", requireAuth, requireAdmin, updateArticleHandler);
articleRoutes.delete("/:id", requireAuth, requireAdmin, deleteArticleHandler);
