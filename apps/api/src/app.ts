import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./lib/env.ts";
import { fail } from "./lib/response.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { adminRoutes } from "./routes/admin.routes.ts";
import { articleRoutes } from "./routes/articles.routes.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { bookmarkRoutes } from "./routes/bookmarks.routes.ts";
import { categoryRoutes } from "./routes/categories.routes.ts";
import { commentRoutes } from "./routes/comments.routes.ts";
import { contactRoutes } from "./routes/contact.routes.ts";
import { healthRoutes } from "./routes/health.routes.ts";
import { lessonRoutes } from "./routes/lessons.routes.ts";
import { pathRoutes } from "./routes/paths.routes.ts";
import { progressRoutes } from "./routes/progress.routes.ts";

export function createApp() {
  const app = new Hono();

  app.use("*", secureHeaders());
  if (env.nodeEnv !== "test") {
    app.use("*", logger());
  }
  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return env.corsOrigins[0] ?? env.webUrl;
        return env.corsOrigins.includes(origin) ? origin : null;
      },
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.onError(errorHandler);
  app.notFound((c) => fail(c, 404, "NOT_FOUND", `Route ${c.req.method} ${c.req.path} not found`));

  app.route("/health", healthRoutes);
  app.route("/api/auth", authRoutes);
  app.route("/api/categories", categoryRoutes);
  app.route("/api/articles", articleRoutes);
  app.route("/api/paths", pathRoutes);
  app.route("/api/lessons", lessonRoutes);
  app.route("/api/bookmarks", bookmarkRoutes);
  app.route("/api/progress", progressRoutes);
  app.route("/api/comments", commentRoutes);
  app.route("/api/contact", contactRoutes);
  app.route("/api/admin", adminRoutes);

  return app;
}
