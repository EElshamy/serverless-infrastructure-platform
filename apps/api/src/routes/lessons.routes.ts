import { Hono } from "hono";
import {
  createLessonHandler,
  deleteLessonHandler,
  getLessonByIdHandler,
  updateLessonHandler,
} from "../controllers/lesson.controller.ts";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.ts";

export const lessonRoutes = new Hono();

lessonRoutes.get("/:id", optionalAuth, getLessonByIdHandler);
lessonRoutes.post("/", requireAuth, requireAdmin, createLessonHandler);
lessonRoutes.patch("/:id", requireAuth, requireAdmin, updateLessonHandler);
lessonRoutes.delete("/:id", requireAuth, requireAdmin, deleteLessonHandler);
