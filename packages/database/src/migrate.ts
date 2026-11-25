import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.ts";

const migrationsFolder = fileURLToPath(new URL("../migrations", import.meta.url));

try {
  await migrate(db, { migrationsFolder });
  console.log("Database migrations completed successfully.");
} finally {
  await pool.end();
}
