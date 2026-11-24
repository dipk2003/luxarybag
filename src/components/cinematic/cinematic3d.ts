// @ts-nocheck
/* Cinematic 3D layer — a transparent three.js scene that sits between a hero's background
   image and its text. It adds depth and motion without changing layout or fonts.
   Presets: silk | gems | luxe | flame | festive. Respects prefers-reduced-motion and pauses offscreen. */
import * as THREE from "three";

const PRESETS = {
  // Banarasi silk: a flowing maroon/gold ribbon with drifting zari sparkles
  silk: { particles: 0xd4a640, glow: 0xb3313f, count: 420 },
  // Natural stones: faceted gems (turquoise, amber, rose quartz) and gold rings
  gems: { particles: 0xe8c48a, glow: 0x3f8f86, count: 260 },
  // Luxury bags: floating gold chain links and pearls
  luxe: { particles: 0xf2c14e, glow: 0xc8902b, count: 300 },
  // Candles: rising embers and soft bokeh
  flame: { particles: 0xffb15c, glow: 0xff8a3d, count: 380 },
  // Events: diya lights and falling marigold petals
  festive: { particles: 0xffd27a, glow: 0xff9a2e, count: 340 },
};

const edgeX = () => (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2.6);
const GOLD = () => new THREE.MeshStandardMaterial({ color: 0xe0b04a, emissive: 0x4a3008, emissiveIntensity: 0.9, metalness: 0.75, roughness: 0.28 });

function makeParticles(color, count, spread, size) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spread[0];
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    speeds[i] = 0.2 + Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color, size, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending,
    map: glowTexture(), alphaTest: 0.01,
  });
  const points = new THREE.Points(geometry, material);
  points.userData.speeds = speeds;
  return points;
}

let cachedGlow = null;
function glowTexture() {
  if (cachedGlow) return cachedGlow;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  cachedGlow = new THREE.CanvasTexture(canvas);
  return cachedGlow;
}

function buildSilk(scene) {
  const geometry = new THREE.PlaneGeometry(16, 5, 160, 40);
  const material = new THREE.MeshStandardMaterial({
    color: 0x9b2335, emissive: 0x2a0409, metalness: 0.5, roughness: 0.35,
    side: THREE.DoubleSide, transparent: true, opacity: 0.24, depthWrite: false,
  });
  const ribbon = new THREE.Mesh(geometry, material);
  ribbon.rotation.set(-0.9, 0.15, -0.25);
  ribbon.position.set(1.5, -3.1, -3);
  ribbon.userData.base = geometry.attributes.position.array.slice();
  scene.add(ribbon);
  const gold = GOLD();
  const motifs = [];
  for (let i = 0; i < 5; i += 1) {
    const motif = new THREE.Mesh(new THREE.TorusGeometry(0.28 + Math.random() * 0.2, 0.025, 12, 64), gold);
    motif.position.set(edgeX(), (Math.random() - 0.5) * 4, -1 - Math.random() * 2);
    motif.userData.spin = 0.2 + Math.random() * 0.4;
    scene.add(motif);
    motifs.push(motif);
  }
  return (t) => {
    const array = geometry.attributes.position.array;
    const base = ribbon.userData.base;
    for (let i = 0; i < array.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      array[i + 2] = Math.sin(x * 0.7 + t * 0.9) * 0.45 + Math.cos(y * 1.3 + t * 0.6) * 0.25;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    motifs.forEach((motif, index) => {
      motif.rotation.x = t * motif.userData.spin;
      motif.rotation.y = t * motif.userData.spin * 0.7;
      motif.position.y += Math.sin(t + index) * 0.002;
    });
  };
}

function buildGems(scene) {
  const colors = [0x3fb6a8, 0xd98c2b, 0xe7a8b8, 0x8fc7e8, 0xc9a227];
  const gems = [];
  for (let i = 0; i < 7; i += 1) {
    const geometry = i % 3 === 0 ? new THREE.OctahedronGeometry(0.2 + Math.random() * 0.12, 0)
      : i % 3 === 1 ? new THREE.IcosahedronGeometry(0.18 + Math.random() * 0.1, 0)
        : new THREE.DodecahedronGeometry(0.17 + Math.random() * 0.1, 0);
    const material = new THREE.MeshPhysicalMaterial({
      color: colors[i % colors.length], metalness: 0.05, roughness: 0.08, transmission: 0.55, thickness: 0.6,
      clearcoat: 1, flatShading: true, transparent: true, opacity: 0.92,
    });
    const gem = new THREE.Mesh(geometry, material);
    gem.position.set(edgeX(), (Math.random() - 0.5) * 4.6, -0.8 - Math.random() * 2.5);
    gem.userData = { spin: 0.2 + Math.random() * 0.5, phase: Math.random() * 6 };
    scene.add(gem);
    gems.push(gem);
  }
  const gold = GOLD();
  for (let i = 0; i < 2; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 20, 64), gold);
    ring.position.set(edgeX(), (Math.random() - 0.5) * 4, -1.5);
    ring.userData = { spin: 0.3 + Math.random() * 0.3, phase: Math.random() * 6 };
    scene.add(ring);
    gems.push(ring);
  }
  return (t) => gems.forEach((gem) => {
    gem.rotation.x = t * gem.userData.spin;
    gem.rotation.y = t * gem.userData.spin * 1.3;
    gem.position.y += Math.sin(t * 0.8 + gem.userData.phase) * 0.003;
  });
}

