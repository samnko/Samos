"use client";

import { useEffect, useRef } from "react";

/** A discreet two-part cursor (dot + trailing ring) for mouse users only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        lag.x = pos.x;
        lag.y = pos.y;
        dot.current!.style.opacity = ring.current!.style.opacity = "1";
      }
      const target = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-cursor], label, select");
      const text = target?.dataset.cursor;
      ring.current!.dataset.state = text ? "label" : target ? "hover" : "";
      label.current!.textContent = text ?? "";
    };
    const leave = () => {
      visible = false;
      dot.current!.style.opacity = ring.current!.style.opacity = "0";
    };
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      dot.current!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.current!.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] hidden mix-blend-difference [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute left-0 top-0 opacity-0 transition-opacity duration-300">
        <span className="block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7f3ec]" />
      </div>
      <div ref={ring} className="group absolute left-0 top-0 opacity-0 transition-opacity duration-300">
        <span className="flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f7f3ec]/70 transition-[width,height,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=hover]:h-14 group-data-[state=hover]:w-14 group-data-[state=label]:h-20 group-data-[state=label]:w-20 group-data-[state=label]:bg-[#f7f3ec]">
          <span ref={label} className="text-[0.55rem] uppercase tracking-[0.2em] text-[#0e1820]" />
        </span>
      </div>
    </div>
  );
}
