import { serve } from "@hono/node-server";
import { pool } from "@devops-academy/database";
import { createApp } from "./app.ts";
import { env } from "./lib/env.ts";

const app = createApp();

const server = serve(
  {
    fetch: app.fetch,
    port: env.apiPort,
  },
  (info) => {
    console.log(`DevOps Academy API listening on http://localhost:${info.port}`);
  },
);

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down API server...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
