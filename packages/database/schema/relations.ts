import { relations } from "drizzle-orm";
import { articles, categories, learningPaths, lessons } from "./content.ts";
import { bookmarks, comments, lessonProgress, sessions } from "./engagement.ts";
import { users } from "./users.ts";

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  bookmarks: many(bookmarks),
  progress: many(lessonProgress),
  comments: many(comments),
  sessions: many(sessions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  category: one(categories, { fields: [articles.categoryId], references: [categories.id] }),
  bookmarks: many(bookmarks),
  comments: many(comments),
}));

export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  path: one(learningPaths, { fields: [lessons.pathId], references: [learningPaths.id] }),
  progress: many(lessonProgress),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  article: one(articles, { fields: [bookmarks.articleId], references: [articles.id] }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  article: one(articles, { fields: [comments.articleId], references: [articles.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
