export type Role = "admin" | "user";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type ArticleStatus = "draft" | "published";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  articleCount?: number;
}

export interface AuthorSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string | null;
  status: ArticleStatus;
  featured: boolean;
  readingTime: number;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  author: AuthorSummary | null;
  bookmarked?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  durationHours: number;
  objectives: string[];
  icon: string | null;
  color: string | null;
  sortOrder: number;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  lessonCount?: number;
  completedLessons?: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  pathId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  codeExample: string | null;
  practicalInstructions: string | null;
  orderIndex: number;
  durationMinutes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  completed?: boolean;
}

export interface Bookmark {
  id: string;
  articleId: string;
  createdAt: string;
  article?: Article;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: AuthorSummary | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PlatformStats {
  users: number;
  articles: number;
  learningPaths: number;
  lessons: number;
  comments: number;
  contactMessages: number;
}
