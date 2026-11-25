import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOps Academy — Practical Cloud & Infrastructure Learning",
  description:
    "Structured DevOps learning paths, hands-on lessons, and production engineering guides covering Linux, Docker, Kubernetes, Terraform, CI/CD, and AWS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
