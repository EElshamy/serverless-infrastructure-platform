import { Hono } from "hono";
import { deleteCommentHandler, moderateCommentHandler } from "../controllers/comment.controller.ts";
import { requireAdmin, requireAuth } from "../middleware/auth.ts";

export const commentRoutes = new Hono();

commentRoutes.patch("/:id", requireAuth, requireAdmin, moderateCommentHandler);
commentRoutes.delete("/:id", requireAuth, deleteCommentHandler);