function buildLuxe(scene) {
  const gold = GOLD();
  const pearl = new THREE.MeshPhysicalMaterial({ color: 0xf8f1e7, roughness: 0.15, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color(0xffe9cf) });
  const chain = new THREE.Group();
  const link = new THREE.TorusGeometry(0.22, 0.05, 16, 40);
  for (let i = 0; i < 14; i += 1) {
    const piece = new THREE.Mesh(link, gold);
    piece.scale.set(1, 1.6, 1);
    piece.position.set(i * 0.34 - 2.3, Math.sin(i * 0.5) * 0.35, 0);
    piece.rotation.y = i % 2 ? Math.PI / 2 : 0;
    chain.add(piece);
  }
  chain.position.set(1.2, 2.3, -3.2);
  chain.scale.setScalar(0.62);
  chain.rotation.z = -0.35;
  scene.add(chain);
  const pearls = [];
  for (let i = 0; i < 7; i += 1) {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.07 + Math.random() * 0.08, 32, 24), pearl);
    sphere.position.set(edgeX(), (Math.random() - 0.5) * 4.6, -0.8 - Math.random() * 2.5);
    sphere.userData.phase = Math.random() * 6;
    scene.add(sphere);
    pearls.push(sphere);
  }
  return (t) => {
    chain.rotation.x = Math.sin(t * 0.5) * 0.3;
    chain.position.y = 2.3 + Math.sin(t * 0.7) * 0.15;
    chain.children.forEach((piece, index) => { piece.position.y = Math.sin(index * 0.5 + t * 1.2) * 0.35; });
    pearls.forEach((sphere) => { sphere.position.y += Math.sin(t + sphere.userData.phase) * 0.003; });
  };
}

function buildFlame(scene) {
  const orbs = [];
  for (let i = 0; i < 12; i += 1) {
    const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: i % 2 ? 0xffb15c : 0xffd9a0, transparent: true, opacity: 0.25 + Math.random() * 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
    const size = 0.6 + Math.random() * 1.6;
    orb.scale.set(size, size, 1);
    orb.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, -2 - Math.random() * 3);
    orb.userData.phase = Math.random() * 6;
    scene.add(orb);
    orbs.push(orb);
  }
  return (t) => orbs.forEach((orb) => {
    orb.material.opacity = 0.2 + (Math.sin(t * 1.5 + orb.userData.phase) + 1) * 0.15;
  });
}

