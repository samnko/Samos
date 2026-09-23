import type Lenis from "lenis";

let instance: Lenis | null = null;
export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};
export const getLenis = () => instance;

/** Smooth-scrolls to an element or y offset, falling back to native scrolling. */
export const scrollToTarget = (target: string | number) => {
  if (instance) {
    instance.scrollTo(target, { duration: 1.6 });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target });
  else document.querySelector(target)?.scrollIntoView();
};
