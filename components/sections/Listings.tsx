import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/fr";
import { formatPrice, listings } from "@/lib/listings";
import SectionHeading from "./SectionHeading";

export default function Listings({ t, lang }: { t: Dictionary["listings"]; lang: Locale }) {
  return (
    <section id="listings" aria-labelledby="listings-title" className="bg-sand py-28 md:py-40">
      <div className="container-luxe">
        <SectionHeading id="listings-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        <ul className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {listings.map((item, i) => (
            <li key={item.id} data-reveal style={{ "--reveal-delay": (i % 3) * 120 } as React.CSSProperties}>
              <a href="#contact" data-cursor={t.cta} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#e0d6c4]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={`${item.title[lang]}, ${item.neighborhood[lang]}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`${item.title[lang]}, ${item.neighborhood[lang]}. ${t.photoSoon}`}
                      className="absolute inset-0 flex items-end justify-center bg-[linear-gradient(160deg,#e9e0cf_0%,#d9ccb4_55%,#c9b89a_100%)] transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    >
                      {/* Architectural line drawing as a tasteful stand-in */}
                      <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full text-ink/10" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
                        <path d="M40 250 V70 H120 V250 M120 110 H160 V250 M40 70 L80 45 L120 70" />
                        {Array.from({ length: 8 }).map((_, r) => (
                          <path key={r} d={`M52 ${88 + r * 19} H108`} />
                        ))}
                        {Array.from({ length: 6 }).map((_, r) => (
                          <path key={`b${r}`} d={`M128 ${126 + r * 19} H152`} />
                        ))}
                      </svg>
                      <span className="relative mb-8 text-[0.62rem] uppercase tracking-[0.35em] text-ink/45">{t.photoSoon}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                    <span className="bg-ivory/90 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] text-ink backdrop-blur">
                      {item.status === "sale" ? t.forSale : t.forRent}
                    </span>
                    {item.placeholder && (
                      <span className="border border-dashed border-ink/40 bg-ivory/70 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-ink/80 backdrop-blur">
                        {t.placeholder}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gold-deep rtl:tracking-normal">{item.neighborhood[lang]}</p>
                    <h3 className="mt-2 font-serif text-[1.7rem] leading-tight transition-colors duration-500 group-hover:text-gold-deep">
                      {item.title[lang]}
                    </h3>
                  </div>
                  <svg viewBox="0 0 24 24" className="mt-2 h-5 w-5 shrink-0 -rotate-45 text-ink/40 transition-all duration-500 group-hover:rotate-0 group-hover:text-ink rtl:rotate-[225deg] rtl:group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                    <path d="M4 12 H20 M14 6 L20 12 L14 18" />
                  </svg>
                </div>
                <dl className="mt-5 flex items-center gap-5 border-t border-ink/15 pt-4 text-sm text-stone">
                  <div className="me-auto">
                    <dt className="sr-only">{t.price}</dt>
                    <dd className="font-serif text-xl text-ink" dir="ltr">
                      {formatPrice(item.price, lang)}
                      {item.status === "rent" && <span className="ms-1 font-sans text-xs text-stone">{t.perMonth}</span>}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="sr-only">{t.rooms}</dt>
                    <dd>
                      {item.rooms} {t.rooms}
                    </dd>
                  </div>
                  <span aria-hidden="true" className="h-3 w-px bg-ink/20" />
                  <div>
                    <dt className="sr-only">{t.surface}</dt>
                    <dd dir="ltr">{item.surface} m²</dd>
                  </div>
                </dl>
              </a>
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-20 flex justify-center">
          <a href="#contact" className="btn btn-ink">
            {t.all}
          </a>
        </div>
      </div>
    </section>
  );
}
