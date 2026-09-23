import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./fr";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("./fr").then((m) => m.default),
  he: () => import("./he").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
export type { Dictionary };
