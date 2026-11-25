"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactCreateSchema } from "@devops-academy/shared/validators";
import { CheckCircle2, Mail } from "lucide-react";
import { z } from "zod";
import { submitContactMessage } from "@/services/engagement.service";

type ContactInput = z.infer<typeof contactCreateSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactCreateSchema),
  });

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    try {
      await submitContactMessage(values);
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
          <Mail className="h-4 w-4" />
          Get in touch
        </div>
        <h1 className="text-3xl font-bold text-white">Contact DevOps Academy</h1>
        <p className="mt-2 text-sm text-slate-400">
          Questions about a learning path, curriculum feedback, or topic requests? Send us a note.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        {submitted && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Your message has been received. Our team will review it shortly.</span>
          </div>
        )}

        {serverError && (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-300">
                Your name
              </label>
              <input
                id="name"
                type="text"
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
                {...register("email")}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-1.5 block text-xs font-medium text-slate-300">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              {...register("subject")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-rose-400">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-slate-300">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              {...register("message")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-rose-400">{errors.message.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
