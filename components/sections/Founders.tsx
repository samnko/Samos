import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/fr";
import SectionHeading from "./SectionHeading";

// Drop the portraits in public/images/founders/{salomon,ethan}.jpg; a monogram shows until then.
const photo = (key: string) => {
  const rel = `/images/founders/${key}.jpg`;
  return fs.existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
};

export default function Founders({ t }: { t: Dictionary["founders"] }) {
  return (
    <section id="founders" aria-labelledby="founders-title" className="bg-ivory py-28 md:py-40">
      <div className="container-luxe">
        <SectionHeading id="founders-title" eyebrow={t.eyebrow} title={t.title} intro={t.intro} align="center" />

        <div className="mx-auto mt-20 grid max-w-6xl gap-16 md:mt-28 md:grid-cols-2 md:gap-10 lg:gap-20">
          {t.people.map((person, i) => {
            const src = photo(person.key);
            const initials = person.key === "salomon" ? "SC" : "EC";
            return (
              <article key={person.key} className={`group ${i === 1 ? "md:mt-32" : ""}`}>
                <div data-reveal="mask" className="relative aspect-[4/5] overflow-hidden bg-sand">
                  {src ? (
                    <Image
                      src={src}
                      alt={person.alt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover grayscale-[70%] transition-[filter,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`${person.alt}. ${t.photoSoon}`}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sand to-[#e2d8c6] transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    >
                      <span className="font-serif text-[7rem] font-light leading-none text-gold-deep/50" dir="ltr">
                        {initials}
                      </span>
                      <span className="mt-6 text-[0.65rem] uppercase tracking-[0.35em] text-stone">{t.photoSoon}</span>
                    </div>
                  )}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  <span aria-hidden="true" className="absolute bottom-6 start-6 h-px w-0 bg-gold transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-24" />
                </div>
                <div data-reveal className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="eyebrow text-gold-deep">{person.role}</p>
                    <h3 className="display mt-3 text-4xl md:text-5xl">{person.name}</h3>
                  </div>
                  <p className="leading-relaxed text-stone md:col-span-2 md:max-w-md">{person.bio}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
