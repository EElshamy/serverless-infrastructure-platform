import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { articles, bookmarks, categories, db, users } from "@devops-academy/database";
import type { Article, ArticleStatus, PaginationMeta } from "@devops-academy/shared";
import { badRequest, notFound } from "../lib/errors.ts";
import { estimateReadingTime, serializeDate, slugify } from "../lib/slug.ts";

export interface ArticleQueryOptions {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  featured?: boolean;
  status?: ArticleStatus;
  sort: "newest" | "oldest" | "popular" | "title";
  userId?: string;
  includeDrafts?: boolean;
}

type ArticleRow = typeof articles.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;
type AuthorRow = { id: string; name: string; avatarUrl: string | null };

export function toArticleDto(
  row: ArticleRow,
  category: CategoryRow | null,
  author: AuthorRow | null,
  bookmarked?: boolean,
): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    content: row.content,
    coverImage: row.coverImage ?? null,
    status: row.status,
    featured: row.featured,
    readingTime: row.readingTime,
    views: row.views,
    publishedAt: serializeDate(row.publishedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    category: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon ?? null,
          color: category.color ?? null,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        }
      : null,
    author: author
      ? {
          id: author.id,
          name: author.name,
          avatarUrl: author.avatarUrl ?? null,
        }
      : null,
    ...(bookmarked !== undefined ? { bookmarked } : {}),
  };
}

export async function listArticles(
  options: ArticleQueryOptions,
): Promise<{ items: Article[]; meta: PaginationMeta }> {
  const conditions: SQL[] = [];

  if (!options.includeDrafts) {
    conditions.push(eq(articles.status, "published"));
  } else if (options.status) {
    conditions.push(eq(articles.status, options.status));
  }

  if (options.featured !== undefined) {
    conditions.push(eq(articles.featured, options.featured));
  }

  if (options.category) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, options.category))
      .limit(1);
    if (!cat) {
      return {
        items: [],
        meta: { page: options.page, limit: options.limit, total: 0, totalPages: 0 },
      };
    }
    conditions.push(eq(articles.categoryId, cat.id));
  }

  if (options.q) {
    const pattern = `%${options.q}%`;
    const searchCond = or(
      ilike(articles.title, pattern),
      ilike(articles.description, pattern),
      ilike(articles.content, pattern),
    );
    if (searchCond) conditions.push(searchCond);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(articles)
    .where(whereClause);

  const total = countResult?.total ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / options.limit);
  const offset = (options.page - 1) * options.limit;

  const orderBy =
    options.sort === "oldest"
      ? [asc(articles.publishedAt), asc(articles.createdAt)]
      : options.sort === "popular"
        ? [desc(articles.views), desc(articles.publishedAt)]
        : options.sort === "title"
          ? [asc(articles.title)]
          : [desc(articles.publishedAt), desc(articles.createdAt)];

  const rows = await db
    .select({
      article: articles,
      category: categories,
      author: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(options.limit)
    .offset(offset);

  let bookmarkedIds = new Set<string>();
  if (options.userId && rows.length > 0) {
    const ids = rows.map((row) => row.article.id);
    const bookmarkRows = await db
      .select({ articleId: bookmarks.articleId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, options.userId), inArray(bookmarks.articleId, ids)));
    bookmarkedIds = new Set(bookmarkRows.map((b) => b.articleId));
  }

  const items = rows.map((row) =>
    toArticleDto(
      row.article,
      row.category,
      row.author,
      options.userId ? bookmarkedIds.has(row.article.id) : false,
    ),
  );

  return {
    items,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
    },
  };
}

export async function getArticleBySlug(
  slug: string,
  userId?: string,
  includeDrafts = false,
): Promise<Article> {
  const conditions: SQL[] = [eq(articles.slug, slug)];
  if (!includeDrafts) {
    conditions.push(eq(articles.status, "published"));
  }

  const [row] = await db
    .select({
      article: articles,
      category: categories,
      author: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(...conditions))
    .limit(1);

  if (!row) {
    throw notFound("Article not found");
  }

  let updatedArticle = row.article;
  if (row.article.status === "published") {
    const [incremented] = await db
      .update(articles)
      .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.id, row.article.id))
      .returning();
    if (incremented) updatedArticle = incremented;
  }

  let isBookmarked = false;
  if (userId) {
    const [bookmark] = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, row.article.id)))
      .limit(1);
    isBookmarked = Boolean(bookmark);
  }

  return toArticleDto(updatedArticle, row.category, row.author, isBookmarked);
}

export async function createArticle(
  authorId: string,
  input: {
    title: string;
    slug?: string;
    description: string;
    content: string;
    coverImage?: string | null;
    categoryId: string;
    status: ArticleStatus;
    featured: boolean;
    readingTime?: number;
    publishedAt?: string | null;
  },
): Promise<Article> {
  const [cat] = await db.select().from(categories).where(eq(categories.id, input.categoryId)).limit(1);
  if (!cat) {
    throw badRequest("Selected category does not exist");
  }

  const finalSlug = input.slug ?? slugify(input.title);
  if (finalSlug.length < 5) {
    throw badRequest("Slug must be at least 5 characters");
  }

  const publishedAt =
    input.publishedAt !== undefined
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : null
      : input.status === "published"
        ? new Date()
        : null;

  const [created] = await db
    .insert(articles)
    .values({
      title: input.title,
      slug: finalSlug,
      description: input.description,
      content: input.content,
      coverImage: input.coverImage ?? `/covers/${cat.slug}.svg`,
      authorId,
      categoryId: input.categoryId,
      status: input.status,
      featured: input.featured,
      readingTime: input.readingTime ?? estimateReadingTime(input.content),
      publishedAt,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create article");
  }

  const [author] = await db
    .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, authorId))
    .limit(1);

  return toArticleDto(created, cat, author ?? null, false);
}

export async function updateArticle(
  id: string,
  input: Partial<{
    title: string;
    slug: string;
    description: string;
    content: string;
    coverImage: string | null;
    categoryId: string;
    status: ArticleStatus;
    featured: boolean;
    readingTime: number;
    publishedAt: string | null;
  }>,
): Promise<Article> {
  const [existing] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!existing) {
    throw notFound("Article not found");
  }

  if (input.categoryId) {
    const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, input.categoryId)).limit(1);
    if (!cat) {
      throw badRequest("Selected category does not exist");
    }
  }

  let publishedAtUpdate: Date | null | undefined;
  if (input.publishedAt !== undefined) {
    publishedAtUpdate = input.publishedAt ? new Date(input.publishedAt) : null;
  } else if (input.status === "published" && !existing.publishedAt) {
    publishedAtUpdate = new Date();
  }

  const [updated] = await db
    .update(articles)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.featured !== undefined ? { featured: input.featured } : {}),
      ...(input.readingTime !== undefined
        ? { readingTime: input.readingTime }
        : input.content !== undefined
          ? { readingTime: estimateReadingTime(input.content) }
          : {}),
      ...(publishedAtUpdate !== undefined ? { publishedAt: publishedAtUpdate } : {}),
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id))
    .returning();

  if (!updated) {
    throw notFound("Article not found");
  }

  const [row] = await db
    .select({
      category: categories,
      author: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, updated.id))
    .limit(1);

  return toArticleDto(updated, row?.category ?? null, row?.author ?? null);
}

export async function deleteArticle(id: string): Promise<void> {
  const [deleted] = await db.delete(articles).where(eq(articles.id, id)).returning({ id: articles.id });
  if (!deleted) {
    throw notFound("Article not found");
  }
}
