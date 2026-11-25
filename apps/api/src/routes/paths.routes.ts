import { Hono } from "hono";
import {
  createPathHandler,
  deletePathHandler,
  getPathHandler,
  listPathsHandler,
  updatePathHandler,
} from "../controllers/learning-path.controller.ts";
import { getLessonBySlugHandler } from "../controllers/lesson.controller.ts";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.ts";

export const pathRoutes = new Hono();

pathRoutes.get("/", optionalAuth, listPathsHandler);
pathRoutes.get("/:slug", optionalAuth, getPathHandler);
pathRoutes.get("/:slug/lessons/:lessonSlug", optionalAuth, getLessonBySlugHandler);
pathRoutes.post("/", requireAuth, requireAdmin, createPathHandler);
pathRoutes.patch("/:id", requireAuth, requireAdmin, updatePathHandler);
pathRoutes.delete("/:id", requireAuth, requireAdmin, deletePathHandler);
