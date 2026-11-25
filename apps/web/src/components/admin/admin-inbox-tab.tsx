"use client";

import { Check, Trash2 } from "lucide-react";
import {
  deleteContactMessageAdmin,
  markContactMessageAdmin,
  moderateCommentAdmin,
  updateAdminUserRole,
} from "@/services/admin.service";
import type { Comment, ContactMessage, Role, UserPublic } from "@/types";

interface Props {
  users: UserPublic[];
  comments: Array<Comment & { articleTitle?: string; articleSlug?: string }>;
  messages: ContactMessage[];
  onRefresh: () => Promise<void>;
}

export function AdminCommunityTab({ users, comments, messages, onRefresh }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Registered Users ({users.length})</h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div>
                <div className="font-semibold text-slate-100">{u.name}</div>
                <div className="text-xs text-slate-400">{u.email}</div>
              </div>
              <select
                value={u.role}
                aria-label={`Role for ${u.email}`}
                onChange={async (e) => {
                  await updateAdminUserRole(u.id, e.target.value as Role);
                  await onRefresh();
                }}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Comments Moderation ({comments.length})</h2>
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {comment.user?.name ?? "User"}
                  </span>{" "}
                  on <span className="text-sky-400">{comment.articleTitle ?? "Article"}</span>
                </div>
                <p className="text-sm text-slate-300">{comment.content}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await moderateCommentAdmin(comment.id, !comment.isApproved);
                  await onRefresh();
                }}
                className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                  comment.isApproved
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {comment.isApproved ? "Approved" : "Hidden"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Contact Inbox ({messages.length})</h2>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-100">{msg.subject}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    from {msg.name} ({msg.email})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await markContactMessageAdmin(msg.id, !msg.isRead);
                      await onRefresh();
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs ${
                      msg.isRead
                        ? "border-slate-700 text-slate-400"
                        : "border-sky-500/40 bg-sky-500/10 text-sky-300"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {msg.isRead ? "Read" : "Mark Read"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteContactMessageAdmin(msg.id);
                      await onRefresh();
                    }}
                    aria-label="Delete message"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
