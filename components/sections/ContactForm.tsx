"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/lib/i18n/fr";
import { whatsappLink } from "@/lib/site";

type Status = "idle" | "sending" | "success" | "fallback" | "error";
const TYPES = ["buy", "rent", "airbnb"] as const;

export default function ContactForm({ t, lang }: { t: Dictionary["contact"]["form"]; lang: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [type, setType] = useState<(typeof TYPES)[number]>("buy");
  const [fallbackHref, setFallbackHref] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");

    const summary = [
      `${t.name}: ${data.name}`,
      `${t.phone}: ${data.phone}`,
      data.email && `${t.email}: ${data.email}`,
      `${t.type}: ${t.types[type]}`,
      data.budget && `${t.budget}: ${data.budget}`,
      data.message && `${t.message}: ${data.message}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, lang }),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (body.fallback) {
        // No mail provider configured yet: hand the lead over to WhatsApp, pre-filled.
        setFallbackHref(whatsappLink(summary));
        setStatus("fallback");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const field =
    "peer w-full border-0 border-b border-ivory/25 bg-transparent px-0 pb-3 pt-7 text-lg text-ivory placeholder-transparent transition-colors focus:border-gold focus:outline-none focus:ring-0";
  const label =
    "pointer-events-none absolute start-0 top-7 origin-[0] text-sm text-ivory/60 transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:text-gold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs rtl:origin-[100%]";

  return (
    <form onSubmit={onSubmit} className="grid gap-x-10 gap-y-8 sm:grid-cols-2" noValidate={false}>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="relative sm:col-span-2">
        <input id="cf-name" name="name" required autoComplete="name" placeholder={t.name} className={field} />
        <label htmlFor="cf-name" className={label}>
          {t.name} *
        </label>
      </div>
      <div className="relative">
        <input id="cf-phone" name="phone" type="tel" required autoComplete="tel" placeholder={t.phone} className={field} dir="ltr" />
        <label htmlFor="cf-phone" className={label}>
          {t.phone} *
        </label>
      </div>
      <div className="relative">
        <input id="cf-email" name="email" type="email" autoComplete="email" placeholder={t.email} className={field} dir="ltr" />
        <label htmlFor="cf-email" className={label}>
          {t.email}
        </label>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="text-sm text-ivory/60">{t.type}</legend>
        <div className="mt-4 grid grid-cols-3 border border-ivory/20">
          {TYPES.map((key) => (
            <label
              key={key}
              className={`relative flex min-h-12 items-center justify-center border-ivory/20 px-2 text-center text-[0.75rem] uppercase tracking-[0.18em] transition-colors duration-500 rtl:tracking-normal [&:not(:first-child)]:border-s ${
                type === key ? "bg-gold text-ink" : "text-ivory/80 hover:bg-ivory/5"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={key}
                checked={type === key}
                onChange={() => setType(key)}
                className="sr-only"
              />
              {t.types[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="relative sm:col-span-2">
        <label htmlFor="cf-budget" className="text-sm text-ivory/60">
          {t.budget}
        </label>
        <select
          id="cf-budget"
          name="budget"
          defaultValue=""
          className="mt-2 w-full appearance-none border-0 border-b border-ivory/25 bg-transparent px-0 pb-3 pt-2 text-lg text-ivory focus:border-gold focus:outline-none focus:ring-0 [&>option]:bg-ink"
        >
          <option value="">{t.budgetPlaceholder}</option>
          {t.budgets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute bottom-4 end-0 h-4 w-4 text-ivory/60" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M6 9 L12 15 L18 9" />
        </svg>
      </div>

      <div className="relative sm:col-span-2">
        <textarea id="cf-message" name="message" rows={3} placeholder={t.messagePlaceholder} className={`${field} resize-none`} />
        <label htmlFor="cf-message" className={label}>
          {t.message}
        </label>
      </div>

      <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-ivory/50">{t.consent}</p>
        <button type="submit" disabled={status === "sending"} className="btn btn-gold shrink-0 disabled:opacity-60">
          {status === "sending" ? t.sending : t.submit}
          <svg viewBox="0 0 24 24" className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <path d="M4 12 H20 M14 6 L20 12 L14 18" />
          </svg>
        </button>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-gold-soft sm:col-span-2">
        {status === "success" && t.success}
        {status === "fallback" && (
          <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="link-line">
            {t.fallback} <span className="inline-block rtl:rotate-180">→</span>
          </a>
        )}
        {status === "error" && t.error}
      </p>
    </form>
  );
}
