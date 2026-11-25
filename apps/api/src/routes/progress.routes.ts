import { Hono } from "hono";
import { getProgressHandler, updateProgressHandler } from "../controllers/lesson.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

export const progressRoutes = new Hono();

progressRoutes.use("*", requireAuth);
progressRoutes.get("/", getProgressHandler);
progressRoutes.post("/", updateProgressHandler);
