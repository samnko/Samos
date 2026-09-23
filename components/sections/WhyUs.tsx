import type { Dictionary } from "@/lib/i18n/fr";

export default function WhyUs({ t }: { t: Dictionary["why"] }) {
  return (
    <section id="why" data-tone="dark" aria-labelledby="why-title" className="grain relative overflow-hidden bg-ink py-28 text-ivory md:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute -end-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-[120px]" />
      <div className="container-luxe relative grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p data-reveal className="eyebrow text-gold">
              {t.eyebrow}
            </p>
            <h2
              id="why-title"
              data-reveal
              style={{ "--reveal-delay": 120 } as React.CSSProperties}
              className="display mt-6 text-balance text-[clamp(2.4rem,5vw,4.5rem)]"
            >
              {t.title}
            </h2>
          </div>
        </div>
        <ol className="lg:col-span-6 lg:col-start-7">
          {t.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              className="group grid grid-cols-[3.5rem_1fr] gap-x-6 border-t border-ivory/15 py-10 last:border-b md:grid-cols-[5rem_1fr] md:py-12"
            >
              <span className="font-serif text-2xl italic text-gold transition-transform duration-700 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" dir="ltr">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-serif text-[1.85rem] leading-tight md:text-[2.2rem]">{item.title}</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-ivory/70">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
