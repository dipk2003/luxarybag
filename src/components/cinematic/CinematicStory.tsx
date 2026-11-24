// @ts-nocheck
/* Scroll-driven 3D walkthrough section ("step inside the store"). three.js + the story
   engine load lazily, so the rest of the page is not slowed down. */
import { useEffect, useRef } from "react";

export default function CinematicStory({ world, accent = "#d4a640", label = "3D walkthrough" }) {
  const ref = useRef(null);
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    Promise.all([import("three"), import("./story-engine")]).then(([THREE, engine]) => {
      if (!cancelled && ref.current) cleanup = engine.mountStory(THREE, ref.current, world, { accent, label });
    });
    return () => { cancelled = true; cleanup(); };
  }, [world, accent, label]);
  return <section ref={ref} aria-label={label} style={{ position: "relative", background: "#000" }} />;
}