function buildFestive(scene) {
  const diyas = [];
  for (let i = 0; i < 14; i += 1) {
    const light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: i % 3 ? 0xffc46b : 0xff8a2e, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    const size = 0.35 + Math.random() * 0.6;
    light.scale.set(size, size, 1);
    light.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, -1 - Math.random() * 3);
    light.userData.phase = Math.random() * 6;
    scene.add(light);
    diyas.push(light);
  }
  const petalGeometry = new THREE.CircleGeometry(0.07, 6);
  petalGeometry.scale(1, 0.6, 1);
  const petals = [];
  for (let i = 0; i < 70; i += 1) {
    const petal = new THREE.Mesh(petalGeometry, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffa21f : 0xffcf33, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    petal.position.set((Math.random() - 0.5) * 12, Math.random() * 7 - 3.5, -0.5 - Math.random() * 3);
    petal.userData = { fall: 0.004 + Math.random() * 0.008, spin: Math.random() * 2, phase: Math.random() * 6 };
    scene.add(petal);
    petals.push(petal);
  }
  return (t) => {
    diyas.forEach((light) => { light.material.opacity = 0.35 + (Math.sin(t * 2 + light.userData.phase) + 1) * 0.2; });
    petals.forEach((petal) => {
      petal.position.y -= petal.userData.fall;
      petal.position.x += Math.sin(t + petal.userData.phase) * 0.003;
      petal.rotation.set(t * petal.userData.spin, t * petal.userData.spin * 0.7, 0);
      if (petal.position.y < -3.8) petal.position.y = 3.8;
    });
  };
}

const BUILDERS = { silk: buildSilk, gems: buildGems, luxe: buildLuxe, flame: buildFlame, festive: buildFestive };

