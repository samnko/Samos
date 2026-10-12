import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/mentions-legales">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.legal.title,
    alternates: {
      canonical: `/${lang}/mentions-legales`,
      languages: { fr: "/fr/mentions-legales", he: "/he/mentions-legales", en: "/en/mentions-legales" },
    },
  };
}

export default async function Legal({ params }: PageProps<"/[lang]/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main id="main" className="bg-ivory pb-32 pt-44">
      <div className="container-luxe max-w-4xl">
        <p className="eyebrow text-accent-deep">Cohen Real Estate</p>
        <h1 className="display mt-6 text-[clamp(2.8rem,6vw,5rem)]">{t.legal.title}</h1>
        <div className="mt-16 divide-y divide-ink/10 border-y border-ink/10">
          {t.legal.sections.map((s) => (
            <section key={s.title} className="grid gap-4 py-10 md:grid-cols-[14rem_1fr] md:gap-10">
              <h2 className="font-serif text-2xl">{s.title}</h2>
              <p className="leading-relaxed text-stone">{s.text}</p>
            </section>
          ))}
        </div>
        <a href={`/${lang}`} className="btn btn-ink mt-16">
          <span aria-hidden="true" className="rtl:rotate-180">←</span> {t.legal.back}
        </a>
      </div>
    </main>
  );
}
