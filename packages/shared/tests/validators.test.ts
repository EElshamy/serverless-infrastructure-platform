import { describe, expect, it } from "vitest";
import {
  articleCreateSchema,
  lessonCreateSchema,
  loginSchema,
  registerSchema,
} from "../src/validators/index.js";

describe("shared validators", () => {
  it("accepts a valid registration and rejects a weak password", () => {
    expect(
      registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "strong-password",
      }).success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "123",
      }).success,
    ).toBe(false);
  });

  it("requires a valid login email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("validates article payloads and slug format", () => {
    const base = {
      title: "Docker networking fundamentals",
      description: "Understand how Docker networks isolate and connect containers.",
      content: "Docker creates isolated network namespaces for every container by default.",
      categoryId: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
    };
    expect(articleCreateSchema.safeParse(base).success).toBe(true);
    expect(articleCreateSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
  });

  it("requires an ordered lesson", () => {
    expect(
      lessonCreateSchema.safeParse({
        pathId: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
        title: "Installing Docker",
        description: "Install Docker Engine on a Linux server.",
        content: "Use the official repository and verify the installed version.",
        orderIndex: 0,
        durationMinutes: 15,
      }).success,
    ).toBe(true);
  });
});
