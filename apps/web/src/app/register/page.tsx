"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@devops-academy/shared/validators";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register: createAccount } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      await createAccount(values.name, values.email, values.password);
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="mb-2 text-2xl font-bold text-white">Create your account</h1>
        <p className="mb-6 text-sm text-slate-400">
          Start tracking completed lessons, saving bookmarks, and joining discussions.
        </p>

        {serverError && (
          <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-300">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
              Password (minimum 8 characters)
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
