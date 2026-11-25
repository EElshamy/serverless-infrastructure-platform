"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, Shield, Terminal, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { href: "/articles", label: "Articles" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/categories", label: "Categories" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30">
            <Terminal className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">DevOps Academy</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-800 text-sky-400"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <span className="h-9 w-28 animate-pulse rounded-lg bg-slate-800" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-400" />
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-sky-500 px-3.5 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          className="inline-flex items-center justify-center rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-900 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-800" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-sky-400 hover:bg-slate-900"
                >
                  Dashboard ({user.name})
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-amber-300 hover:bg-slate-900"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-400 hover:bg-slate-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-sky-500 px-3 py-2 text-center text-sm font-semibold text-slate-950"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
