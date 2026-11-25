"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { AdminArticlesTab } from "@/components/admin/admin-articles-tab";
import { AdminCommunityTab } from "@/components/admin/admin-inbox-tab";
import { AdminPathsTab } from "@/components/admin/admin-paths-tab";
import { LoadingState } from "@/components/ui-states";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminArticles,
  fetchAdminComments,
  fetchAdminContactMessages,
  fetchAdminPaths,
  fetchAdminStats,
  fetchAdminUsers,
} from "@/services/admin.service";
import { fetchCategories } from "@/services/content.service";
import type {
  Article,
  Category,
  Comment,
  ContactMessage,
  LearningPath,
  PlatformStats,
  UserPublic,
} from "@/types";

type TabKey = "articles" | "paths" | "community";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>("articles");
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [comments, setComments] = useState<Array<Comment & { articleTitle?: string }>>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadedAdminId, setLoadedAdminId] = useState<string | null>(null);

  const fetchAdminPayload = useCallback(async () => {
    const [s, a, c, p, u, cm, msg] = await Promise.all([
      fetchAdminStats(),
      fetchAdminArticles(),
      fetchCategories(),
      fetchAdminPaths(),
      fetchAdminUsers(),
      fetchAdminComments(),
      fetchAdminContactMessages(),
    ]);
    return { s, a, c, p, u, cm, msg };
  }, []);

  const loadAll = useCallback(async () => {
    const data = await fetchAdminPayload();
    setStats(data.s);
    setArticles(data.a);
    setCategories(data.c);
    setPaths(data.p);
    setUsers(data.u);
    setComments(data.cm);
    setMessages(data.msg);
  }, [fetchAdminPayload]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const adminId = user.id;
    let cancelled = false;
    void fetchAdminPayload()
      .then((data) => {
        if (cancelled) return;
        setStats(data.s);
        setArticles(data.a);
        setCategories(data.c);
        setPaths(data.p);
        setUsers(data.u);
        setComments(data.cm);
        setMessages(data.msg);
      })
      .finally(() => {
        if (!cancelled) setLoadedAdminId(adminId);
      });
    return () => {
      cancelled = true;
    };
  }, [user, fetchAdminPayload]);

  const loading = authLoading || (user?.role === "admin" && loadedAdminId !== user.id);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <LoadingState label="Loading admin console..." />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <Shield className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <h1 className="mb-2 text-2xl font-bold text-white">Administrator Access Required</h1>
          <p className="mb-6 text-sm text-slate-400">
            Please sign in with an administrator account to manage content and users.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage DevOps Academy content, users, comments, and contact messages.
        </p>
      </div>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Users", value: stats.users },
            { label: "Articles", value: stats.articles },
            { label: "Paths", value: stats.learningPaths },
            { label: "Lessons", value: stats.lessons },
            { label: "Comments", value: stats.comments },
            { label: "Messages", value: stats.contactMessages },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="text-xs font-medium text-slate-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { key: "articles" as const, label: "Articles & Categories" },
          { key: "paths" as const, label: "Learning Paths & Lessons" },
          { key: "community" as const, label: "Users, Comments & Inbox" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === item.key
                ? "bg-sky-500 text-slate-950"
                : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "articles" && (
        <AdminArticlesTab articles={articles} categories={categories} onRefresh={loadAll} />
      )}
      {tab === "paths" && <AdminPathsTab paths={paths} onRefresh={loadAll} />}
      {tab === "community" && (
        <AdminCommunityTab
          users={users}
          comments={comments}
          messages={messages}
          onRefresh={loadAll}
        />
      )}
    </div>
  );
}
