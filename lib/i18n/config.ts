export const locales = ["fr", "he", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeMeta: Record<Locale, { label: string; short: string; dir: "ltr" | "rtl"; og: string }> = {
  fr: { label: "Français", short: "FR", dir: "ltr", og: "fr_FR" },
  he: { label: "עברית", short: "HE", dir: "rtl", og: "he_IL" },
  en: { label: "English", short: "EN", dir: "ltr", og: "en_US" },
};
