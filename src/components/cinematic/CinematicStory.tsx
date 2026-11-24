// @ts-nocheck
/* Scroll-driven 3D walkthrough section ("step inside the store"). three.js and the story engine
   are downloaded only when the visitor scrolls near the section, so the page itself loads fast. */
import { useEffect, useRef } from "react";

export default function CinematicStory({ world, accent = "#d4a640", label = "3D walkthrough", scenes = 6 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let cleanup = () => {};
    let cancelled = false;
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      Promise.all([import("three"), import("./story-engine")]).then(([THREE, engine]) => {
        if (!cancelled && ref.current) cleanup = engine.mountStory(THREE, ref.current, world, { accent, label });
      });
    }, { rootMargin: "60% 0px" });
    near.observe(node);
    return () => { cancelled = true; near.disconnect(); cleanup(); };
  }, [world, accent, label]);
  return <section ref={ref} aria-label={label} style={{ position: "relative", background: "#050505", height: `${scenes * 100}vh` }} />;
}
