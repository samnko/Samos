import type { Locale } from "./i18n/config";

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA: sample properties used to lay out the "Featured" grid.
// Replace with real listings. `image` is a path under /public (e.g. "/images/listings/ir-yamim.jpg");
// leave it empty to show the elegant "photo coming soon" block.
// ---------------------------------------------------------------------------
export type Listing = {
  id: string;
  placeholder: boolean;
  status: "sale" | "rent";
  image?: string;
  price: number; // in ILS; monthly rent when status = "rent"
  rooms: number;
  surface: number; // m²
  title: Record<Locale, string>;
  neighborhood: Record<Locale, string>;
};

export const listings: Listing[] = [
  {
    id: "penthouse-ir-yamim",
    placeholder: true,
    status: "sale",
    price: 7900000,
    rooms: 5,
    surface: 210,
    title: { fr: "Penthouse vue mer", he: "פנטהאוז עם נוף לים", en: "Sea-view penthouse" },
    neighborhood: { fr: "Ir Yamim", he: "עיר ימים", en: "Ir Yamim" },
  },
  {
    id: "front-de-mer",
    placeholder: true,
    status: "sale",
    price: 4200000,
    rooms: 4,
    surface: 124,
    title: { fr: "Appartement front de mer", he: "דירה בקו ראשון לים", en: "Seafront apartment" },
    neighborhood: { fr: "Front de mer, centre", he: "רצועת החוף, מרכז", en: "Seafront, city centre" },
  },
  {
    id: "duplex-ramat-poleg",
    placeholder: true,
    status: "sale",
    price: 5300000,
    rooms: 6,
    surface: 182,
    title: { fr: "Duplex avec terrasse", he: "דופלקס עם מרפסת גג", en: "Duplex with terrace" },
    neighborhood: { fr: "Ramat Poleg", he: "רמת פולג", en: "Ramat Poleg" },
  },
  {
    id: "agamim-rent",
    placeholder: true,
    status: "rent",
    price: 9500,
    rooms: 4,
    surface: 112,
    title: { fr: "Appartement lumineux", he: "דירה מוארת", en: "Bright apartment" },
    neighborhood: { fr: "Agamim", he: "אגמים", en: "Agamim" },
  },
  {
    id: "studio-centre",
    placeholder: true,
    status: "sale",
    price: 1950000,
    rooms: 2,
    surface: 58,
    title: { fr: "Pied-à-terre idéal Airbnb", he: "דירת נופש אידיאלית ל-Airbnb", en: "Pied-à-terre, ideal for Airbnb" },
    neighborhood: { fr: "Kikar HaAtsmaout", he: "כיכר העצמאות", en: "Kikar HaAtzmaut" },
  },
  {
    id: "nordau-rent",
    placeholder: true,
    status: "rent",
    price: 7200,
    rooms: 3,
    surface: 86,
    title: { fr: "Appartement rénové", he: "דירה משופצת", en: "Renovated apartment" },
    neighborhood: { fr: "Kiryat Nordau", he: "קריית נורדאו", en: "Kiryat Nordau" },
  },
];

const intlLocale: Record<Locale, string> = { fr: "fr-FR", he: "he-IL", en: "en-US" };

export const formatPrice = (value: number, locale: Locale) =>
  new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(value);
