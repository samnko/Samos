import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/fr";
import { site } from "./site";

/** schema.org RealEstateAgent, localised. */
export const realEstateAgentJsonLd = (lang: Locale, t: Dictionary) => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${site.url}/#agency`,
  name: site.name,
  url: `${site.url}/${lang}`,
  description: t.meta.description,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/icon.svg`,
  telephone: site.contact.phoneHref,
  email: site.contact.email,
  inLanguage: lang,
  knowsLanguage: ["fr", "he", "en"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Netanya",
    addressCountry: "IL",
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
  areaServed: { "@type": "City", name: "Netanya" },
  founder: site.founders.map((name) => ({ "@type": "Person", name })),
  sameAs: [site.contact.instagram],
  makesOffer: t.services.items.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.title, description: s.lead, areaServed: "Netanya" },
  })),
});
