import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@devops-academy/database";
import { ok } from "../lib/response.ts";

export const healthRoutes = new Hono();

healthRoutes.get("/", async (c) => {
  await db.execute(sql`SELECT 1`);
  return ok(c, {
    status: "ok",
    service: "devops-academy-api",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});
