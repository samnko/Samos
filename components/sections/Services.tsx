import type { Dictionary } from "@/lib/i18n/fr";
import SectionHeading from "./SectionHeading";

const icons: Record<string, React.ReactNode> = {
  buy: (
    <>
      <circle cx="15" cy="24" r="7" />
      <path d="M21 20.5 L38 20.5 M32 20.5 V26 M36 20.5 V24" />
    </>
  ),
  rent: (
    <>
      <path d="M8 40 V14 L24 6 L40 14 V40" />
      <path d="M19 40 V27 H29 V40" />
      <circle cx="26.5" cy="34" r="0.8" fill="currentColor" />
    </>
  ),
  airbnb: (
    <>
      <rect x="9" y="15" width="30" height="23" rx="1" />
      <path d="M18 15 V10 H30 V15 M9 24 H39" />
    </>
  ),
};

export default function Services({ t }: { t: Dictionary["services"] }) {
  return (
    <section id="services" aria-labelledby="services-title" className="relative bg-ivory py-28 md:py-40">
      <div className="container-luxe">
        <SectionHeading id="services-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

        <ul className="mt-20 grid gap-px bg-ink/10 md:mt-28 md:grid-cols-3">
          {t.items.map((item, i) => (
            <li
              key={item.key}
              data-reveal
              style={{ "--reveal-delay": i * 140 } as React.CSSProperties}
              className="group relative flex flex-col bg-ivory p-8 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-ivory md:p-10 lg:p-12"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 rtl:origin-right" />
              <div className="flex items-start justify-between">
                <svg
                  viewBox="0 0 48 48"
                  className="h-12 w-12 text-accent-deep transition-colors duration-700 group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  aria-hidden="true"
                >
                  {icons[item.key]}
                </svg>
                <span className="font-serif text-sm italic text-stone transition-colors duration-700 group-hover:text-ivory/50" dir="ltr">
                  0{i + 1}
                </span>
              </div>
              <h3 className="display mt-14 text-[2.6rem] md:text-5xl">{item.title}</h3>
              <p className="mt-3 font-serif text-xl italic text-stone transition-colors duration-700 group-hover:text-accent-soft">
                {item.lead}
              </p>
              <ul className="mt-10 space-y-4 border-t border-current/10 pt-8 text-[0.98rem] leading-relaxed">
                {item.points.map((p) => (
                  <li key={p} className="flex gap-4">
                    <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
                    <span className="opacity-85">{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
