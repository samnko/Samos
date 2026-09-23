import type { ReactNode, Ref } from "react";

type Props = { ref: Ref<HTMLDivElement>; leaving: boolean; label: string; logo: ReactNode };

// Progress is written directly to the DOM by HeroScroll (the --progress variable and [data-pct]).
export default function Preloader({ ref, leaving, label, logo }: Props) {
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="preloader grain fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-ivory transition-[clip-path] duration-[1300ms] ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:hidden"
      style={{ clipPath: leaving ? "inset(0 0 100% 0)" : "inset(0 0 0 0)", ["--progress" as string]: 0 }}
    >
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          leaving ? "-translate-y-6 opacity-0" : "animate-[fade-up_1.2s_cubic-bezier(0.22,1,0.36,1)_both]"
        }`}
      >
        {logo}
        <div className="mt-12 h-px w-48 overflow-hidden bg-ivory/15 sm:w-64">
          <div className="h-full origin-left scale-x-[var(--progress)] bg-accent transition-transform duration-500 ease-out rtl:origin-right" />
        </div>
        <div className="mt-5 flex w-48 items-center justify-between text-[0.62rem] uppercase tracking-[0.3em] text-ivory/55 sm:w-64">
          <span>{label}</span>
          <span data-pct className="tabular-nums" dir="ltr">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
