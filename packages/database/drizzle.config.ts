import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://devops:devops@localhost:5432/devops_academy",
  },
  strict: true,
  verbose: true,
});
