import { Hono } from "hono";
import {
  getStatsHandler,
  listArticlesAdminHandler,
  listCommentsAdminHandler,
  listPathsAdminHandler,
  listUsersAdminHandler,
  updateUserAdminHandler,
} from "../controllers/admin.controller.ts";
import {
  deleteContactHandler,
  listContactHandler,
  markContactReadHandler,
} from "../controllers/contact.controller.ts";
import { requireAdmin, requireAuth } from "../middleware/auth.ts";

export const adminRoutes = new Hono();

adminRoutes.use("*", requireAuth, requireAdmin);
adminRoutes.get("/stats", getStatsHandler);
adminRoutes.get("/users", listUsersAdminHandler);
adminRoutes.patch("/users/:id", updateUserAdminHandler);
adminRoutes.get("/articles", listArticlesAdminHandler);
adminRoutes.get("/paths", listPathsAdminHandler);
adminRoutes.get("/comments", listCommentsAdminHandler);
adminRoutes.get("/contact", listContactHandler);
adminRoutes.patch("/contact/:id", markContactReadHandler);
adminRoutes.delete("/contact/:id", deleteContactHandler);
