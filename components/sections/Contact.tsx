import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/fr";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "../WhatsAppFab";
import ContactForm from "./ContactForm";

export default function Contact({ t, lang }: { t: Dictionary["contact"]; lang: Locale }) {
  const channels = [
    { label: t.channels.whatsapp, value: site.contact.phoneDisplay, href: whatsappLink(t.whatsappMessage), external: true, ltr: true },
    { label: t.channels.phone, value: site.contact.phoneDisplay, href: `tel:${site.contact.phoneHref}`, ltr: true },
    { label: t.channels.email, value: site.contact.email, href: `mailto:${site.contact.email}`, ltr: true },
    { label: t.channels.instagram, value: site.contact.instagramHandle, href: site.contact.instagram, external: true, ltr: true },
  ];

  return (
    <section id="contact" data-tone="dark" aria-labelledby="contact-title" className="grain relative overflow-hidden bg-ink py-28 text-ivory md:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute -start-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-navy/40 blur-[120px]" />
      <div className="container-luxe relative grid gap-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal className="eyebrow text-accent">
            {t.eyebrow}
          </p>
          <h2 id="contact-title" data-reveal style={{ "--reveal-delay": 120 } as React.CSSProperties} className="display mt-6 text-balance text-[clamp(2.6rem,5.6vw,5rem)]">
            {t.title}
          </h2>
          <p data-reveal style={{ "--reveal-delay": 220 } as React.CSSProperties} className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ivory/70">
            {t.intro}
          </p>

          <a
            data-reveal
            href={whatsappLink(t.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-10 bg-[#1f8f5f] text-white after:bg-[#187a50]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>

          <dl data-reveal className="mt-14 divide-y divide-ivory/10 border-y border-ivory/10">
            {channels.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-6 py-5">
                <dt className="text-[0.7rem] uppercase tracking-[0.25em] text-ivory/50 rtl:tracking-normal">{c.label}</dt>
                <dd>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="link-line break-all font-serif text-lg sm:text-xl"
                    dir={c.ltr ? "ltr" : undefined}
                  >
                    {c.value}
                  </a>
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-6 py-5">
              <dt className="text-[0.7rem] uppercase tracking-[0.25em] text-ivory/50 rtl:tracking-normal">{t.channels.office}</dt>
              <dd className="text-end font-serif text-lg sm:text-xl">{site.contact.address}</dd>
            </div>
          </dl>
        </div>

        <div data-reveal style={{ "--reveal-delay": 200 } as React.CSSProperties} className="lg:col-span-6 lg:col-start-7 lg:pt-4">
          <ContactForm t={t.form} lang={lang} />
        </div>
      </div>
    </section>
  );
}
