"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/fr";
import { getLenis, scrollToTarget } from "@/lib/lenis";

type Props = { lang: Locale; t: Dictionary["nav"]; logo: ReactNode };
type Mode = "top" | "dark" | "light";

const SECTIONS = ["services", "why", "founders", "listings", "contact"] as const;

export default function Header({ lang, t, logo }: Props) {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("top");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // The header takes the tone of whatever section sits beneath it.
    const update = () => {
      const probe = 40;
      if (window.scrollY < 24 && document.getElementById("hero")) return setMode("top");
      const overDark = Array.from(document.querySelectorAll("[data-tone='dark']")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      });
      setMode(overDark ? "dark" : "light");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  // Lock scrolling behind the mobile menu
  useEffect(() => {
    const lenis = getLenis();
    const loading = document.documentElement.classList.contains("is-loading");
    if (open) lenis?.stop();
    else if (!loading) lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onHome = pathname === `/${lang}`;
  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (!onHome) return;
    e.preventDefault();
    window.setTimeout(() => scrollToTarget(id === "top" ? 0 : `#${id}`), open ? 350 : 0);
  };

  const switchHref = (target: Locale) => pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${target}`) || `/${target}`;

  const light = mode === "light";
  const surface =
    mode === "top"
      ? "bg-transparent border-transparent"
      : mode === "dark"
        ? "bg-ink/55 backdrop-blur-xl border-ivory/10"
        : "bg-ivory/85 backdrop-blur-xl border-ink/10";

  return (
    <>
      <a
        href="#main"
        className="fixed start-4 top-4 z-[120] -translate-y-24 bg-gold px-4 py-2 text-sm text-ink focus:translate-y-0"
      >
        {t.skip}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${surface} ${
          light && !open ? "text-ink" : "text-ivory"
        }`}
      >
        <div className="container-luxe flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href={`/${lang}`} onClick={go("top")} aria-label={t.home} className="relative z-10">
            {logo}
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-9 text-[0.74rem] uppercase tracking-[0.2em] rtl:text-[0.9rem] rtl:tracking-normal">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a href={`/${lang}#${id}`} onClick={go(id)} className="link-line pb-1 opacity-85 transition-opacity hover:opacity-100">
                    {t[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-5">
            <LanguageSwitcher lang={lang} label={t.language} hrefFor={switchHref} />
            <a
              href={`/${lang}#contact`}
              onClick={go("contact")}
              className={`btn hidden min-h-11 px-6 md:inline-flex ${light ? "btn-ink" : "btn-ghost-light"}`}
            >
              {t.cta}
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="group flex h-11 w-11 flex-col items-center justify-center gap-[7px] lg:hidden"
            >
              <span className="sr-only">{open ? t.close : t.menu}</span>
              <span className={`block h-px w-7 bg-current transition-transform duration-500 ${open ? "translate-y-[4px] rotate-45" : ""}`} />
              <span className={`block h-px w-7 bg-current transition-transform duration-500 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className={`grain fixed inset-0 z-[45] flex flex-col bg-ink text-ivory transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] lg:hidden`}
        style={{ clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      >
        <nav aria-label="Mobile" className="container-luxe flex flex-1 flex-col justify-center pt-[var(--header-h)]">
          <ul className="space-y-3">
            {SECTIONS.map((id, i) => (
              <li key={id} className="overflow-hidden">
                <a
                  href={`/${lang}#${id}`}
                  onClick={go(id)}
                  className="display block text-[clamp(2.4rem,11vw,4rem)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: open ? "none" : "translateY(110%)",
                    opacity: open ? 1 : 0,
                    transitionDelay: open ? `${200 + i * 60}ms` : "0ms",
                  }}
                >
                  <span className="me-4 align-top font-sans text-xs tracking-[0.3em] text-gold" dir="ltr">
                    0{i + 1}
                  </span>
                  {t[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-luxe flex items-center justify-between border-t border-ivory/10 py-6 text-xs uppercase tracking-[0.25em] text-ivory/60">
          <span>Netanya</span>
          <span dir="ltr">Cohen Real Estate</span>
        </div>
      </div>
    </>
  );
}

function LanguageSwitcher({ lang, label, hrefFor }: { lang: Locale; label: string; hrefFor: (l: Locale) => string }) {
  return (
    <nav aria-label={label}>
      <ul className="flex items-center gap-1 text-[0.7rem] tracking-[0.18em]" dir="ltr">
        {locales.map((l, i) => (
          <li key={l} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className="mx-1.5 h-3 w-px bg-current opacity-30" />}
            <a
              href={hrefFor(l)}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? "true" : undefined}
              title={localeMeta[l].label}
              className={`px-0.5 py-2 transition-opacity ${l === lang ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
            >
              {localeMeta[l].short}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
