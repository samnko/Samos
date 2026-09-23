import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { Cormorant_Garamond, Jost, Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "../globals.css";
import { isLocale, localeMeta, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { site, whatsappLink } from "@/lib/site";
import { realEstateAgentJsonLd } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Reveal from "@/components/Reveal";
import WhatsAppFab from "@/components/WhatsAppFab";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-jost", display: "swap" });
// Hebrew faces (Hebrew glyphs only: Latin text keeps Cormorant / Jost). Not preloaded so FR/EN pages stay lean.
const frank = Frank_Ruhl_Libre({ subsets: ["hebrew"], weight: ["300", "400"], variable: "--font-frank", display: "swap", preload: false });
const heebo = Heebo({ subsets: ["hebrew"], weight: ["300", "400"], variable: "--font-heebo", display: "swap", preload: false });

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export const viewport: Viewport = {
  themeColor: "#0b1733",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s | ${site.name}` },
    description: t.meta.description,
    keywords: t.meta.keywords,
    applicationName: site.name,
    authors: site.founders.map((name) => ({ name })),
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: "/fr", he: "/he", en: "/en", "x-default": "/fr" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      url: `/${lang}`,
      locale: localeMeta[lang].og,
      alternateLocale: locales.filter((l) => l !== lang).map((l) => localeMeta[l].og),
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: t.hero.posterAlt }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/og.jpg"] },
    robots: { index: true, follow: true },
    other: { "geo.region": "IL-M", "geo.placename": "Netanya", "geo.position": `${site.geo.lat};${site.geo.lng}` },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  // The reversed logo is the first thing on screen (hero title, header over the video)
  preload("/logo-on-dark.png", { as: "image", fetchPriority: "high" });
  const fonts = [cormorant.variable, jost.variable, lang === "he" ? `${frank.variable} ${heebo.variable}` : ""].join(" ");

  return (
    <html lang={lang} dir={localeMeta[lang].dir} className={fonts} suppressHydrationWarning>
      <head>
        {/* Runs before paint: enables reveal styles and, on the home page, the preloader lock */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(d){d.classList.add('js');if(/^\\/(fr|he|en)\\/?$/.test(location.pathname)&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('is-loading')})(document.documentElement)`,
          }}
        />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgentJsonLd(lang, t)) }}
        />
      </head>
      <body id="top">
        <SmoothScroll />
        <Reveal />
        <Cursor />
        <Header lang={lang} t={t.nav} logo={<Logo alt="" />} logoOnDark={<Logo onDark alt="" />} />
        {children}
        <Footer lang={lang} t={t.footer} nav={t.nav} logo={<Logo onDark size="lg" />} />
        <WhatsAppFab href={whatsappLink(t.contact.whatsappMessage)} label={t.ui.whatsappFab} />
      </body>
    </html>
  );
}
