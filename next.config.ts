import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a fully static site (GitHub Pages preview, see .github/workflows/pages.yml).
// The default build targets Vercel, where the language redirect (proxy.ts) and the contact API run.
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  basePath,
  ...(isStatic ? { output: "export" as const, trailingSlash: true } : {}),
  images: {
    unoptimized: isStatic,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  ...(isStatic
    ? {}
    : {
        async headers() {
          return [
            {
              // Frame URLs carry ?v=<manifest version>, so they can be cached for good.
              source: "/frames/:path*",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ];
        },
      }),
};

export default nextConfig;
