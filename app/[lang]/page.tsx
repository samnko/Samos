import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";
import HeroScroll from "@/components/hero/HeroScroll";
import Logo from "@/components/Logo";
import Services from "@/components/sections/Services";
import WhyUs from "@/components/sections/WhyUs";
import Founders from "@/components/sections/Founders";
import Listings from "@/components/sections/Listings";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main id="main">
      <HeroScroll
        t={t.hero}
        preloaderLabel={t.preloader.label}
        logo={<Logo onDark size="lg" />}
        whatsappHref={whatsappLink(t.contact.whatsappMessage)}
      />
      <Services t={t.services} />
      <WhyUs t={t.why} />
      <Founders t={t.founders} />
      <Listings t={t.listings} lang={lang} />
      <Testimonials t={t.testimonials} />
      <Contact t={t.contact} lang={lang} />
    </main>
  );
}
