// Brand logo (assets/logo.png → public/logo.png). `onDark` uses the reversed version
// (ivory lettering, red roof kept) generated for dark backgrounds.
// Intrinsic ratio: 892 × 409.
type Props = { onDark?: boolean; size?: "md" | "lg"; className?: string; alt?: string; priority?: boolean };

export default function Logo({ onDark = false, size = "md", className = "", alt = "Cohen Real Estate", priority = false }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={onDark ? "/logo-on-dark.png" : "/logo.png"}
      alt={alt}
      width={892}
      height={409}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={`${size === "lg" ? "h-16 md:h-20" : "h-11 md:h-[3.25rem]"} w-auto select-none ${className}`}
    />
  );
}
