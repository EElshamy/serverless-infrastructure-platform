import { Hono } from "hono";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  registerHandler,
  updateMeHandler,
} from "../controllers/auth.controller.ts";
import { optionalAuth, requireAuth } from "../middleware/auth.ts";
import { rateLimit } from "../middleware/rate-limit.ts";

export const authRoutes = new Hono();

authRoutes.post("/register", rateLimit("auth-register"), registerHandler);
authRoutes.post("/login", rateLimit("auth-login"), loginHandler);
authRoutes.post("/logout", optionalAuth, logoutHandler);
authRoutes.get("/me", requireAuth, meHandler);
authRoutes.patch("/me", requireAuth, updateMeHandler);
