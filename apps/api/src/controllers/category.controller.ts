import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import { categoryCreateSchema, categoryUpdateSchema } from "@devops-academy/shared/validators";
import { created, ok } from "../lib/response.ts";
import {
  createCategory,
  deleteCategory,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from "../services/category.service.ts";
import { assertSlug, assertUuid, parseJsonBody } from "../validators/index.ts";

export async function listCategoriesHandler(c: Context) {
  const user = c.get("user") as UserPublic | null | undefined;
  const items = await listCategories(user?.role === "admin");
  return ok(c, items);
}

export async function getCategoryHandler(c: Context) {
  const slug = assertSlug(c.req.param("slug"), "category slug");
  const category = await getCategoryBySlug(slug);
  return ok(c, category);
}

export async function createCategoryHandler(c: Context) {
  const body = await parseJsonBody(c, categoryCreateSchema);
  const category = await createCategory(body);
  return created(c, category);
}

export async function updateCategoryHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "category ID");
  const body = await parseJsonBody(c, categoryUpdateSchema);
  const category = await updateCategory(id, body);
  return ok(c, category);
}

export async function deleteCategoryHandler(c: Context) {
  const id = assertUuid(c.req.param("id"), "category ID");
  await deleteCategory(id);
  return ok(c, { deleted: true });
}