/** Mounts the scene into `container` (positioned, sized by CSS). Returns a cleanup function. */
export function mountCinematicScene(container, presetName = "silk") {
  const preset = PRESETS[presetName] || PRESETS.silk;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.set(0, 0, 6);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const glow = new THREE.PointLight(preset.glow, 25, 15, 2);
  glow.position.set(-3, 1, 2);
  scene.add(glow);

  const update = BUILDERS[presetName] ? BUILDERS[presetName](scene) : () => {};
  const mobile = window.innerWidth < 768;
  const particles = makeParticles(preset.particles, mobile ? Math.round(preset.count * 0.5) : preset.count, [14, 8, 6], presetName === "festive" ? 0.09 : 0.07);
  scene.add(particles);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (event) => {
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let visible = true;
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  intersection.observe(container);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rising = presetName === "flame" || presetName === "silk" || presetName === "festive";
  const clock = new THREE.Clock();
  let frameId = 0;
  const frame = () => {
    frameId = requestAnimationFrame(frame);
    if (!visible) return;
    const t = reduce ? 0 : clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const scrolled = Math.min(1, window.scrollY / Math.max(1, container.clientHeight));
    camera.position.x = pointer.x * 0.45;
    camera.position.y = -pointer.y * 0.3 - scrolled * 1.2;
    camera.position.z = 6 - scrolled * 1.5;
    camera.lookAt(0, -scrolled * 0.8, 0);
    if (!reduce) {
      update(t);
      const array = particles.geometry.attributes.position.array;
      const speeds = particles.userData.speeds;
      for (let i = 0; i < speeds.length; i += 1) {
        array[i * 3 + 1] += (rising ? 1 : 0.4) * speeds[i] * 0.004;
        array[i * 3] += Math.sin(t * 0.5 + i) * 0.0015;
        if (array[i * 3 + 1] > 4) array[i * 3 + 1] = -4;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  };
  frame();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("pointermove", onPointer);
    resizeObserver.disconnect();
    intersection.disconnect();
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      materials.forEach((material) => material.dispose?.());
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}

/* Cinematic page motion: scroll progress bar, letterbox/rise reveals for sections and their
   direct children, and a gentle 3D tilt on cards. Works on any existing layout. */
export function mountCinematicMotion({ accent = "#c9a227", root = document.body } = {}) {
  if (typeof window === "undefined") return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const style = document.createElement("style");
  style.dataset.cinematic = "true";
  style.textContent = `
    .cine-progress{position:fixed;inset:0 0 auto;height:3px;z-index:9999;transform-origin:0 50%;transform:scaleX(0);background:${accent};pointer-events:none}
    .cine-reveal{opacity:0;transform:translateY(42px);transition:opacity 1s cubic-bezier(.2,.7,.1,1),transform 1.1s cubic-bezier(.2,.7,.1,1)}
    .cine-reveal.cine-in{opacity:1;transform:none}
    .cine-letterbox{clip-path:inset(14% 0 14% 0);transition:clip-path 1.3s cubic-bezier(.2,.7,.1,1)}
    .cine-letterbox.cine-in{clip-path:inset(0 0 0 0)}
    @media (prefers-reduced-motion: reduce){.cine-reveal,.cine-letterbox{opacity:1;transform:none;clip-path:none;transition:none}}
  `;
  document.head.appendChild(style);
  const bar = document.createElement("div");
  bar.className = "cine-progress";
  document.body.appendChild(bar);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (reduce) return () => { window.removeEventListener("scroll", onScroll); bar.remove(); style.remove(); };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("cine-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  const seen = new WeakSet();
  const scan = () => {
    // Skip the first section (the hero has its own motion) and anything already handled
    const sections = Array.from(root.querySelectorAll("main section, section")).slice(1);
    sections.forEach((section) => {
      section.querySelectorAll(":scope img, :scope video").forEach((media) => {
        const frame = media.parentElement;
        if (!frame || seen.has(frame) || frame.closest(".cine-letterbox") || frame.closest("[data-cine-story]")) return;
        if (frame.getBoundingClientRect().height < 120) return;
        seen.add(frame);
        frame.classList.add("cine-letterbox");
        observer.observe(frame);
      });
      const blocks = section.querySelectorAll(":scope h2, :scope h3, :scope p, :scope article");
      let delay = 0;
      blocks.forEach((block) => {
        if (seen.has(block) || block.closest(".cine-reveal") || block.closest("header, nav, footer, [role=dialog], [data-cine-story]")) return;
        // Never fight existing transforms/animations (Tailwind translate, framer-motion inline styles)
        if (getComputedStyle(block).transform !== "none" || /transform|opacity/.test(block.getAttribute("style") || "")) { seen.add(block); return; }
        seen.add(block);
        block.classList.add("cine-reveal");
        block.style.transitionDelay = `${Math.min(delay, 0.45)}s`;
        delay += 0.05;
        observer.observe(block);
      });
    });
  };
  scan();
  // SPA route changes and async data: rescan when the DOM grows
  const mutation = new MutationObserver(() => window.requestAnimationFrame(scan));
  mutation.observe(root, { childList: true, subtree: true });

  // Gentle tilt for product / service cards
  const onMove = (event) => {
    const card = event.target.closest?.("article, [class*='card'], [class*='Card']");
    if (!card || card.closest("header, nav, footer") || card.getBoundingClientRect().width > 600) return;
    if (!card.dataset.cineTilt) card.dataset.cineTilt = getComputedStyle(card).transform === "none" && !/transform/.test(card.getAttribute("style") || "") ? "1" : "0";
    if (card.dataset.cineTilt !== "1") return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
    card.style.transition = "transform .25s ease-out";
    card.onpointerleave = () => { card.style.transform = ""; };
  };
  if (!window.matchMedia("(hover: none)").matches) document.addEventListener("pointermove", onMove, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("pointermove", onMove);
    mutation.disconnect();
    observer.disconnect();
    bar.remove();
    style.remove();
  };
}
