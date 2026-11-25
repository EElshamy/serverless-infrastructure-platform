import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { db, pool } from "./src/client.ts";
import { articles, bookmarks, categories, comments, contactMessages, learningPaths, lessonProgress, lessons, users } from "./schema/index.ts";
import { seedArticles } from "./seed-data/articles.ts";
import { seedCategories } from "./seed-data/categories.ts";
import { seedPaths } from "./seed-data/paths.ts";

config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to run the seed`);
  return value;
}

function readingTime(content: string): number {
  return Math.max(3, Math.ceil(content.trim().split(/\s+/).length / 180));
}

async function count(table: typeof users | typeof articles | typeof categories | typeof learningPaths | typeof lessons | typeof bookmarks | typeof comments | typeof contactMessages | typeof lessonProgress) {
  const [row] = await db.select({ value: sql<number>`count(*)::int` }).from(table);
  return row?.value ?? 0;
}

async function main() {
  const adminEmail = requiredEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const adminPassword = requiredEnv("SEED_ADMIN_PASSWORD");
  const adminName = process.env.SEED_ADMIN_NAME ?? "Academy Admin";
  const studentPassword = process.env.SEED_USER_PASSWORD ?? "Student!Local2026";

  console.log("Seeding DevOps Academy database...");

  const adminHash = await bcrypt.hash(adminPassword, 12);
  await db
    .insert(users)
    .values({
      name: adminName,
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
      bio: "Platform administrator and DevOps instructor.",
    })
    .onConflictDoNothing({ target: users.email });

  const studentHash = await bcrypt.hash(studentPassword, 12);
  await db
    .insert(users)
    .values([
      {
        name: "Sara Mohamed",
        email: "sara@devopsacademy.local",
        passwordHash: studentHash,
        role: "user",
        bio: "Backend engineer learning Kubernetes and observability.",
      },
      {
        name: "Omar Khaled",
        email: "omar@devopsacademy.local",
        passwordHash: studentHash,
        role: "user",
        bio: "Systems administrator focused on Linux hardening and automation.",
      },
    ])
    .onConflictDoNothing({ target: users.email });

  const allUsers = await db.select().from(users);
  const admin = allUsers.find((user) => user.email === adminEmail);
  const sara = allUsers.find((user) => user.email === "sara@devopsacademy.local");
  const omar = allUsers.find((user) => user.email === "omar@devopsacademy.local");
  if (!admin || !sara || !omar) throw new Error("Seed users were not created correctly");

  const categoryMap = new Map<string, string>();
  for (const category of seedCategories) {
    await db.insert(categories).values(category).onConflictDoNothing({ target: categories.slug });
    const [row] = await db.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);
    if (!row) throw new Error(`Category ${category.slug} was not created`);
    categoryMap.set(category.slug, row.id);
  }

  for (const [index, article] of seedArticles.entries()) {
    const categoryId = categoryMap.get(article.categorySlug);
    if (!categoryId) throw new Error(`Missing category for article ${article.slug}`);
    await db
      .insert(articles)
      .values({
        title: article.title,
        slug: article.slug,
        description: article.description,
        content: article.content,
        coverImage: `/covers/${article.categorySlug}.svg`,
        authorId: admin.id,
        categoryId,
        status: "published",
        featured: article.featured,
        readingTime: readingTime(article.content),
        views: 1200 - index * 37,
        publishedAt: new Date(Date.now() - index * 86_400_000),
      })
      .onConflictDoNothing({ target: articles.slug });
  }

  for (const path of seedPaths) {
    await db
      .insert(learningPaths)
      .values({
        title: path.title,
        slug: path.slug,
        description: path.description,
        difficulty: path.difficulty,
        durationHours: path.durationHours,
        objectives: path.objectives,
        icon: path.icon,
        color: path.color,
        sortOrder: path.sortOrder,
        status: "published",
      })
      .onConflictDoNothing({ target: learningPaths.slug });

    const [pathRow] = await db.select().from(learningPaths).where(eq(learningPaths.slug, path.slug)).limit(1);
    if (!pathRow) throw new Error(`Learning path ${path.slug} was not created`);

    for (const item of path.lessons) {
      await db
        .insert(lessons)
        .values({
          pathId: pathRow.id,
          title: item.title,
          slug: item.slug,
          description: item.description,
          content: item.content,
          codeExample: item.codeExample,
          practicalInstructions: item.practicalInstructions,
          orderIndex: path.lessons.indexOf(item),
          durationMinutes: item.durationMinutes,
          isPublished: true,
        })
        .onConflictDoNothing({ target: [lessons.pathId, lessons.slug] });
    }
  }

  const seededArticles = await db.select().from(articles);
  const seededLessons = await db.select().from(lessons);

  for (const article of seededArticles.slice(0, 3)) {
    const exists = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, sara.id), eq(bookmarks.articleId, article.id)))
      .limit(1);
    if (!exists.length) {
      await db.insert(bookmarks).values({ userId: sara.id, articleId: article.id });
    }
  }

  for (const article of seededArticles.slice(1, 3)) {
    const exists = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, omar.id), eq(bookmarks.articleId, article.id)))
      .limit(1);
    if (!exists.length) {
      await db.insert(bookmarks).values({ userId: omar.id, articleId: article.id });
    }
  }

  for (const [index, lesson] of seededLessons.slice(0, 4).entries()) {
    await db
      .insert(lessonProgress)
      .values({
        userId: sara.id,
        lessonId: lesson.id,
        completed: index < 3,
        completedAt: index < 3 ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          completed: index < 3,
          completedAt: index < 3 ? new Date() : null,
          updatedAt: new Date(),
        },
      });
  }

  if ((await count(comments)) === 0 && seededArticles.length >= 3) {
    await db.insert(comments).values([
      {
        articleId: seededArticles[0]!.id,
        userId: sara.id,
        content: "The four feedback loops gave our team a clear way to discuss delivery problems. We started measuring lead time the same week.",
      },
      {
        articleId: seededArticles[1]!.id,
        userId: omar.id,
        content: "Using SIGTERM before SIGKILL solved the connection drops we used to see during deployments.",
      },
      {
        articleId: seededArticles[2]!.id,
        userId: sara.id,
        content: "Short-lived branches and squash merges made our review queue much easier to manage.",
      },
    ]);
  }

  if ((await count(contactMessages)) === 0) {
    await db.insert(contactMessages).values([
      {
        name: "Lina Hassan",
        email: "lina@example.com",
        subject: "Question about the Docker path",
        message: "Do you recommend starting with the image layers lesson before using Docker Compose in a team project?",
      },
      {
        name: "Michael Adel",
        email: "michael@example.com",
        subject: "Content partnership",
        message: "I teach Linux administration and would like to contribute a practical article about systemd timers.",
      },
    ]);
  }

  console.log("Seed complete with the following records:");
  console.log({
    users: await count(users),
    categories: await count(categories),
    articles: await count(articles),
    learningPaths: await count(learningPaths),
    lessons: await count(lessons),
    bookmarks: await count(bookmarks),
    progress: await count(lessonProgress),
    comments: await count(comments),
    contactMessages: await count(contactMessages),
  });
}

try {
  await main();
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
