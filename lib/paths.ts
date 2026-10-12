// Base path of the deployment: "" on Vercel / a custom domain, "/Samos" on GitHub Pages
// (set NEXT_PUBLIC_BASE_PATH at build time). Plain <a> tags and public files need it;
// next/link adds it by itself.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const withBase = (path: string) => `${BASE_PATH}${path}`;
