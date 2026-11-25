import { Hono } from "hono";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from "../controllers/category.controller.ts";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.ts";

export const categoryRoutes = new Hono();

categoryRoutes.get("/", optionalAuth, listCategoriesHandler);
categoryRoutes.get("/:slug", getCategoryHandler);
categoryRoutes.post("/", requireAuth, requireAdmin, createCategoryHandler);
categoryRoutes.patch("/:id", requireAuth, requireAdmin, updateCategoryHandler);
categoryRoutes.delete("/:id", requireAuth, requireAdmin, deleteCategoryHandler);
