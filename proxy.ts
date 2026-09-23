import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

// Only "/" is handled here: redirect to the visitor's preferred language.
export function proxy(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase())
    .find((code) => (locales as readonly string[]).includes(code === "iw" ? "he" : code));
  const locale = preferred === "iw" ? "he" : preferred ?? defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = { matcher: ["/"] };
