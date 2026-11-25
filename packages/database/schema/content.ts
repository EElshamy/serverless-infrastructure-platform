import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const difficultyEnum = pgEnum("difficulty_level", ["beginner", "intermediate", "advanced"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 80 }),
    color: varchar("color", { length: 30 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("categories_name_idx").on(table.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    status: contentStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    readingTime: integer("reading_time").notNull().default(5),
    views: integer("views").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("articles_slug_idx").on(table.slug),
    index("articles_category_idx").on(table.categoryId),
    index("articles_status_published_idx").on(table.status, table.publishedAt),
    index("articles_featured_idx").on(table.featured),
  ],
);

export const learningPaths = pgTable(
  "learning_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    description: text("description").notNull(),
    difficulty: difficultyEnum("difficulty").notNull().default("beginner"),
    durationHours: integer("duration_hours").notNull().default(1),
    objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
    icon: varchar("icon", { length: 80 }),
    color: varchar("color", { length: 30 }),
    sortOrder: integer("sort_order").notNull().default(0),
    status: contentStatusEnum("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("learning_paths_slug_idx").on(table.slug),
    index("learning_paths_order_idx").on(table.sortOrder),
  ],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pathId: uuid("path_id")
      .notNull()
      .references(() => learningPaths.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    codeExample: text("code_example"),
    practicalInstructions: text("practical_instructions"),
    orderIndex: integer("order_index").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(15),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lessons_path_order_idx").on(table.pathId, table.orderIndex),
    index("lessons_slug_idx").on(table.slug),
    uniqueIndex("lessons_path_slug_unique").on(table.pathId, table.slug),
    uniqueIndex("lessons_path_order_unique").on(table.pathId, table.orderIndex),
  ],
);
