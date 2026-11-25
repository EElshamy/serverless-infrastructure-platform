import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { contactMessages, db, pool, users } from "@devops-academy/database";
import type {
  ApiSuccess,
  Article,
  Bookmark,
  Category,
  Comment,
  LearningPath,
  LessonProgress,
  PlatformStats,
  UserPublic,
} from "@devops-academy/shared";
import { createApp } from "../src/app.ts";
import { env } from "../src/lib/env.ts";
import { clearRateLimitBuckets } from "../src/middleware/rate-limit.ts";

const app = createApp();

function extractCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";
  return setCookieHeader.split(";")[0] ?? "";
}

async function readJson<T>(res: Response): Promise<ApiSuccess<T>> {
  return (await res.json()) as ApiSuccess<T>;
}

describe("DevOps Academy REST API", () => {
  const testEmail = `vitest-${Date.now()}@devopsacademy.local`;
  const testContactEmail = `contact-${Date.now()}@example.com`;
  let userCookie = "";
  let adminCookie = "";
  let firstArticleId = "";
  let firstLessonId = "";
  let createdCommentId = "";

  beforeAll(() => {
    clearRateLimitBuckets();
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, testEmail));
    await db.delete(contactMessages).where(eq(contactMessages.email, testContactEmail));
    await pool.end();
  });

  it("returns database health status", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await readJson<{ status: string; database: string }>(res);
    expect(body.success).toBe(true);
    expect(body.data.database).toBe("connected");
  });

  it("lists seeded categories, articles, and learning paths", async () => {
    const catRes = await app.request("/api/categories");
    expect(catRes.status).toBe(200);
    const catJson = await readJson<Category[]>(catRes);
    expect(catJson.data.length).toBeGreaterThanOrEqual(12);

    const artRes = await app.request("/api/articles?limit=5");
    expect(artRes.status).toBe(200);
    const artJson = await readJson<Article[]>(artRes);
    expect(artJson.data.length).toBe(5);
    expect(artJson.meta?.total).toBeGreaterThanOrEqual(13);
    firstArticleId = artJson.data[0]!.id;

    const pathRes = await app.request("/api/paths");
    expect(pathRes.status).toBe(200);
    const pathJson = await readJson<LearningPath[]>(pathRes);
    expect(pathJson.data.length).toBeGreaterThanOrEqual(10);

    const detailRes = await app.request(`/api/paths/${pathJson.data[0]!.slug}`);
    expect(detailRes.status).toBe(200);
    const detailJson = await readJson<LearningPath>(detailRes);
    expect(detailJson.data.lessons?.length).toBeGreaterThan(0);
    firstLessonId = detailJson.data.lessons![0]!.id;
  });

  it("supports registration, session auth, profile update, and logout", async () => {
    const regRes = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Learner",
        email: testEmail,
        password: "Password!2026",
      }),
    });
    expect(regRes.status).toBe(201);
    userCookie = extractCookie(regRes.headers.get("set-cookie"));
    expect(userCookie).toContain(env.cookieName);

    const meRes = await app.request("/api/auth/me", {
      headers: { Cookie: userCookie },
    });
    expect(meRes.status).toBe(200);
    const meJson = await readJson<{ user: UserPublic }>(meRes);
    expect(meJson.data.user.email).toBe(testEmail);
    expect(meJson.data.user.role).toBe("user");

    const patchRes = await app.request("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({ bio: "Testing DevOps workflows" }),
    });
    expect(patchRes.status).toBe(200);
    const patchJson = await readJson<{ user: UserPublic }>(patchRes);
    expect(patchJson.data.user.bio).toBe("Testing DevOps workflows");

    const logoutRes = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { Cookie: userCookie },
    });
    expect(logoutRes.status).toBe(200);

    const afterLogout = await app.request("/api/auth/me", {
      headers: { Cookie: userCookie },
    });
    expect(afterLogout.status).toBe(401);

    const loginRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "Password!2026",
      }),
    });
    expect(loginRes.status).toBe(200);
    userCookie = extractCookie(loginRes.headers.get("set-cookie"));
  });

  it("supports bookmarks, lesson progress, and comments for authenticated users", async () => {
    const bmCreate = await app.request("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({ articleId: firstArticleId }),
    });
    expect(bmCreate.status).toBe(201);

    const bmList = await app.request("/api/bookmarks", {
      headers: { Cookie: userCookie },
    });
    expect(bmList.status).toBe(200);
    const bmJson = await readJson<Bookmark[]>(bmList);
    expect(bmJson.data.some((b) => b.articleId === firstArticleId)).toBe(true);

    const bmDelete = await app.request(`/api/bookmarks/${firstArticleId}`, {
      method: "DELETE",
      headers: { Cookie: userCookie },
    });
    expect(bmDelete.status).toBe(200);

    const progRes = await app.request("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({ lessonId: firstLessonId, completed: true }),
    });
    expect(progRes.status).toBe(200);
    const progJson = await readJson<LessonProgress>(progRes);
    expect(progJson.data.completed).toBe(true);

    const commentRes = await app.request(`/api/articles/${firstArticleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({ content: "Automated test comment." }),
    });
    expect(commentRes.status).toBe(201);
    const commentJson = await readJson<Comment>(commentRes);
    createdCommentId = commentJson.data.id;

    const delComment = await app.request(`/api/comments/${createdCommentId}`, {
      method: "DELETE",
      headers: { Cookie: userCookie },
    });
    expect(delComment.status).toBe(200);
  });

  it("enforces admin role authorization and accepts contact messages", async () => {
    const forbiddenRes = await app.request("/api/admin/stats", {
      headers: { Cookie: userCookie },
    });
    expect(forbiddenRes.status).toBe(403);

    const adminLogin = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SEED_ADMIN_EMAIL ?? "admin@devopsacademy.local",
        password: process.env.SEED_ADMIN_PASSWORD ?? "Admin!Local2026",
      }),
    });
    expect(adminLogin.status).toBe(200);
    adminCookie = extractCookie(adminLogin.headers.get("set-cookie"));

    const statsRes = await app.request("/api/admin/stats", {
      headers: { Cookie: adminCookie },
    });
    expect(statsRes.status).toBe(200);
    const statsJson = await readJson<PlatformStats>(statsRes);
    expect(statsJson.data.articles).toBeGreaterThanOrEqual(13);

    const contactRes = await app.request("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Visitor",
        email: testContactEmail,
        subject: "Curriculum inquiry",
        message: "Testing the contact submission endpoint end to end.",
      }),
    });
    expect(contactRes.status).toBe(201);
  });
});
