import fs from "node:fs";
import path from "node:path";

// If the real logo is present (public/logo.png, copied from assets/logo.png) it is used;
// otherwise a typographic wordmark stands in.
const hasLogo = fs.existsSync(path.join(process.cwd(), "public", "logo.png"));

export default function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  if (hasLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="Cohen Real Estate"
        className={`${size === "lg" ? "h-20" : "h-11"} w-auto ${className}`}
        width={size === "lg" ? 240 : 132}
        height={size === "lg" ? 80 : 44}
      />
    );
  }
  const big = size === "lg";
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} dir="ltr">
      <svg
        aria-hidden="true"
        viewBox="0 0 40 40"
        className={`${big ? "h-14 w-14" : "h-9 w-9"} shrink-0 text-gold`}
        fill="none"
        stroke="currentColor"
      >
        <rect x="0.5" y="0.5" width="39" height="39" strokeWidth="1" />
        <path d="M8 17 L20 8 L32 17" strokeWidth="1" />
        <text
          x="20"
          y="31"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontFamily="var(--font-cormorant), Georgia, serif"
          fontSize="17"
          fontWeight="400"
        >
          C
        </text>
      </svg>
      <span aria-hidden="true" className="flex flex-col leading-none">
        <span
          className={`${big ? "text-3xl" : "text-[1.3rem]"} tracking-[0.28em]`}
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 400 }}
        >
          COHEN
        </span>
        <span
          className={`${big ? "mt-2 text-[0.7rem]" : "mt-1 text-[0.55rem]"} tracking-[0.46em] opacity-80`}
          style={{ fontFamily: "var(--font-jost), sans-serif", fontWeight: 400 }}
        >
          REAL ESTATE
        </span>
      </span>
      <span className="sr-only">Cohen Real Estate</span>
    </span>
  );
}
