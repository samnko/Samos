export default function WhatsAppFab({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cursor="WhatsApp"
      className="group fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f8f5f] text-white shadow-[0_18px_40px_-12px_rgba(14,24,32,0.55)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 md:bottom-8 md:end-8 md:h-16 md:w-16"
    >
      <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-[#1f8f5f] opacity-20 [animation-duration:2.8s]" />
      <WhatsAppIcon className="relative h-7 w-7 md:h-8 md:w-8" />
      <span className="pointer-events-none absolute end-full me-4 hidden whitespace-nowrap bg-ink px-4 py-2 text-xs tracking-wide text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
        {label}
      </span>
    </a>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.64c-1.96 0-3.88-.53-5.56-1.52l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.87 4.77-10.64 10.64-10.64 5.86 0 10.6 4.77 10.6 10.64 0 5.86-4.74 10.64-10.6 10.64Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.66 9.66 0 0 1-1.78-2.2c-.18-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66s1.14 3.08 1.3 3.3c.16.2 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.46.2 2 .12.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}
