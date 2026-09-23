"use client";

import { useEffect } from "react";

/** Adds `.is-visible` to every [data-reveal] element as it enters the viewport (CSS does the rest). */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    // A fully clipped element never "intersects", so masked elements are watched through their parent.
    const targets = new Map<Element, HTMLElement>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (targets.get(entry.target) ?? entry.target).classList.add("is-visible");
          io.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    els.forEach((el) => {
      const watched = el.dataset.reveal === "mask" && el.parentElement ? el.parentElement : el;
      targets.set(watched, el);
      io.observe(watched);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
