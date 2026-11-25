import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-sm text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="flex items-center gap-2.5 text-slate-200">
          <Terminal className="h-5 w-5 text-sky-400" />
          <span className="font-semibold">DevOps Academy</span>
          <span className="text-slate-500">· Practical Cloud &amp; Infrastructure Engineering</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Link href="/articles" className="transition hover:text-slate-200">
            Articles
          </Link>
          <Link href="/paths" className="transition hover:text-slate-200">
            Learning Paths
          </Link>
          <Link href="/categories" className="transition hover:text-slate-200">
            Categories
          </Link>
          <Link href="/dashboard" className="transition hover:text-slate-200">
            Dashboard
          </Link>
          <Link href="/contact" className="transition hover:text-slate-200">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
