import { asc, eq, sql } from "drizzle-orm";
import { articles, categories, db } from "@devops-academy/database";
import type { Category } from "@devops-academy/shared";
import { conflict, notFound } from "../lib/errors.ts";

function toCategoryDto(row: typeof categories.$inferSelect, articleCount?: number): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon ?? null,
    color: row.color ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(articleCount !== undefined ? { articleCount } : {}),
  };
}

export async function listCategories(includeDrafts = false): Promise<Category[]> {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));

  const countsQuery = includeDrafts
    ? db
        .select({
          categoryId: articles.categoryId,
          count: sql<number>`count(*)::int`,
        })
        .from(articles)
        .groupBy(articles.categoryId)
    : db
        .select({
          categoryId: articles.categoryId,
          count: sql<number>`count(*)::int`,
        })
        .from(articles)
        .where(eq(articles.status, "published"))
        .groupBy(articles.categoryId);

  const counts = await countsQuery;
  const countMap = new Map<string, number>();
  for (const row of counts) {
    if (row.categoryId) {
      countMap.set(row.categoryId, row.count);
    }
  }

  return rows.map((row) => toCategoryDto(row, countMap.get(row.id) ?? 0));
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!row) {
    throw notFound("Category not found");
  }
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.categoryId, row.id));

  return toCategoryDto(row, countRow?.count ?? 0);
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description: string;
  icon?: string | null;
  color?: string | null;
}): Promise<Category> {
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, input.slug))
    .limit(1);

  if (existing) {
    throw conflict("A category with this slug already exists");
  }

  const [created] = await db
    .insert(categories)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description,
      icon: input.icon ?? null,
      color: input.color ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create category");
  }

  return toCategoryDto(created, 0);
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    color: string | null;
  }>,
): Promise<Category> {
  const [updated] = await db
    .update(categories)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  if (!updated) {
    throw notFound("Category not found");
  }

  return toCategoryDto(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  if (!deleted) {
    throw notFound("Category not found");
  }
}
