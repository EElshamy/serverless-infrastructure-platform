import { z } from "zod";

export const roleSchema = z.enum(["admin", "user"]);
export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export const statusSchema = z.enum(["draft", "published"]);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().trim().url().nullable().optional(),
  role: roleSchema.optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug"),
  description: z.string().trim().min(10).max(500),
  icon: z.string().trim().max(80).nullable().optional(),
  color: z.string().trim().max(30).nullable().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const articleCreateSchema = z.object({
  title: z.string().trim().min(5).max(200),
  slug: z.string().trim().min(5).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug").optional(),
  description: z.string().trim().min(20).max(500),
  content: z.string().trim().min(40),
  coverImage: z.string().trim().url().nullable().optional(),
  categoryId: z.string().uuid(),
  status: statusSchema.default("published"),
  featured: z.boolean().default(false),
  readingTime: z.number().int().min(1).max(240).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const learningPathCreateSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug").optional(),
  description: z.string().trim().min(20).max(1000),
  difficulty: difficultySchema,
  durationHours: z.number().int().min(1).max(1000),
  objectives: z.array(z.string().trim().min(5).max(200)).min(1).max(20),
  icon: z.string().trim().max(80).nullable().optional(),
  color: z.string().trim().max(30).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  status: statusSchema.default("published"),
});

export const learningPathUpdateSchema = learningPathCreateSchema.partial();

export const lessonCreateSchema = z.object({
  pathId: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().min(10).max(500),
  content: z.string().trim().min(30),
  codeExample: z.string().trim().nullable().optional(),
  practicalInstructions: z.string().trim().nullable().optional(),
  orderIndex: z.number().int().min(0),
  durationMinutes: z.number().int().min(1).max(600),
  isPublished: z.boolean().default(true),
});

export const lessonUpdateSchema = lessonCreateSchema.partial();

export const commentCreateSchema = z.object({
  content: z.string().trim().min(2).max(2000),
});

export const contactCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});

export const bookmarkCreateSchema = z.object({
  articleId: z.string().uuid(),
});

export const progressCreateSchema = z.object({
  lessonId: z.string().uuid(),
  completed: z.boolean().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().trim().max(200).optional(),
  sort: z.enum(["newest", "oldest", "popular", "title"]).default("newest"),
});

export const articleQuerySchema = paginationSchema.extend({
  category: z.string().trim().max(100).optional(),
  difficulty: difficultySchema.optional(),
  featured: z.coerce.boolean().optional(),
  status: statusSchema.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleCreateSchema>;
export type LearningPathInput = z.infer<typeof learningPathCreateSchema>;
export type LessonInput = z.infer<typeof lessonCreateSchema>;
