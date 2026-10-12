import type { Dictionary } from "@/lib/i18n/fr";
import SectionHeading from "./SectionHeading";

// PLACEHOLDER structure: replace the dictionary entries with real, consented client reviews.
export default function Testimonials({ t }: { t: Dictionary["testimonials"] }) {
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="bg-ivory py-28 md:py-40">
      <div className="container-luxe">
        <SectionHeading id="testimonials-title" eyebrow={t.eyebrow} title={t.title} align="center" />
        <p data-reveal className="mx-auto mt-6 max-w-xl text-center text-sm text-stone">
          <span className="me-2 inline-block border border-dashed border-stone/60 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em]">
            Placeholder
          </span>
          {t.note}
        </p>

        <ul className="mt-20 grid gap-8 md:grid-cols-3">
          {t.items.map((item, i) => (
            <li
              key={i}
              data-reveal
              style={{ "--reveal-delay": i * 140 } as React.CSSProperties}
              className="flex flex-col border border-dashed border-ink/20 p-8 md:p-10"
            >
              <span aria-hidden="true" className="font-serif text-7xl leading-none text-accent">
                &ldquo;
              </span>
              <blockquote className="mt-2 flex-1 font-serif text-2xl italic leading-snug text-ink/50">{item.quote}</blockquote>
              <footer className="mt-10 border-t border-ink/10 pt-6">
                <p className="text-sm text-ink/60">{item.author}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone rtl:tracking-normal">{item.context}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
