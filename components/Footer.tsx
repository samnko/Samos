import type { ReactNode } from "react";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/fr";
import { site, whatsappLink } from "@/lib/site";

type Props = { lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"]; logo: ReactNode };

export default function Footer({ lang, t, nav, logo }: Props) {
  const links = ["services", "why", "founders", "listings", "testimonials", "contact"] as const;
  return (
    <footer data-tone="dark" className="bg-ink-2 text-ivory">
      <div className="container-luxe py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            {logo}
            <p className="mt-8 max-w-sm leading-relaxed text-ivory/60">{t.tagline}</p>
          </div>

          <nav aria-label={t.navigation} className="md:col-span-2 md:col-start-7">
            <h2 className="text-[0.68rem] uppercase tracking-[0.3em] text-accent-soft rtl:tracking-normal">{t.navigation}</h2>
            <ul className="mt-6 space-y-3 text-ivory/75">
              {links.map((id) => (
                <li key={id}>
                  <a href={`/${lang}#${id}`} className="link-line">
                    {nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <h2 className="text-[0.68rem] uppercase tracking-[0.3em] text-accent-soft rtl:tracking-normal">{t.contact}</h2>
            <ul className="mt-6 space-y-3 text-ivory/75" dir="ltr">
              <li className="rtl:text-right">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link-line">
                  WhatsApp
                </a>
              </li>
              <li className="rtl:text-right">
                <a href={`tel:${site.contact.phoneHref}`} className="link-line">
                  {site.contact.phoneDisplay}
                </a>
              </li>
              <li className="rtl:text-right">
                <a href={`mailto:${site.contact.email}`} className="link-line break-all">
                  {site.contact.email}
                </a>
              </li>
              <li className="rtl:text-right">
                <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer" className="link-line">
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label={t.languages} className="md:col-span-2">
            <h2 className="text-[0.68rem] uppercase tracking-[0.3em] text-accent-soft rtl:tracking-normal">{t.languages}</h2>
            <ul className="mt-6 space-y-3 text-ivory/75">
              {locales.map((l) => (
                <li key={l}>
                  <a href={`/${l}`} hrefLang={l} lang={l} aria-current={l === lang ? "true" : undefined} className="link-line aria-[current]:text-accent-soft">
                    {localeMeta[l].label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-ivory/10 pt-8 text-xs text-ivory/65 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.rights}
          </p>
          <div className="flex items-center gap-8">
            <a href={`/${lang}/mentions-legales`} className="link-line">
              {t.legal}
            </a>
            <a href="#top" className="link-line">
              {t.top} <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
