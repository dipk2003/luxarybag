// @ts-nocheck
/* Cinematic layer components. CinematicScene sits inside a hero (absolute, behind the text);
   CinematicMotion adds scroll reveals + progress bar to public pages. three.js loads lazily. */
import { useEffect, useRef } from "react";

const SKIP_MOTION = /^\/(admin|super-admin|dashboard|account|login|signup|auth|checkout)/;

export function CinematicScene({ preset = "silk", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    // Start after the page is interactive so the 3D layer never delays first paint
    const begin = () => import("./cinematic3d").then(({ mountCinematicScene }) => {
      if (!cancelled && ref.current) cleanup = mountCinematicScene(ref.current, preset);
    });
    const idle = window.requestIdleCallback ? window.requestIdleCallback(begin, { timeout: 2500 }) : window.setTimeout(begin, 1200);
    return () => { cancelled = true; if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else window.clearTimeout(idle); cleanup(); };
  }, [preset]);
  return <div ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`} style={{ zIndex: 1 }} />;
}

export function CinematicMotion({ accent = "#c9a227", path = "" }) {
  useEffect(() => {
    const current = path || (typeof window !== "undefined" ? window.location.pathname : "/");
    if (SKIP_MOTION.test(current)) return undefined;
    let cleanup = () => {};
    let cancelled = false;
    import("./cinematic3d").then(({ mountCinematicMotion }) => {
      if (!cancelled) cleanup = mountCinematicMotion({ accent });
    });
    return () => { cancelled = true; cleanup(); };
  }, [accent, path]);
  return null;
}
