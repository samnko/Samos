"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import manifest from "@/public/frames/manifest.json";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import type { Dictionary } from "@/lib/i18n/fr";
import Preloader from "./Preloader";
import Logo from "../Logo";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  t: Dictionary["hero"];
  preloaderLabel: string;
  logo: ReactNode;
  whatsappHref: string;
};

type FrameSet = { path: string; width: number; height: number };

const COUNT = manifest.count;
const SCENES = manifest.scenes;
const pad = (n: number) => String(n).padStart(manifest.pad, "0");
const frameUrl = (set: FrameSet, index: number) => `${set.path}/frame_${pad(index + 1)}.webp?v=${manifest.version}`;

// Poster for reduced motion / no-JS: the founders on the terrace (start of V6).
const POSTER_INDEX = Math.min(COUNT - 1, SCENES[5] + 12);

/**
 * When each caption shows, as fractions of its own clip (values > 1 run into the next clip).
 * Tuned to the footage: the founders only appear in the last third of V5 and stay into V6,
 * and the closing call to action waits for the drone to pull back.
 */
const CAPTION_TIMING: [number, number][] = [
  [0, 0.4], // V1 aerial: visible from the start
  [0.15, 0.78], // V2 approach to the tower
  [0.15, 0.78], // V3 penthouse facade
  [0.15, 0.78], // V4 living room
  [0.55, 1.18], // V5 balcony → founders
  [0.4, 1], // V6 pull-back: stays until the hero ends
];

/** Scroll length of the hero, in viewport heights. ~1 viewport per scene feels unhurried. */
const SCROLL_VH = 620;

