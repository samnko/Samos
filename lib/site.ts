// ---------------------------------------------------------------------------
// Agency details. Values marked PLACEHOLDER must be replaced before going live.
// ---------------------------------------------------------------------------
export const site = {
  name: "Cohen Real Estate",
  // PLACEHOLDER: final domain (also set NEXT_PUBLIC_SITE_URL on Vercel)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cohen-realestate.vercel.app",
  city: "Netanya",
  country: "IL",
  geo: { lat: 32.3215, lng: 34.8532 },
  founders: ["Salomon Cohen", "Ethan Cohen"],
  contact: {
    // PLACEHOLDER: international format, digits only for WhatsApp (e.g. 972501234567)
    whatsapp: "972500000000",
    phoneDisplay: "+972 50 000 0000",
    phoneHref: "+972500000000",
    email: "contact@cohen-realestate.example", // PLACEHOLDER
    instagram: "https://www.instagram.com/cohen.realestate", // PLACEHOLDER
    instagramHandle: "@cohen.realestate", // PLACEHOLDER
    address: "Netanya, Israël", // PLACEHOLDER: full street address
  },
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
