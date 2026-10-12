// Extracts the dominant colours of assets/logo.png (via ffmpeg) and prints them as hex,
// so the @theme tokens in app/globals.css can be aligned with the real logo.
// Usage: npm run palette
import { execFileSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";

const src = process.argv[2] ?? "assets/logo.png";
if (!existsSync(src)) {
  console.error(`✗ ${src} not found`);
  process.exit(1);
}
const size = 64;
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", src, "-vf", `scale=${size}:${size}`, "-f", "rawvideo", "-pix_fmt", "rgba", "-"]);

const buckets = new Map();
for (let i = 0; i < raw.length; i += 4) {
  const [r, g, b, a] = raw.subarray(i, i + 4);
  if (a < 128) continue; // ignore transparency
  const key = [r, g, b].map((c) => Math.round(c / 24) * 24).join(",");
  const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
  e.n++; e.r += r; e.g += g; e.b += b;
  buckets.set(key, e);
}
const hex = (v) => Math.round(v).toString(16).padStart(2, "0");
const colours = [...buckets.values()]
  .sort((a, b) => b.n - a.n)
  .slice(0, 8)
  .map((e) => ({ hex: `#${hex(e.r / e.n)}${hex(e.g / e.n)}${hex(e.b / e.n)}`, share: e.n }));
const total = colours.reduce((s, c) => s + c.share, 0);
console.log("Dominant colours of", src);
for (const c of colours) console.log(`  ${c.hex}  ${((c.share / total) * 100).toFixed(1)}%`);
copyFileSync(src, "public/logo.png");
console.log("✓ copied to public/logo.png (the header/footer now use it)");
