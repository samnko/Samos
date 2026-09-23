"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import manifest from "@/public/frames/manifest.json";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import type { Dictionary } from "@/lib/i18n/fr";
import Preloader from "./Preloader";

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

// Poster for reduced motion / no-JS: a frame from the founders' terrace scene.
const POSTER_INDEX = Math.min(COUNT - 1, SCENES[4] + Math.round((COUNT - SCENES[4]) / 4));

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
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    // On phones, every other frame is plenty (the scrub interpolates visually) and halves the payload.
    let stride = portrait && COUNT > 360 ? 2 : 1;
    if (conn?.saveData) stride *= 2;

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

    const CONCURRENCY = 6;
    let cursor = 0;
    const worker = async () => {
      while (!disposed && cursor < queue.length) await loadFrame(queue[cursor++]);
    };
    for (let k = 0; k < CONCURRENCY; k++) worker();

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
        const end = SCENES[i + 1] ?? COUNT;
        const len = end - start;
        const inner = el.querySelectorAll("[data-line]");
        if (i === 0) {
          tl.to(el, { autoAlpha: 0, y: -40, duration: len * 0.3, ease: "power1.in" }, start + len * 0.35);
          return;
        }
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: len * 0.2, ease: "power1.out" }, start + len * 0.12);
        tl.fromTo(inner, { y: 48 }, { y: 0, stagger: len * 0.03, duration: len * 0.3, ease: "power2.out" }, start + len * 0.12);
        if (i < scenes.length - 1) {
          tl.to(el, { autoAlpha: 0, y: -32, duration: len * 0.2, ease: "power1.in" }, start + len * 0.72);
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
        section.querySelectorAll("[data-scene='0'] [data-line]"),
        { yPercent: 110 },
        { yPercent: 0, duration: 1.6, stagger: 0.12, ease: "expo.out", delay: 0.15 },
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
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(14_24_32/0.45)_100%)]" />
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
                      : "flex-col justify-end pb-[18vh] md:pb-[16vh]"
                  }`}
                >
                  <div className={centered ? "flex max-w-5xl flex-col items-center" : "container-luxe"}>
                    <div className="overflow-hidden pb-1">
                      <p data-line className="eyebrow text-gold-soft">
                        {i > 0 && !last && <span className="tabular-nums" dir="ltr">0{i + 1} / 0{t.scenes.length}</span>}
                        {(i === 0 || last) && scene.eyebrow}
                        {i > 0 && !last && <span className="opacity-80">{scene.eyebrow}</span>}
                      </p>
                    </div>
                    <div className="overflow-hidden pb-2">
                      <h2
                        data-line
                        className={`display mt-5 text-balance ${
                          i === 0
                            ? "text-[clamp(3.1rem,11vw,10rem)] leading-[0.92]"
                            : last
                              ? "text-[clamp(2.6rem,7.5vw,7rem)]"
                              : "max-w-4xl text-[clamp(2.3rem,6.2vw,6rem)]"
                        }`}
                      >
                        {i === 0 ? <span className="block">{scene.title}</span> : scene.title}
                      </h2>
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
                        <a href="#contact" onClick={goContact} className="btn btn-gold" data-cursor={t.cta}>
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
                <span className="text-[0.65rem] uppercase tracking-[0.4em]">{t.scroll}</span>
                <span className="relative block h-14 w-px overflow-hidden bg-ivory/20">
                  <span className="scroll-cue-line absolute inset-0 bg-gold" />
                </span>
              </div>

              {/* Chapter rail */}
              <div className="pointer-events-none absolute end-6 top-1/2 hidden -translate-y-1/2 items-stretch gap-4 md:flex lg:end-10">
                <ol ref={railRef} className="flex flex-col justify-between py-1 text-[0.65rem] tabular-nums text-ivory/40" dir="ltr">
                  {t.scenes.map((_, i) => (
                    <li key={i} className="transition-colors duration-700 data-[active]:text-gold-soft">
                      0{i + 1}
                    </li>
                  ))}
                </ol>
                <span className="relative block h-56 w-px bg-ivory/15">
                  <span data-rail-fill className="absolute inset-0 origin-top bg-gold" />
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
