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
    import("./cinematic3d").then(({ mountCinematicScene }) => {
      if (!cancelled && ref.current) cleanup = mountCinematicScene(ref.current, preset);
    });
    return () => { cancelled = true; cleanup(); };
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
