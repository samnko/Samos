import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = (path: string) => Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`]));
  return ["", "/mentions-legales"].flatMap((path) =>
    locales.map((l) => ({
      url: `${site.url}/${l}${path}`,
      lastModified: new Date(),
      changeFrequency: path ? ("yearly" as const) : ("weekly" as const),
      priority: path ? 0.3 : l === "fr" ? 1 : 0.9,
      alternates: { languages: languages(path) },
    })),
  );
}