export default function HeroScroll({ t, preloaderLabel, logo, whatsappHref }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const finishLoading = () => {
      root.classList.remove("is-loading");
      getLenis()?.start();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setPhase("done");
      finishLoading();
      return;
    }

    const canvas = canvasRef.current!;
    const section = sectionRef.current!;
    const ctx2d = canvas.getContext("2d", { alpha: false })!;

    // ---- Pick the frame set ------------------------------------------------
    const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
    const set: FrameSet = portrait ? manifest.mobile : manifest.desktop;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    // On phones, every other frame is plenty (the scrub smooths it out) and halves the payload.
    let stride = portrait && COUNT > 360 ? 2 : 1;
    // Slow or data-saving connections: halve again (desktop included)
    if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? "")) stride *= 2;

    const images: (HTMLImageElement | undefined)[] = new Array(COUNT);
    const loaded = new Uint8Array(COUNT);
    let disposed = false;

    // ---- Drawing -------------------------------------------------------------
    const state = { frame: 0 };
    let drawn = -1;

    const nearestLoaded = (i: number) => {
      if (loaded[i]) return i;
      for (let d = 1; d < COUNT; d++) {
        if (i - d >= 0 && loaded[i - d]) return i - d;
        if (i + d < COUNT && loaded[i + d]) return i + d;
      }
      return -1;
    };

    const render = () => {
      const target = Math.round(state.frame);
      const index = nearestLoaded(target);
      if (index < 0 || index === drawn) return;
      const img = images[index]!;
      const cw = canvas.width;
      const ch = canvas.height;
      // "cover": fill the viewport without distortion whatever its ratio
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      drawn = index;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = "high";
      drawn = -1;
      render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ---- Progressive preloading ---------------------------------------------
    const wanted: number[] = [];
    for (let i = 0; i < COUNT; i += stride) wanted.push(i);
    // Blocking pass kept lean (it gates the preloader): opening frames + sparse keyframes.
    const first = new Set<number>();
    wanted.slice(0, 8).forEach((i) => first.add(i));
    wanted.forEach((i, k) => k % 24 === 0 && first.add(i));
    first.add(wanted[wanted.length - 1]);
    const phase1 = [...first];
    // Background: a denser keyframe pass first, then every remaining frame in order.
    const dense = wanted.filter((i, k) => k % 6 === 0 && !first.has(i));
    const denseSet = new Set(dense);
    const rest = wanted.filter((i) => !first.has(i) && !denseSet.has(i));
    const queue = [...phase1, ...dense, ...rest];

    let phase1Done = 0;
    let revealed = false;
    const startedAt = performance.now();

    const reveal = () => {
      if (revealed || disposed) return;
      revealed = true;
      const wait = Math.max(0, 700 - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (disposed) return;
        setPhase("leaving");
        finishLoading();
        window.setTimeout(startBackground, 1200);
        ScrollTrigger.refresh();
        intro();
        window.setTimeout(() => !disposed && setPhase("done"), 1400);
      }, wait);
    };

    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(set, i);
        const done = () => {
          if (disposed) return resolve();
          images[i] = img;
          loaded[i] = 1;
          if (first.has(i)) {
            phase1Done++;
            // Written straight to the DOM: no React re-render per frame
            const pct = Math.round((phase1Done / phase1.length) * 100);
            const el = progressRef.current;
            if (el) {
              el.setAttribute("aria-valuenow", String(pct));
              el.style.setProperty("--progress", String(pct / 100));
              el.querySelector("[data-pct]")!.textContent = String(pct).padStart(3, "0");
            }
            if (phase1Done === phase1.length) reveal();
          }
          // Refresh if this frame is closer to the scroll position than what is on screen
          const target = Math.round(state.frame);
          if (drawn < 0 || Math.abs(i - target) < Math.abs(drawn - target)) render();
          resolve();
        };
        img
          .decode()
          .then(done)
          .catch(() => (img.complete && img.naturalWidth ? done() : resolve()));
      });

    // Blocking pass first; the background pass only starts once the page is revealed and idle,
    // so it never competes with the first render.
    let cursor = 0;
    const worker = async (limit: number) => {
      while (!disposed && cursor < limit) await loadFrame(queue[cursor++]);
    };
    const pool = (n: number, limit: number) => Promise.all(Array.from({ length: n }, () => worker(limit)));
    let backgroundStarted = false;
    const startBackground = () => {
      if (backgroundStarted || disposed) return;
      backgroundStarted = true;
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
      const go = () => pool(portrait ? 3 : 5, queue.length);
      if (idle) idle(go, { timeout: 1500 });
      else window.setTimeout(go, 300);
    };
    pool(6, phase1.length);

    // Safety net: never keep a visitor behind the preloader on a slow network.
    const safety = window.setTimeout(() => loaded[0] && reveal(), 9000);
    const safetyLate = window.setTimeout(reveal, 15000);

    // ---- Scroll choreography --------------------------------------------------
    const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]", section);
    const railItems = railRef.current ? Array.from(railRef.current.children) : [];
    let activeScene = -1;
    const setActive = (frame: number) => {
      let s = 0;
      for (let k = 0; k < SCENES.length; k++) if (frame >= SCENES[k]) s = k;
      if (s === activeScene) return;
      activeScene = s;
      railItems.forEach((el, k) => el.toggleAttribute("data-active", k === s));
    };

    const gctx = gsap.context(() => {
      const total = COUNT - 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      tl.to(state, {
        frame: total,
        duration: total,
        onUpdate: () => {
          render();
          setActive(state.frame);
        },
      }, 0);

      tl.to("[data-scroll-cue]", { autoAlpha: 0, duration: total * 0.02 }, 0);
      tl.fromTo("[data-rail-fill]", { scaleY: 0 }, { scaleY: 1, duration: total }, 0);

      scenes.forEach((el, i) => {
        const start = SCENES[i] ?? 0;
        const len = (SCENES[i + 1] ?? COUNT) - start;
        const nextLen = (SCENES[i + 2] ?? COUNT) - (SCENES[i + 1] ?? COUNT);
        const [inAt, outAt] = CAPTION_TIMING[i] ?? [0.15, 0.78];
        // Fractions above 1 are measured in the next clip's length
        const at = (f: number) => (f <= 1 ? start + len * f : start + len + nextLen * (f - 1));
        const fade = Math.min(len, 160) * 0.2;
        const inner = el.querySelectorAll("[data-line]");
        if (i > 0) {
          tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade, ease: "power1.out" }, at(inAt));
          tl.fromTo(inner, { y: 48 }, { y: 0, stagger: fade * 0.15, duration: fade * 1.5, ease: "power2.out" }, at(inAt));
        }
        if (i < scenes.length - 1) {
          tl.to(el, { autoAlpha: 0, y: i === 0 ? -40 : -32, duration: fade, ease: "power1.in" }, at(outAt));
        }
      });

      // Let the final scene breathe before the page moves on
      tl.to({}, { duration: total * 0.08 });
    }, section);

    ScrollTrigger.config({ ignoreMobileResize: true });
    setActive(0);

    // Entrance once the preloader lifts
    const intro = () => {
      gsap.fromTo(stageRef.current, { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "expo.out" });
      gsap.fromTo(
        section.querySelectorAll("[data-scene='0'] [data-line]:not(h1)"),
        { yPercent: 110 },
        { yPercent: 0, duration: 1.6, stagger: 0.12, ease: "expo.out", delay: 0.15 },
      );
      // The logo is never hidden (it is the page's largest paint): it settles from a slight zoom instead
      gsap.fromTo(
        section.querySelector("[data-scene='0'] h1"),
        { scale: 1.08 },
        { scale: 1, duration: 2.2, ease: "expo.out" },
      );
    };

    return () => {
      disposed = true;
      window.clearTimeout(safety);
      window.clearTimeout(safetyLate);
      ro.disconnect();
      gctx.revert();
    };
  }, []);

  const goContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget("#contact");
  };

  return (
    <>
      {phase !== "done" && (
        <Preloader ref={progressRef} leaving={phase === "leaving"} label={preloaderLabel} logo={logo} />
      )}

      <section
        id="hero" data-tone="dark"
        ref={sectionRef}
        aria-label={t.ariaLabel}
        className="relative bg-ink text-ivory"
        style={{ height: reduced ? "auto" : `${SCROLL_VH}vh` }}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden supports-[height:100lvh]:h-lvh">
          <div ref={stageRef} className="absolute inset-0 will-change-transform">
            {reduced ? (
              <picture>
                <source media="(orientation: portrait) and (max-width: 1023px)" srcSet={frameUrl(manifest.mobile, POSTER_INDEX)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frameUrl(manifest.desktop, POSTER_INDEX)}
                  alt={t.posterAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  fetchPriority="high"
                />
              </picture>
            ) : (
              <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
            )}
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frameUrl(manifest.desktop, 0)}
                alt={t.posterAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </noscript>
          </div>

          {/* Legibility: soft gradients, never a flat dark veil */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(11_23_51/0.45)_100%)]" />
          </div>

          {/* ---- Scene texts ---- */}
          <div className="pointer-events-none absolute inset-0">
            {t.scenes.map((scene, i) => {
              const last = i === t.scenes.length - 1;
              const centered = i === 0 || last;
              if (reduced && i > 0) return null;
              return (
                <div
                  key={i}
                  data-scene={i}
                  data-first={i === 0 ? "" : undefined}
                  className={`hero-scene absolute inset-0 flex ${
                    centered
                      ? "flex-col items-center justify-center px-6 text-center"
                      : i === 4
                        ? // Founders scene: on phones they fill the lower half, so the caption sits on top
                          "flex-col justify-start pt-[15vh] md:justify-end md:pb-[16vh] md:pt-0"
                        : "flex-col justify-end pb-[18vh] md:pb-[16vh]"
                  }`}
                >
                  {/* Per-caption scrim: follows the caption's fade, so bright shots stay legible */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 ${
                      centered
                        ? "bg-[radial-gradient(ellipse_60%_45%_at_center,rgb(11_23_51/0.55),transparent_75%)]"
                        : i === 4
                          ? "bg-gradient-to-b from-ink/60 via-transparent to-transparent md:bg-gradient-to-r md:via-ink/20 md:rtl:bg-gradient-to-l"
                          : "bg-gradient-to-r from-ink/60 via-ink/20 to-transparent rtl:bg-gradient-to-l"
                    }`}
                  />
                  <div
                    className={`relative [text-shadow:0_2px_24px_rgb(11_23_51/0.45)] ${
                      centered ? "flex max-w-5xl flex-col items-center" : "container-luxe"
                    }`}
                  >
                    <div className="overflow-hidden pb-1">
                      <p data-line className="eyebrow text-accent-soft">
                        {i > 0 && !last && <span className="tabular-nums" dir="ltr">0{i + 1} / 0{t.scenes.length}</span>}
                        {(i === 0 || last) && scene.eyebrow}
                        {i > 0 && !last && <span className="opacity-80">{scene.eyebrow}</span>}
                      </p>
                    </div>
                    <div className="overflow-hidden pb-2">
                      {i === 0 ? (
                        // Opening scene: the brand itself, as the page's h1
                        <h1 data-line className="mt-6">
                          <Logo onDark priority alt={scene.title} className="!h-[clamp(5.5rem,17vw,12.5rem)] drop-shadow-[0_4px_40px_rgb(11_23_51/0.5)]" />
                        </h1>
                      ) : (
                        <h2
                          data-line
                          className={`display mt-5 text-balance ${
                            last ? "text-[clamp(2.6rem,7.5vw,7rem)]" : "max-w-4xl text-[clamp(2.3rem,6.2vw,6rem)]"
                          }`}
                        >
                          {scene.title}
                        </h2>
                      )}
                    </div>
                    {scene.text && (
                      <div className="overflow-hidden">
                        <p data-line className="mt-6 font-serif text-[clamp(1.25rem,2.4vw,2rem)] font-light italic text-ivory/90">
                          {scene.text}
                        </p>
                      </div>
                    )}
                    {(last || reduced) && (
                      <div data-line className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4">
                        <a href="#contact" onClick={goContact} className="btn btn-accent" data-cursor={t.cta}>
                          {t.cta}
                        </a>
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!reduced && (
            <>
              {/* Scroll cue */}
              <div
                data-scroll-cue
                className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-ivory/80"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.4em] rtl:text-xs rtl:tracking-normal">{t.scroll}</span>
                <span className="relative block h-14 w-px overflow-hidden bg-ivory/20">
                  <span className="scroll-cue-line absolute inset-0 bg-accent" />
                </span>
              </div>

              {/* Chapter rail */}
              <div className="pointer-events-none absolute end-6 top-1/2 hidden -translate-y-1/2 items-stretch gap-4 md:flex lg:end-10">
                <ol ref={railRef} className="flex flex-col justify-between py-1 text-[0.65rem] tabular-nums text-ivory/40" dir="ltr">
                  {t.scenes.map((_, i) => (
                    <li key={i} className="transition-colors duration-700 data-[active]:text-accent-soft">
                      0{i + 1}
                    </li>
                  ))}
                </ol>
                <span className="relative block h-56 w-px bg-ivory/15">
                  <span data-rail-fill className="absolute inset-0 origin-top bg-accent" />
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
