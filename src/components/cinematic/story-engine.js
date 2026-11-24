// @ts-nocheck
/* Cinematic 3D Story — a scroll-driven walkthrough of a procedurally built place
   (a saree shop, a gym, a clinic …). The page section is N screens tall; a sticky canvas
   shows the 3D world while the camera travels along a path, one scene per screen,
   with captions in the site's own fonts. Usage: mountStory(THREE, sectionElement, "saree"). */

/* ------------------------------------------------------------------ helpers */
function makeHelpers(THREE) {
  const tex = (width, height, draw) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    draw(canvas.getContext("2d"), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  };
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
  const box = (w, h, d, material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);

  const planks = (base, line) => tex(512, 512, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) {
      c.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`; c.fillRect(0, y, w, 64);
      c.fillStyle = line; c.fillRect(0, y, w, 3);
      for (let x = (y / 64) % 2 ? 0 : 128; x < w; x += 256) c.fillRect(x, y, 3, 64);
    }
  });
  const tiles = (base, line, size = 64) => tex(512, 512, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h); c.strokeStyle = line; c.lineWidth = 3;
    for (let x = 0; x <= w; x += size) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y <= h; y += size) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  });
  const sign = (text, { bg = "#1a1a1a", fg = "#f5d48a", font = "700 120px Georgia, serif", w = 1024, h = 256 } = {}) => tex(w, h, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = fg; c.font = font; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, w / 2, h / 2 + 6);
  });
  // Woven fabric: base colour, zari border, butti motifs
  const css = (value) => (typeof value === "number" ? `#${value.toString(16).padStart(6, "0")}` : value);
  const fabric = (base, zari, motif = true) => tex(256, 512, (c, w, h) => {
    base = css(base); zari = css(zari);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    c.fillStyle = zari; c.fillRect(0, h - 70, w, 70); c.fillRect(0, 0, w, 18);
    c.globalAlpha = 0.5; for (let x = 0; x < w; x += 16) c.fillRect(x, h - 90, 8, 12); c.globalAlpha = 1;
    if (motif) for (let y = 40; y < h - 110; y += 46) for (let x = (y / 46) % 2 ? 22 : 44; x < w; x += 44) {
      c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
    }
  });

  // Interior shell: floor, three walls, ceiling. Returns group.
  const room = (scene, { w, d, h, floor, wall, ceiling = 0x1b1b1b, z = 0 }) => {
    const group = new THREE.Group();
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: floor, roughness: 0.6 }));
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping; floor.repeat.set(w / 4, d / 4);
    floorMesh.rotation.x = -Math.PI / 2; group.add(floorMesh);
    const wallMaterial = std(wall);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMaterial); back.position.set(0, h / 2, -d / 2); group.add(back);
    const left = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMaterial); left.rotation.y = Math.PI / 2; left.position.set(-w / 2, h / 2, 0); group.add(left);
    const right = left.clone(); right.rotation.y = -Math.PI / 2; right.position.x = w / 2; group.add(right);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std(ceiling)); top.rotation.x = Math.PI / 2; top.position.y = h; group.add(top);
    group.position.z = z;
    scene.add(group);
    return group;
  };

  // Front wall with a doorway and a sign above it
  const facade = (scene, { w, h, z, doorW = 3, doorH = 3.4, wall, signTexture, frame = 0xc9a24a }) => {
    const material = std(wall);
    const side = (w - doorW) / 2;
    [-1, 1].forEach((s) => { const part = box(side, h, 0.3, material); part.position.set(s * (doorW / 2 + side / 2), h / 2, z); scene.add(part); });
    const lintel = box(doorW, h - doorH, 0.3, material); lintel.position.set(0, doorH + (h - doorH) / 2, z); scene.add(lintel);
    const trim = std(frame, { metalness: 0.8, roughness: 0.3 });
    [-1, 1].forEach((s) => { const post = box(0.12, doorH, 0.36, trim); post.position.set(s * doorW / 2, doorH / 2, z); scene.add(post); });
    const beam = box(doorW + 0.24, 0.12, 0.36, trim); beam.position.set(0, doorH, z); scene.add(beam);
    if (signTexture) {
      const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), new THREE.MeshBasicMaterial({ map: signTexture }));
      board.position.set(0, doorH + 0.9, z + 0.17); scene.add(board);
    }
  };

  const glowBulb = (scene, x, y, z, color, intensity = 6, distance = 9) => {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color }));
    bulb.position.set(x, y, z); scene.add(bulb);
    const light = new THREE.PointLight(color, intensity, distance, 2); light.position.set(x, y - 0.2, z); scene.add(light);
    return light;
  };

  const chandelier = (scene, x, y, z, gold) => {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 8, 48), gold); ring.rotation.x = Math.PI / 2; group.add(ring);
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      const drop = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), new THREE.MeshBasicMaterial({ color: 0xfff1c9 }));
      drop.position.set(Math.cos(a) * 0.6, -0.15, Math.sin(a) * 0.6); group.add(drop);
    }
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1), gold); rod.position.y = 0.5; group.add(rod);
    group.position.set(x, y, z); scene.add(group);
    const light = new THREE.PointLight(0xffd9a0, 8, 9, 2); light.position.set(x, y - 0.4, z); scene.add(light);
    return group;
  };

  // Mannequin wearing a saree (wrapped skirt + pallu over the shoulder)
  const mannequin = (scene, x, z, rotY, drape, body = 0xe9dccb) => {
    const group = new THREE.Group();
    const skin = std(body, { roughness: 0.4 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.08, 32), std(0x2a2522, { metalness: 0.6 })); base.position.y = 0.04; group.add(base);
    const torso = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.17, 0], [0.2, 0.2], [0.16, 0.45], [0.22, 0.65], [0.14, 0.8], [0.05, 0.88], [0, 0.9]].map(([a, b]) => new THREE.Vector2(a, b)), 32), skin);
    torso.position.y = 1.1; group.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), skin); head.scale.y = 1.2; head.position.y = 2.15; group.add(head);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.42, 1.1, 40, 8, true), new THREE.MeshStandardMaterial({ map: drape, side: THREE.DoubleSide, roughness: 0.45, metalness: 0.15 }));
    skirt.position.y = 0.62; group.add(skirt);
    const pallu = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.25, 4, 12), new THREE.MeshStandardMaterial({ map: drape, side: THREE.DoubleSide, roughness: 0.45, metalness: 0.15 }));
    pallu.position.set(0.12, 1.45, -0.12); pallu.rotation.set(0.15, 0.4, -0.35); group.add(pallu);
    const blouse = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.28, 32), new THREE.MeshStandardMaterial({ map: drape, roughness: 0.45, metalness: 0.15 }));
    blouse.position.y = 1.62; group.add(blouse);
    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
    return group;
  };

  // Garment rail with hanging kurtas/suits (cut-out silhouettes)
  const garment = (color, trim) => tex(256, 384, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = color;
    c.beginPath(); c.moveTo(90, 20); c.lineTo(166, 20); c.lineTo(230, 80); c.lineTo(205, 120); c.lineTo(185, 100); c.lineTo(200, 370); c.lineTo(56, 370); c.lineTo(71, 100); c.lineTo(51, 120); c.lineTo(26, 80); c.closePath(); c.fill();
    c.fillStyle = trim; c.fillRect(56, 340, 144, 30); c.fillRect(118, 20, 20, 160);
    c.globalAlpha = 0.45; for (let y = 140; y < 330; y += 28) for (let x = 80; x < 190; x += 28) { c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill(); }
  });
  const rail = (scene, x, z, rotY, palette, gold) => {
    const group = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 12), gold); bar.rotation.z = Math.PI / 2; bar.position.y = 2.1; group.add(bar);
    [-1.6, 1.6].forEach((px) => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 12), gold); leg.position.set(px, 1.05, 0); group.add(leg); });
    palette.forEach(([color, trim], index) => {
      const piece = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.95), new THREE.MeshStandardMaterial({ map: garment(color, trim), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, roughness: 0.6 }));
      piece.position.set(-1.35 + index * (2.7 / Math.max(1, palette.length - 1)), 1.58, 0.02 * index);
      piece.rotation.y = 0.5;
      group.add(piece);
    });
    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
    return group;
  };

  // Wall shelving with folded fabric stacks
  const shelves = (scene, x, z, rotY, palette, wood) => {
    const group = new THREE.Group();
    const frame = std(wood, { roughness: 0.5 });
    for (let level = 0; level < 5; level += 1) {
      const shelf = box(3, 0.06, 0.6, frame); shelf.position.set(0, 0.35 + level * 0.62, 0); group.add(shelf);
      for (let i = 0; i < 6; i += 1) {
        const [base, zari] = palette[(i + level) % palette.length];
        const stack = box(0.42, 0.26, 0.48, [
          std(zari, { metalness: 0.6, roughness: 0.35 }), std(zari, { metalness: 0.6, roughness: 0.35 }),
          new THREE.MeshStandardMaterial({ map: fabric(base, zari), roughness: 0.5 }), std(base),
          new THREE.MeshStandardMaterial({ map: fabric(base, zari), roughness: 0.5 }), std(base),
        ]);
        stack.position.set(-1.2 + i * 0.48, 0.52 + level * 0.62, 0.02); group.add(stack);
      }
    }
    [-1.5, 1.5].forEach((px) => { const side = box(0.06, 3.3, 0.62, frame); side.position.set(px, 1.65, 0); group.add(side); });
    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
    return group;
  };

  const dumbbell = (scale, steel, rubber, accent) => {
    const group = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16), steel); bar.rotation.z = Math.PI / 2; group.add(bar);
    [-1, 1].forEach((s) => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24), rubber); plate.rotation.z = Math.PI / 2; plate.position.x = s * 0.3; group.add(plate);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 8, 32), accent); band.rotation.y = Math.PI / 2; band.position.x = s * 0.36; group.add(band);
    });
    group.scale.setScalar(scale);
    return group;
  };

  return { tex, std, box, planks, tiles, sign, fabric, room, facade, glowBulb, chandelier, mannequin, rail, shelves, dumbbell, garment };
}

/* ------------------------------------------------------------------ worlds */
const WORLDS = {};

/* Banarasi saree & suit store: street → doorway → saree wall → bridal mannequins → suits → counter */
WORLDS.saree = (THREE, scene, h) => {
  scene.background = new THREE.Color(0x140708);
  scene.fog = new THREE.Fog(0x140708, 10, 34);
  const gold = h.std(0xd4a640, { metalness: 0.85, roughness: 0.25, emissive: 0x2a1a02 });
  const palette = [[0x8f1d2c, 0xd4a640], [0x1f3d7a, 0xd8b45a], [0x0f5a4a, 0xe3c06a], [0xc2185b, 0xf0cf73], [0x6a1b9a, 0xd4a640], [0xe07b1a, 0xf5dd8a]];
  // Street + facade
  const street = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshStandardMaterial({ map: h.tiles("#3a2f2a", "#2a211d", 128), roughness: 0.9 }));
  street.rotation.x = -Math.PI / 2; street.position.z = 7; scene.add(street);
  h.facade(scene, { w: 14, h: 6, z: 0, wall: 0x5c1a22, signTexture: h.sign("VIRASAT", { bg: "#3b0b12", fg: "#e7c26a", font: "700 150px Georgia, serif" }) });
  [-4.5, 4.5].forEach((x) => h.glowBulb(scene, x, 4.2, 0.6, 0xffc46b, 5, 7));
  // Interior
  h.room(scene, { w: 14, d: 22, h: 6, floor: h.planks("#5a3a22", "#3e2716"), wall: 0x6e2430, ceiling: 0x2a0d10, z: -11 });
  h.shelves(scene, -6.6, -5, Math.PI / 2, palette, 0x4a2b17);
  h.shelves(scene, -6.6, -9, Math.PI / 2, palette.slice().reverse(), 0x4a2b17);
  // Bridal mannequins on a podium
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.25, 48), h.std(0x2b1410, { metalness: 0.3 })); podium.position.set(2.5, 0.12, -9); scene.add(podium);
  h.mannequin(scene, 1.4, -9, 0.3, h.fabric("#9b1b2e", "#e2b955"));
  h.mannequin(scene, 2.6, -9.7, 0, h.fabric("#c2185b", "#f0cf73"));
  h.mannequin(scene, 3.8, -9, -0.3, h.fabric("#0f5a4a", "#e3c06a"));
  // Suits & kurtis rails
  h.rail(scene, 5.8, -13.5, -Math.PI / 2, [["#b71c3c", "#e7c26a"], ["#1f4e8c", "#d8b45a"], ["#2e7d32", "#f0cf73"], ["#f2e6d0", "#c9a24a"], ["#6a1b9a", "#e3c06a"]], gold);
  h.rail(scene, 5.8, -17.5, -Math.PI / 2, [["#e07b1a", "#f5dd8a"], ["#ad1457", "#e7c26a"], ["#004d40", "#d4a640"], ["#880e4f", "#f0cf73"]], gold);
  // Counter at the back
  const counter = h.box(4.5, 1.1, 1, h.std(0x3a2214, { roughness: 0.4 })); counter.position.set(0, 0.55, -20); scene.add(counter);
  const counterTop = h.box(4.7, 0.06, 1.15, gold); counterTop.position.set(0, 1.13, -20); scene.add(counterTop);
  const backSign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), new THREE.MeshBasicMaterial({ map: h.sign("Heritage woven in every thread", { bg: "#2a0d10", fg: "#e7c26a", font: "italic 64px Georgia, serif" }) }));
  backSign.position.set(0, 3.6, -21.9); scene.add(backSign);
  [-6, -10, -14, -18].forEach((z) => h.chandelier(scene, 0, 5.2, z, gold));
  scene.add(new THREE.HemisphereLight(0xffe2b8, 0x2a0d10, 0.7));
  return {
    keys: [
      { pos: [0, 1.7, 11], look: [0, 2.6, 0] },
      { pos: [0, 1.7, 2.5], look: [0, 1.8, -6] },
      { pos: [-2.5, 1.7, -6.5], look: [-6.6, 1.6, -7] },
      { pos: [0.5, 1.6, -5.8], look: [2.6, 1.3, -9.3] },
      { pos: [2.2, 1.6, -15.5], look: [5.8, 1.5, -15.5] },
      { pos: [0, 1.8, -15.5], look: [0, 1.6, -21] },
    ],
  };
};

/* Performance gym: neon entrance → dumbbell wall → power racks → cardio row → boxing zone → front desk */
WORLDS.gym = (THREE, scene, h) => {
  scene.background = new THREE.Color(0x07080a);
  scene.fog = new THREE.Fog(0x07080a, 10, 36);
  const volt = 0xd4ff3a;
  const steel = h.std(0xb9bcc2, { metalness: 1, roughness: 0.3 });
  const rubber = h.std(0x17181b, { roughness: 0.6 });
  const neon = new THREE.MeshBasicMaterial({ color: volt });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), h.std(0x222428, { roughness: 0.95 })); street.rotation.x = -Math.PI / 2; street.position.z = 7; scene.add(street);
  h.facade(scene, { w: 14, h: 6, z: 0, wall: 0x15171a, frame: volt, signTexture: h.sign("FORGE", { bg: "#0b0c0e", fg: "#d4ff3a", font: "900 170px Impact, Arial Black, sans-serif" }) });
  h.room(scene, { w: 16, d: 24, h: 6, floor: h.tiles("#1a1c1f", "#0d0e10", 128), wall: 0x202327, ceiling: 0x0c0d0f, z: -12 });
  // Neon strips along the ceiling
  [-4, 0, 4].forEach((x) => { const strip = h.box(0.08, 0.04, 22, neon); strip.position.set(x, 5.9, -12); scene.add(strip); });
  // Dumbbell rack (left wall)
  for (let tier = 0; tier < 3; tier += 1) {
    const shelf = h.box(5, 0.08, 0.7, steel); shelf.position.set(-7.4, 0.5 + tier * 0.55, -6); shelf.rotation.y = Math.PI / 2; scene.add(shelf);
    for (let i = 0; i < 8; i += 1) {
      const bell = h.dumbbell(0.75 + tier * 0.1, steel, rubber, neon);
      bell.position.set(-7.4, 0.66 + tier * 0.55, -8.2 + i * 0.6); bell.rotation.y = Math.PI / 2; scene.add(bell);
    }
  }
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.2), new THREE.MeshStandardMaterial({ color: 0x5d6873, metalness: 0.3, roughness: 0.12 }));
  mirror.rotation.y = Math.PI / 2; mirror.position.set(-7.95, 2.4, -6); scene.add(mirror);
  // Power racks with barbells (right side)
  [-6, -10].forEach((z) => {
    const frame = new THREE.Group();
    [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]].forEach(([x, dz]) => { const post = h.box(0.1, 2.6, 0.1, h.std(0x2a2d31, { metalness: 0.6 })); post.position.set(x, 1.3, dz); frame.add(post); });
    const top = h.box(2.2, 0.1, 1.3, h.std(0x2a2d31, { metalness: 0.6 })); top.position.y = 2.6; frame.add(top);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 12), steel); bar.rotation.z = Math.PI / 2; bar.position.y = 1.5; frame.add(bar);
    [-1.15, 1.15].forEach((x) => { const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 32), rubber); plate.rotation.z = Math.PI / 2; plate.position.set(x, 1.5, 0); frame.add(plate);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.015, 8, 48), neon); band.rotation.y = Math.PI / 2; band.position.set(x + Math.sign(x) * 0.06, 1.5, 0); frame.add(band); });
    frame.position.set(5.2, 0, z); frame.rotation.y = -Math.PI / 2; scene.add(frame);
    const platform = h.box(2.6, 0.06, 3, h.std(0x3a2a1c, { roughness: 0.6 })); platform.position.set(5.2, 0.03, z); scene.add(platform);
  });
  // Treadmills row
  for (let i = 0; i < 4; i += 1) {
    const mill = new THREE.Group();
    const deck = h.box(0.8, 0.2, 1.9, h.std(0x111214)); deck.position.y = 0.2; mill.add(deck);
    const belt = h.box(0.6, 0.02, 1.7, h.std(0x050505)); belt.position.y = 0.31; mill.add(belt);
    [-0.35, 0.35].forEach((x) => { const arm = h.box(0.06, 1.2, 0.06, steel); arm.position.set(x, 0.9, -0.8); mill.add(arm); });
    const screen = h.box(0.7, 0.4, 0.08, h.std(0x101215)); screen.position.set(0, 1.5, -0.85); mill.add(screen);
    const display = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.28), new THREE.MeshBasicMaterial({ color: volt })); display.position.set(0, 1.5, -0.8); mill.add(display);
    mill.position.set(-3 + i * 1.3, 0, -15); scene.add(mill);
  }
  // Boxing zone: hanging bags + ring floor
  const mat = h.box(6, 0.08, 5, h.std(0x1d3b2a)); mat.position.set(3.5, 0.04, -19.5); scene.add(mat);
  const bags = [];
  [[2, -18.5], [3.8, -20.3], [5.4, -18.8]].forEach(([x, z]) => {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.6), steel); chain.position.set(x, 5.2, z); scene.add(chain);
    const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.2, 8, 24), h.std(0x8b1d1d, { roughness: 0.5 })); bag.position.set(x, 3.4, z); scene.add(bag); bags.push(bag);
  });
  // Front desk
  const desk = h.box(4, 1.1, 0.9, h.std(0x141518)); desk.position.set(-3.5, 0.55, -21.5); scene.add(desk);
  const deskNeon = h.box(4, 0.05, 0.92, neon); deskNeon.position.set(-3.5, 1.12, -21.5); scene.add(deskNeon);
  const wallSign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.4), new THREE.MeshBasicMaterial({ map: h.sign("TRAIN LIKE IT MATTERS", { bg: "#0b0c0e", fg: "#d4ff3a", font: "900 90px Impact, Arial Black, sans-serif" }) }));
  wallSign.position.set(-1, 3.6, -23.9); scene.add(wallSign);
  scene.add(new THREE.HemisphereLight(0xcfd8e0, 0x0a0a0a, 0.8));
  [-4, -9, -14, -19].forEach((z) => h.glowBulb(scene, 0, 5.4, z, 0xf2f6ff, 10, 12));
  h.glowBulb(scene, -5, 4.5, -6, volt, 6, 8);
  h.glowBulb(scene, -5.5, 4.8, -9, 0xffffff, 8, 10);
  h.glowBulb(scene, 3.5, 4.8, -8, 0xffffff, 8, 10);
  return {
    keys: [
      { pos: [0, 1.7, 11], look: [0, 2.7, 0] },
      { pos: [-2.5, 1.7, -3], look: [-7.4, 1.2, -6] },
      { pos: [1.5, 1.6, -6.5], look: [5.2, 1.4, -8] },
      { pos: [-0.5, 2.2, -10.5], look: [-1, 0.8, -15.5] },
      { pos: [0.5, 1.8, -15.5], look: [3.8, 2.8, -19.5] },
      { pos: [-1.5, 1.8, -16.5], look: [-3, 2, -23] },
    ],
    update: (t) => bags.forEach((bag, index) => { bag.rotation.z = Math.sin(t * 1.4 + index) * 0.06; }),
  };
};

/* ------------------------------------------------------------------ mount */
const DEFAULT_CAPTIONS = {
  saree: [
    ["Step into Virasat", "Where the looms of Varanasi meet you at the door."],
    ["Come inside", "Warm light, gold zari and the hush of pure silk."],
    ["The saree wall", "Katan, organza and georgette — folded by colour, chosen by hand."],
    ["Bridal edit", "Drapes made for the day you will remember forever."],
    ["Suits & kurtis", "Banarasi suits for festive, office and everyday grace."],
    ["Take it home", "Explore the collection and order online."],
  ],
  gym: [
    ["Walk into FORGE", "The door opens at 5 AM. So does your excuse-free day."],
    ["The dumbbell wall", "2.5 to 50 kg, mirrored, racked and ready."],
    ["Power racks", "Squat, bench and deadlift platforms with coaches on the floor."],
    ["Cardio row", "Engine builders with performance tracking."],
    ["Boxing zone", "Bags, pads and a ring for real fight conditioning."],
    ["Your first session is free", "Say hello at the front desk."],
  ],
};

/* ---- shared furniture for the remaining worlds ---- */
function furniture(THREE, h) {
  const pedestalCase = (scene, x, z, content, { wood = 0x2b2420, glassTint = 0xffffff } = {}) => {
    const group = new THREE.Group();
    const base = h.box(1, 1, 1, h.std(wood, { roughness: 0.4 })); base.position.y = 0.5; group.add(base);
    const glass = h.box(0.95, 0.6, 0.95, new THREE.MeshPhysicalMaterial({ color: glassTint, transmission: 0.9, roughness: 0.05, thickness: 0.2, transparent: true, opacity: 0.25 }));
    glass.position.y = 1.3; group.add(glass);
    content.position.y = 1.12; group.add(content);
    group.position.set(x, 0, z); scene.add(group);
    return group;
  };
  const ring = (gold, gem) => {
    const group = new THREE.Group();
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 16, 48), gold); band.rotation.x = 0.25; group.add(band);
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), gem); stone.position.y = 0.12; group.add(stone);
    return group;
  };
  const necklace = (gold, beads) => {
    const group = new THREE.Group();
    for (let i = 0; i < 26; i += 1) {
      const a = Math.PI * (0.1 + (i / 25) * 0.8);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(i % 5 === 0 ? 0.045 : 0.028, 16, 12), i % 5 === 0 ? beads : gold);
      bead.position.set(Math.cos(a) * 0.28, -Math.sin(a) * 0.32, 0); group.add(bead);
    }
    return group;
  };
  const bag = (color, gold, size = 1) => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.46, 0.24, 4, 4, 2), h.std(color, { roughness: 0.35, metalness: 0.1 }));
    body.position.y = 0.23; group.add(body);
    const flap = h.box(0.64, 0.2, 0.26, h.std(color, { roughness: 0.3 })); flap.position.set(0, 0.38, 0.01); group.add(flap);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 12, 40, Math.PI), h.std(color, { roughness: 0.35 })); handle.position.y = 0.46; group.add(handle);
    const clasp = h.box(0.1, 0.06, 0.03, gold); clasp.position.set(0, 0.32, 0.14); group.add(clasp);
    group.scale.setScalar(size);
    return group;
  };
  const candle = (scene, x, y, z, color, height = 0.35, radius = 0.09, lit = true) => {
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24), h.std(color, { roughness: 0.55 }));
    wax.position.set(x, y + height / 2, z); scene.add(wax);
    if (!lit) return null;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 12), new THREE.MeshBasicMaterial({ color: 0xffc46b }));
    flame.position.set(x, y + height + 0.05, z); scene.add(flame);
    return flame;
  };
  const table = (scene, x, z, { w = 2, d = 1, h: height = 0.8, top = 0x5a3a22, round = false } = {}) => {
    const material = h.std(top, { roughness: 0.45 });
    const surface = round ? new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.06, 40), material) : h.box(w, 0.06, d, material);
    surface.position.set(x, height, z); scene.add(surface);
    const leg = round ? new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, height, 16), material) : null;
    if (leg) { leg.position.set(x, height / 2, z); scene.add(leg); }
    else [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = h.box(0.06, height, 0.06, material); l.position.set(x + sx * (w / 2 - 0.08), height / 2, z + sz * (d / 2 - 0.08)); scene.add(l); });
    return surface;
  };
  const chair = (scene, x, z, rotY, color) => {
    const group = new THREE.Group();
    const seat = h.box(0.45, 0.06, 0.45, h.std(color)); seat.position.y = 0.46; group.add(seat);
    const back = h.box(0.45, 0.55, 0.06, h.std(color)); back.position.set(0, 0.75, -0.2); group.add(back);
    [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => { const leg = h.box(0.04, 0.46, 0.04, h.std(0x222222)); leg.position.set(lx, 0.23, lz); group.add(leg); });
    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
  };
  const sofa = (scene, x, z, rotY, color) => {
    const group = new THREE.Group();
    const material = h.std(color, { roughness: 0.9 });
    const base = h.box(2.4, 0.42, 0.95, material); base.position.y = 0.21; group.add(base);
    const back = h.box(2.4, 0.55, 0.25, material); back.position.set(0, 0.68, -0.35); group.add(back);
    [-1.2, 1.2].forEach((ax) => { const arm = h.box(0.22, 0.6, 0.95, material); arm.position.set(ax, 0.42, 0); group.add(arm); });
    [-0.6, 0.6].forEach((cx) => { const cushion = h.box(1.05, 0.16, 0.7, h.std(color, { roughness: 1 })); cushion.position.set(cx, 0.5, 0.08); group.add(cushion); });
    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
  };
  const plant = (scene, x, z, scale = 1) => {
    const group = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 20), h.std(0xd8d2c4)); pot.position.y = 0.2; group.add(pot);
    for (let i = 0; i < 9; i += 1) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), h.std(0x3c6e47, { roughness: 0.8 }));
      leaf.scale.set(0.6, 1.4, 0.3); const a = (i / 9) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.16, 0.6 + (i % 3) * 0.22, Math.sin(a) * 0.16); leaf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); group.add(leaf);
    }
    group.scale.setScalar(scale); group.position.set(x, 0, z); scene.add(group);
  };
  const art = (scene, x, y, z, rotY, texture, w = 1.4, hgt = 1) => {
    const frame = h.box(w + 0.1, hgt + 0.1, 0.05, h.std(0x1d1a16)); frame.position.set(x, y, z); frame.rotation.y = rotY; scene.add(frame);
    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), new THREE.MeshBasicMaterial({ map: texture }));
    canvas.position.set(x + Math.sin(rotY) * 0.03, y, z + Math.cos(rotY) * 0.03); canvas.rotation.y = rotY; scene.add(canvas);
  };
  const abstract = (a, b, c) => h.tex(256, 192, (ctx, w, hh) => {
    ctx.fillStyle = a; ctx.fillRect(0, 0, w, hh);
    ctx.fillStyle = b; ctx.beginPath(); ctx.arc(w * 0.35, hh * 0.55, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c; ctx.fillRect(w * 0.55, hh * 0.2, 70, 110);
  });
  return { pedestalCase, ring, necklace, bag, candle, table, chair, sofa, plant, art, abstract };
}

/* Natural-stone jewellery boutique */
WORLDS.jewels = (THREE, scene, h) => {
  const f = furniture(THREE, h);
  scene.background = new THREE.Color(0x1a1512); scene.fog = new THREE.Fog(0x1a1512, 10, 32);
  const gold = h.std(0xd9ad52, { metalness: 0.9, roughness: 0.22, emissive: 0x2a1c05 });
  const gems = [0x3fb6a8, 0xd98c2b, 0xe7a8b8, 0x8fc7e8].map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.05, transmission: 0.4, clearcoat: 1, flatShading: true }));
  h.facade(scene, { w: 12, h: 6, z: 0, wall: 0x3b3029, frame: 0xd9ad52, signTexture: h.sign("Terra & Stone", { bg: "#2a221d", fg: "#e8cf9a", font: "500 120px Georgia, serif" }) });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), h.std(0x4a4038)); street.rotation.x = -Math.PI / 2; street.position.z = 7; scene.add(street);
  h.room(scene, { w: 12, d: 20, h: 5.5, floor: h.tiles("#efe6d8", "#d8ccb8", 128), wall: 0xe6dccb, ceiling: 0xf2ece2, z: -10 });
  // Ring cases
  [[-2.5, -5], [-2.5, -7.5], [2.5, -5], [2.5, -7.5]].forEach(([x, z], i) => {
    const tray = new THREE.Group();
    for (let k = 0; k < 3; k += 1) { const r = f.ring(gold, gems[(i + k) % gems.length]); r.scale.setScalar(1.25); r.position.set(-0.28 + k * 0.28, 0.08, 0); tray.add(r); }
    f.pedestalCase(scene, x, z, tray, { wood: 0x3a2e26 });
    h.glowBulb(scene, x, 4.6, z, 0xfff3dc, 4, 6);
  });
  // Necklace busts
  [[-1, -11], [1, -11.5]].forEach(([x, z], i) => {
    const bust = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.14, 0], [0.12, 0.25], [0.34, 0.55], [0.38, 0.72], [0.14, 0.84], [0.08, 1.05], [0, 1.06]].map(([a, b]) => new THREE.Vector2(a, b)), 32), h.std(0x2b2420, { roughness: 0.6 }));
    bust.position.set(x, 1, z); scene.add(bust);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.25, 1, 16), gold); stand.position.set(x, 0.5, z); scene.add(stand);
    const necklace = f.necklace(gold, gems[i]); necklace.scale.setScalar(1.15); necklace.position.set(x, 1.82, z + 0.3); scene.add(necklace);
  });
  // Gemstone wall
  for (let r = 0; r < 4; r += 1) for (let c = 0; c < 8; c += 1) {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), gems[(r + c) % gems.length]);
    gem.position.set(-2.8 + c * 0.8, 1.3 + r * 0.7, -19.6); gem.rotation.y = c; scene.add(gem);
  }
  const counter = h.box(4, 1, 0.8, h.std(0x3a2e26)); counter.position.set(3.5, 0.5, -16); counter.rotation.y = -0.4; scene.add(counter);
  scene.add(new THREE.HemisphereLight(0xfff3dc, 0x6b5a48, 0.9));
  [-6, -11, -16].forEach((z) => h.chandelier(scene, 0, 4.9, z, gold));
  const spin = [];
  scene.traverse((o) => { if (o.geometry?.type === "OctahedronGeometry") spin.push(o); });
  return {
    keys: [
      { pos: [0, 1.7, 10], look: [0, 2.5, 0] }, { pos: [0, 1.7, 1.5], look: [0, 1.5, -6] },
      { pos: [-0.6, 1.9, -4.5], look: [-2.5, 1.15, -6] }, { pos: [0, 1.7, -8.6], look: [0, 1.6, -11.2] },
      { pos: [0, 1.9, -15], look: [0, 2.3, -19.6] }, { pos: [0.5, 1.7, -13], look: [3.5, 1, -16] },
    ],
    update: (t) => spin.forEach((g, i) => { g.rotation.y = t * 0.6 + i; }),
  };
};

/* Luxury bag boutique */
WORLDS.bags = (THREE, scene, h) => {
  const f = furniture(THREE, h);
  scene.background = new THREE.Color(0x0b0a09); scene.fog = new THREE.Fog(0x0b0a09, 10, 32);
  const gold = h.std(0xe0b04a, { metalness: 0.9, roughness: 0.22, emissive: 0x2a1a02 });
  const colors = [0xc62828, 0x1b1b1b, 0xd7b98e, 0x2e4a7d, 0x6d1b3f, 0xf2e6d0, 0x0f5a4a, 0xb7791f];
  h.facade(scene, { w: 12, h: 6, z: 0, wall: 0x141210, frame: 0xe0b04a, signTexture: h.sign("LUXEBAG BY RAIYA", { bg: "#0b0a09", fg: "#e0b04a", font: "700 96px Georgia, serif" }) });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), h.std(0x2a2724)); street.rotation.x = -Math.PI / 2; street.position.z = 7; scene.add(street);
  h.room(scene, { w: 12, d: 20, h: 5.5, floor: h.planks("#4a3626", "#2e2117"), wall: 0x3a332c, ceiling: 0x14110e, z: -10 });
  // Lit niches along the left wall
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 5; c += 1) {
    const z = -3.5 - c * 1.6; const y = 0.8 + r * 1.3;
    const niche = h.box(0.6, 1.1, 1.4, h.std(0x2a2520)); niche.position.set(-5.7, y + 0.4, z); scene.add(niche);
    const b = f.bag(colors[(r * 5 + c) % colors.length], gold, 0.9); b.position.set(-5.3, y, z); b.rotation.y = Math.PI / 2; scene.add(b);
  }
  h.glowBulb(scene, -4.5, 4.6, -6, 0xfff0d6, 6, 8); h.glowBulb(scene, -4.5, 4.6, -9.5, 0xfff0d6, 6, 8);
  // Bridal clutch table
  f.table(scene, 1.5, -9, { w: 3, d: 1.4, top: 0x3a2a1c });
  [[0.6, 0xe0b04a], [1.5, 0xf2e6d0], [2.4, 0xc62828]].forEach(([x, color]) => { const b = f.bag(color, gold, 0.6); b.position.set(x, 0.83, -9); b.rotation.y = -0.3; scene.add(b); });
  h.glowBulb(scene, 1.5, 3.8, -9, 0xfff0d6, 6, 7);
  // Atelier workbench (custom bags)
  f.table(scene, 3.8, -14.5, { w: 2.6, d: 1.1, top: 0x6b4a2b });
  const leather = h.box(1, 0.02, 0.7, h.std(0x8b4513)); leather.position.set(3.6, 0.83, -14.5); scene.add(leather);
  const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), gold); tool.rotation.z = Math.PI / 2; tool.position.set(4.6, 0.84, -14.3); scene.add(tool);
  const half = f.bag(0x6d1b3f, gold, 0.7); half.position.set(4.2, 0.83, -14.7); scene.add(half);
  h.glowBulb(scene, 3.8, 3.6, -14.5, 0xffe2b0, 6, 7);
  const counter = h.box(3.5, 1.05, 0.8, h.std(0x141210)); counter.position.set(-1, 0.52, -18.5); scene.add(counter);
  const counterTop = h.box(3.6, 0.05, 0.85, gold); counterTop.position.set(-1, 1.06, -18.5); scene.add(counterTop);
  scene.add(new THREE.HemisphereLight(0xfff0d6, 0x2a221a, 1.3));
  [-4, -9, -14].forEach((z) => h.glowBulb(scene, 0, 5, z, 0xfff0d6, 5, 9));
  return {
    keys: [
      { pos: [0, 1.7, 10], look: [0, 2.6, 0] }, { pos: [0, 1.7, 1.5], look: [-2, 1.6, -6] },
      { pos: [-2.4, 1.8, -5], look: [-5.4, 1.6, -7] }, { pos: [0.5, 1.9, -6.2], look: [1.5, 0.9, -9] },
      { pos: [1.6, 1.9, -12], look: [3.8, 0.9, -14.5] }, { pos: [0, 1.7, -14.5], look: [-1, 1.2, -18.5] },
    ],
  };
};

/* Candle & home-fragrance store */
WORLDS.candles = (THREE, scene, h) => {
  const f = furniture(THREE, h);
  scene.background = new THREE.Color(0x1d140c); scene.fog = new THREE.Fog(0x1d140c, 9, 28);
  const flames = [];
  h.facade(scene, { w: 12, h: 6, z: 0, wall: 0x6b4a2f, frame: 0xd79a4a, signTexture: h.sign("Lumière", { bg: "#2a1d12", fg: "#f3d6a4", font: "italic 600 130px Georgia, serif" }) });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), h.std(0x3b3229)); street.rotation.x = -Math.PI / 2; street.position.z = 7; scene.add(street);
  h.room(scene, { w: 12, d: 18, h: 5, floor: h.planks("#7a5534", "#5a3c22"), wall: 0xeadfce, ceiling: 0xd9cbb6, z: -9 });
  // Candle wall shelves
  for (let level = 0; level < 4; level += 1) {
    const shelf = h.box(0.5, 0.05, 6, h.std(0x8a6239)); shelf.position.set(-5.7, 0.6 + level * 0.8, -6); scene.add(shelf);
    for (let i = 0; i < 9; i += 1) { const flame = f.candle(scene, -5.7, 0.63 + level * 0.8, -8.6 + i * 0.65, [0xf7efe2, 0xe8c9a6, 0xd7a37a, 0xf2e1c4][(i + level) % 4], 0.22 + (i % 3) * 0.08, 0.1, level % 2 === 0); if (flame) flames.push(flame); }
  }
  // Scent bar with jars
  f.table(scene, 2.5, -7, { w: 3, d: 1.2, top: 0x6b4a2f });
  for (let i = 0; i < 6; i += 1) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.26, 20), new THREE.MeshPhysicalMaterial({ color: 0xfff6e8, transmission: 0.7, roughness: 0.1, transparent: true }));
    jar.position.set(1.3 + i * 0.45, 0.96, -7); scene.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20), h.std(0x8a6239)); lid.position.set(1.3 + i * 0.45, 1.12, -7); scene.add(lid);
  }
  // Gift table with a cluster of lit candles
  f.table(scene, 0, -12, { w: 1.6, round: true, top: 0x8a6239 });
  [[0, 0, 0.5], [0.3, 0.2, 0.35], [-0.3, 0.15, 0.28], [0.15, -0.3, 0.42], [-0.2, -0.25, 0.3]].forEach(([dx, dz, hh]) => { const fl = f.candle(scene, dx, 0.83, -12 + dz, 0xf7efe2, hh, 0.11); flames.push(fl); });
  h.glowBulb(scene, 0, 1.6, -12, 0xffb15c, 8, 6);
  const counter = h.box(3, 1, 0.8, h.std(0x5a3c22)); counter.position.set(2.5, 0.5, -16); scene.add(counter);
  f.plant(scene, -4.5, -16, 1.2); f.plant(scene, 4.8, -2.5, 1);
  scene.add(new THREE.HemisphereLight(0xffe2b8, 0x3a2414, 0.8));
  [-4, -9, -14].forEach((z) => h.glowBulb(scene, 0, 4.6, z, 0xffd49a, 5, 9));
  h.glowBulb(scene, -4.8, 2, -6, 0xffb15c, 6, 6);
  return {
    keys: [
      { pos: [0, 1.7, 10], look: [0, 2.4, 0] }, { pos: [0, 1.7, 1.5], look: [0, 1.4, -6] },
      { pos: [-2.6, 1.7, -4.5], look: [-5.7, 1.4, -6.5] }, { pos: [1.2, 1.8, -4.4], look: [2.5, 1, -7] },
      { pos: [0.5, 1.6, -9.4], look: [0, 1, -12] }, { pos: [0, 1.7, -12.5], look: [2.5, 1, -16] },
    ],
    update: (t) => flames.forEach((fl, i) => { fl.scale.y = 1 + Math.sin(t * 9 + i * 1.7) * 0.15; fl.scale.x = 1 + Math.sin(t * 7 + i) * 0.08; }),
  };
};

/* Banquet / wedding venue */
WORLDS.banquet = (THREE, scene, h) => {
  const f = furniture(THREE, h);
  scene.background = new THREE.Color(0x1a0f08); scene.fog = new THREE.Fog(0x1a0f08, 14, 44);
  const gold = h.std(0xd4af37, { metalness: 0.9, roughness: 0.25, emissive: 0x2a1c05 });
  const marigold = [0xffa21f, 0xffcf33, 0xff7a1a].map((c) => h.std(c, { roughness: 0.8 }));
  // Entrance arch with marigold strings
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.18, 16, 64, Math.PI), gold); arch.position.set(0, 2.6, 0); scene.add(arch);
  [-2.6, 2.6].forEach((x) => { const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.6, 24), gold); pillar.position.set(x, 1.3, 0); scene.add(pillar); });
  for (let s = 0; s < 14; s += 1) {
    const x = -2.4 + s * 0.37;
    for (let k = 0; k < 9; k += 1) { const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), marigold[(s + k) % 3]); ball.position.set(x, 5 - Math.sqrt(Math.max(0, 6.8 - x * x)) * 0.0 - k * 0.22 - (2.6 - Math.sqrt(Math.max(0, 6.76 - x * x))), 0); scene.add(ball); }
  }
  h.room(scene, { w: 22, d: 34, h: 8, floor: h.tiles("#e9dcc6", "#cbb89a", 192), wall: 0xf1e4cf, ceiling: 0xe8d7bb, z: -17 });
  // Aisle with flower stands
  const runner = h.box(2.4, 0.02, 18, h.std(0xa0182e)); runner.position.set(0, 0.01, -12); scene.add(runner);
  for (let i = 0; i < 6; i += 1) [-1.8, 1.8].forEach((x) => {
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 1.2), gold); stand.position.set(x, 0.6, -5 - i * 2.8); scene.add(stand);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), h.std(i % 2 ? 0xf8f1e7 : 0xe7a8b8, { roughness: 0.9 })); bloom.position.set(x, 1.35, -5 - i * 2.8); scene.add(bloom);
  });
  // Mandap stage
  const stage = h.box(9, 0.6, 5, h.std(0xf3e3c8)); stage.position.set(0, 0.3, -28); scene.add(stage);
  [[-2.5, -26.5], [2.5, -26.5], [-2.5, -29.5], [2.5, -29.5]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3.6, 20), gold); p.position.set(x, 2.4, z); scene.add(p); });
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(4, 1.4, 4), h.std(0xc2185b, { roughness: 0.6, side: THREE.DoubleSide })); canopy.rotation.y = Math.PI / 4; canopy.position.set(0, 4.9, -28); scene.add(canopy);
  for (let i = 0; i < 30; i += 1) { const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), marigold[i % 3]); ball.position.set(-2.5 + (i % 15) * 0.36, 4.1 - Math.sin(((i % 15) / 14) * Math.PI) * 0.4, i < 15 ? -26.5 : -29.5); scene.add(ball); }
  // Dining tables
  [[-7, -8], [-7, -14], [7, -8], [7, -14], [-7, -20], [7, -20]].forEach(([x, z]) => {
    f.table(scene, x, z, { w: 2, round: true, top: 0xfaf3e6 });
    for (let c = 0; c < 6; c += 1) { const a = (c / 6) * Math.PI * 2; f.chair(scene, x + Math.cos(a) * 1.4, z + Math.sin(a) * 1.4, -a - Math.PI / 2, 0xd4af37); }
    const centre = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), h.std(0xe7a8b8)); centre.position.set(x, 1.05, z); scene.add(centre);
  });
  [-6, -13, -20, -27].forEach((z) => h.chandelier(scene, 0, 7.2, z, gold));
  [-7, 7].forEach((x) => [-8, -16].forEach((z) => h.glowBulb(scene, x, 6.5, z, 0xffd49a, 5, 10)));
  scene.add(new THREE.HemisphereLight(0xffe7c4, 0x5a3a1a, 1));
  return {
    keys: [
      { pos: [0, 1.8, 9], look: [0, 2.6, 0] }, { pos: [0, 1.7, -2], look: [0, 1.5, -14] },
      { pos: [0, 2.2, -17], look: [0, 2.6, -28] }, { pos: [-3, 2.4, -11], look: [-7, 0.8, -14] },
      { pos: [3.5, 2.6, -16], look: [7, 1, -20] }, { pos: [0, 2.2, -22], look: [0, 3.8, -28] },
    ],
  };
};

/* Construction site */
WORLDS.site = (THREE, scene, h) => {
  scene.background = new THREE.Color(0xcfd6dc); scene.fog = new THREE.Fog(0xcfd6dc, 20, 70);
  const orange = h.std(0xff6a13, { roughness: 0.5 });
  const concrete = h.std(0xcfcac0, { roughness: 0.95 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), h.std(0xb9a98e, { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.z = -20; scene.add(ground);
  // Gate + site board
  [-3, 3].forEach((x) => { const post = h.box(0.25, 3, 0.25, orange); post.position.set(x, 1.5, 0); scene.add(post); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), new THREE.MeshBasicMaterial({ map: h.sign("KEYSTONE BUILDERS", { bg: "#1c1d1f", fg: "#ff6a13", font: "900 100px Arial Black, sans-serif" }) })); board.position.set(0, 3.4, 0); scene.add(board);
  for (let x = -14; x <= 14; x += 2) if (Math.abs(x) > 3) { const fence = h.box(1.9, 1.8, 0.05, h.std(0x2b6cb0)); fence.position.set(x, 0.9, 0); scene.add(fence); }
  // Tower under construction
  const floors = [];
  for (let i = 0; i < 12; i += 1) {
    const slab = h.box(8, 0.25, 6, concrete); slab.position.set(4, i * 1.4, -22); scene.add(slab);
    [[-3.8, -2.8], [3.8, -2.8], [-3.8, 2.8], [3.8, 2.8], [0, -2.8], [0, 2.8]].forEach(([dx, dz]) => { const col = h.box(0.35, 1.4, 0.35, concrete); col.position.set(4 + dx, i * 1.4 + 0.7, -22 + dz); scene.add(col); });
    if (i < 7) { const glass = h.box(7.6, 1.15, 5.6, new THREE.MeshPhysicalMaterial({ color: 0x5f7c8f, metalness: 0.4, roughness: 0.1, transparent: true, opacity: 0.6 })); glass.position.set(4, i * 1.4 + 0.7, -22); scene.add(glass); }
    floors.push(slab);
  }
  // Scaffolding
  for (let y = 0; y < 14; y += 1.4) for (let x = -0.4; x <= 8.4; x += 1.2) { const pole = h.box(0.05, 1.4, 0.05, h.std(0x8a8f96, { metalness: 0.7 })); pole.position.set(x, y + 0.7, -18.6); scene.add(pole); }
  // Crane
  const mast = h.box(0.6, 22, 0.6, orange); mast.position.set(-6, 11, -26); scene.add(mast);
  const jib = new THREE.Group(); jib.position.set(-6, 22, -26); scene.add(jib);
  const arm = h.box(20, 0.4, 0.5, orange); arm.position.x = 7; jib.add(arm);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 8), h.std(0x222222)); cable.position.set(12, -4, 0); jib.add(cable);
  const load = h.box(2, 0.3, 0.6, h.std(0x6b7280, { metalness: 0.6 })); load.position.set(12, -8.2, 0); jib.add(load);
  // Materials yard
  for (let i = 0; i < 4; i += 1) for (let k = 0; k < 3; k += 1) { const bricks = h.box(1, 0.5, 0.8, h.std(0xb4532a)); bricks.position.set(-8 + i * 1.2, 0.25 + k * 0.5, -10); scene.add(bricks); }
  const mixer = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1, 1.6, 20), orange); mixer.rotation.z = 1.1; mixer.position.set(-4, 1.4, -8); scene.add(mixer);
  // Site office
  const office = h.box(5, 2.8, 3, h.std(0xf3f4f6)); office.position.set(9, 1.4, -6); scene.add(office);
  const officeSign = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.7), new THREE.MeshBasicMaterial({ map: h.sign("SITE OFFICE", { bg: "#ff6a13", fg: "#ffffff", font: "900 110px Arial Black, sans-serif" }) })); officeSign.position.set(9, 2.3, -4.48); scene.add(officeSign);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a60, 1.4));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4); sun.position.set(20, 30, 10); scene.add(sun);
  return {
    keys: [
      { pos: [0, 1.7, 10], look: [0, 2.5, 0] }, { pos: [-2, 1.8, -4], look: [-6, 1, -10] },
      { pos: [0, 2, -12], look: [4, 6, -22] }, { pos: [-1, 3, -15], look: [-6, 18, -26] },
      { pos: [6, 2, -12], look: [4, 4, -18.6] }, { pos: [5, 1.8, -1.5], look: [9, 1.8, -6] },
    ],
    update: (t) => { jib.rotation.y = Math.sin(t * 0.25) * 0.5; cable.scale.y = 1 + Math.sin(t * 0.6) * 0.2; load.position.y = -8.2 - Math.sin(t * 0.6) * 0.8; },
  };
};

/* Dental clinic */
WORLDS.clinic = (THREE, scene, h) => {
  const f = furniture(THREE, h);
  scene.background = new THREE.Color(0xe8f2ef); scene.fog = new THREE.Fog(0xe8f2ef, 12, 34);
  const mint = 0x12a594;
  h.facade(scene, { w: 12, h: 5.5, z: 0, wall: 0xf7faf9, frame: mint, signTexture: h.sign("LUMEN DENTAL", { bg: "#ffffff", fg: "#12a594", font: "600 110px Georgia, serif" }) });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), h.std(0xd5dbd8)); street.rotation.x = -Math.PI / 2; street.position.z = 7; scene.add(street);
  h.room(scene, { w: 12, d: 20, h: 4.5, floor: h.tiles("#f4f7f6", "#dfe8e5", 128), wall: 0xf7faf9, ceiling: 0xffffff, z: -10 });
  // Reception
  const desk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.1, 40, 1, false, 0, Math.PI), h.std(0xffffff, { roughness: 0.3 })); desk.position.set(-2.5, 0.55, -4); desk.rotation.y = Math.PI / 2; scene.add(desk);
  const deskStripe = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.1, 40, 1, true, 0, Math.PI), h.std(mint)); deskStripe.position.set(-2.5, 0.85, -4); deskStripe.rotation.y = Math.PI / 2; scene.add(deskStripe);
  // Waiting lounge
  [0, 1].forEach((i) => f.sofa(scene, 4, -5 - i * 3, -Math.PI / 2, 0xbfe3dc));
  f.plant(scene, 5.2, -9.8, 1.3); f.plant(scene, -5.2, -2, 1.1);
  f.art(scene, 5.95, 2.4, -6.5, -Math.PI / 2, f.abstract("#e8f6f3", "#12a594", "#f3c9b8"), 2, 1.2);
  // Treatment room with dental chair
  const chairGroup = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 24), h.std(0xffffff)); base.position.y = 0.25; chairGroup.add(base);
  const seat = h.box(0.8, 0.18, 1.2, h.std(mint, { roughness: 0.35 })); seat.position.set(0, 0.62, 0); chairGroup.add(seat);
  const backrest = h.box(0.8, 0.18, 1.1, h.std(mint, { roughness: 0.35 })); backrest.position.set(0, 0.95, -0.85); backrest.rotation.x = -0.8; chairGroup.add(backrest);
  const leg = h.box(0.7, 0.15, 0.8, h.std(mint, { roughness: 0.35 })); leg.position.set(0, 0.55, 0.9); leg.rotation.x = 0.35; chairGroup.add(leg);
  const arm = h.box(0.06, 1.8, 0.06, h.std(0xdddddd, { metalness: 0.6 })); arm.position.set(0.9, 1.6, -0.6); chairGroup.add(arm);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.12, 24), h.std(0xffffff)); lamp.position.set(0.5, 2.4, -0.3); lamp.rotation.z = 0.6; chairGroup.add(lamp);
  const screen = h.box(0.9, 0.55, 0.05, h.std(0x10231f)); screen.position.set(-1, 1.7, -1.2); chairGroup.add(screen);
  const glowScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.48), new THREE.MeshBasicMaterial({ map: f.abstract("#0f2f2a", "#12a594", "#e8f6f3") })); glowScreen.position.set(-1, 1.7, -1.17); chairGroup.add(glowScreen);
  chairGroup.position.set(0, 0, -15); chairGroup.rotation.y = 0.4; scene.add(chairGroup);
  h.glowBulb(scene, 0.4, 3, -14.8, 0xffffff, 8, 8);
  // Smile gallery
  const smile = h.tex(256, 160, (c, w, hh) => { c.fillStyle = "#f3d9cf"; c.fillRect(0, 0, w, hh); c.fillStyle = "#b24a5f"; c.beginPath(); c.ellipse(w / 2, hh / 2 + 10, 90, 40, 0, 0, Math.PI); c.fill(); c.fillStyle = "#fbfaf5"; for (let i = 0; i < 6; i += 1) c.fillRect(w / 2 - 78 + i * 26, hh / 2 + 10, 22, 22); });
  [-2.2, 0, 2.2].forEach((x) => f.art(scene, x, 2.3, -19.9, 0, smile, 1.7, 1.06));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe9e4, 1.3));
  [-4, -9, -14].forEach((z) => h.glowBulb(scene, 0, 4.2, z, 0xf2fffc, 5, 10));
  return {
    keys: [
      { pos: [0, 1.7, 10], look: [0, 2.4, 0] }, { pos: [0, 1.7, -1.6], look: [-2.5, 1, -4.5] },
      { pos: [0.5, 1.6, -4], look: [4, 0.8, -7] }, { pos: [-0.5, 1.8, -9.5], look: [0, 1.2, -15] },
      { pos: [1.5, 1.7, -12.6], look: [-0.5, 1.5, -15.8] }, { pos: [0, 1.7, -15.5], look: [0, 2.3, -20] },
    ],
  };
};

/* Interior design home */
WORLDS.home = (THREE, scene, h) => {
  const f = furniture(THREE, h);
  scene.background = new THREE.Color(0x1c1813); scene.fog = new THREE.Fog(0x1c1813, 12, 34);
  const brass = h.std(0xc9a24a, { metalness: 0.85, roughness: 0.3 });
  h.facade(scene, { w: 12, h: 5.5, z: 0, wall: 0xd9cfc0, frame: 0x3b2f24, signTexture: h.sign("FUTURE TECH INTERIORS", { bg: "#2a241d", fg: "#f2e8d8", font: "500 78px Georgia, serif" }) });
  const porch = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), h.std(0x6b6257)); porch.rotation.x = -Math.PI / 2; porch.position.z = 7; scene.add(porch);
  h.room(scene, { w: 14, d: 22, h: 4.2, floor: h.planks("#b08a5e", "#8a6a45"), wall: 0xf0e8dc, ceiling: 0xfaf6ef, z: -11 });
  // Living room
  const rug = h.box(4.2, 0.02, 3, h.std(0xd8cbb5, { roughness: 1 })); rug.position.set(-2.5, 0.01, -6); scene.add(rug);
  f.sofa(scene, -2.5, -7.3, 0, 0x8a7a66);
  f.table(scene, -2.5, -5.6, { w: 1.4, d: 0.8, h: 0.4, top: 0x3b2f24 });
  f.plant(scene, -5.8, -8, 1.4); f.plant(scene, 0.4, -8.2, 1);
  f.art(scene, -2.5, 2.4, -8.0, 0, f.abstract("#e9dfcf", "#c46a3c", "#2f4b45"), 2.2, 1.3);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 0.8 })); lamp.position.set(-2.5, 3.2, -6); scene.add(lamp);
  // Kitchen island
  const island = h.box(3, 0.95, 1.1, h.std(0x2f3a36, { roughness: 0.4 })); island.position.set(3.5, 0.48, -11); scene.add(island);
  const top = h.box(3.1, 0.05, 1.2, h.std(0xf4efe6, { roughness: 0.2 })); top.position.set(3.5, 0.98, -11); scene.add(top);
  [2.6, 3.5, 4.4].forEach((x) => { const pendant = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 24, 1, true), brass); pendant.position.set(x, 2.6, -11); pendant.rotation.x = Math.PI; scene.add(pendant); h.glowBulb(scene, x, 2.45, -11, 0xffe2b0, 3, 5); });
  const cabinets = h.box(5, 2.2, 0.6, h.std(0x2f3a36)); cabinets.position.set(3.5, 1.1, -13.6); scene.add(cabinets);
  // Bedroom
  const bed = h.box(2.2, 0.5, 2.4, h.std(0xf2ece2)); bed.position.set(-2.5, 0.25, -17); scene.add(bed);
  const headboard = h.box(2.4, 1.3, 0.15, h.std(0x8a6a45)); headboard.position.set(-2.5, 0.75, -18.2); scene.add(headboard);
  const throwBlanket = h.box(2.22, 0.06, 0.8, h.std(0xc46a3c)); throwBlanket.position.set(-2.5, 0.52, -16.3); scene.add(throwBlanket);
  [-4, -1].forEach((x) => { const side = h.box(0.5, 0.5, 0.45, h.std(0x3b2f24)); side.position.set(x, 0.25, -17.9); scene.add(side); h.glowBulb(scene, x, 0.85, -17.9, 0xffd9a0, 2, 4); });
  f.art(scene, -2.5, 2.4, -21.9, 0, f.abstract("#2f4b45", "#e9dfcf", "#c9a24a"), 2.4, 1.1);
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x6b5a48, 1.1));
  [-5, -11, -17].forEach((z) => h.glowBulb(scene, 0, 4, z, 0xfff0d6, 5, 10));
  return {
    keys: [
      { pos: [0, 1.7, 9], look: [0, 2.4, 0] }, { pos: [0, 1.7, -1], look: [-2.5, 1, -6.5] },
      { pos: [-2.5, 1.5, -3], look: [-2.5, 1.6, -8] }, { pos: [1, 1.7, -7.5], look: [3.5, 1, -11] },
      { pos: [0.5, 1.7, -13.5], look: [-2.5, 0.8, -17] }, { pos: [-2.5, 1.6, -14], look: [-2.5, 2.2, -22] },
    ],
  };
};

Object.assign(DEFAULT_CAPTIONS, {
  jewels: [["Enter Terra & Stone", "Raw gems, natural stones and handmade gold."], ["Step inside", "A calm, bright gallery for things made to last."], ["The ring cases", "Turquoise, amber, rose quartz — each set by hand."], ["Necklaces", "Beaded and chain pieces, styled on the bust."], ["The gemstone wall", "Pick your stone, we craft the piece."], ["Make it yours", "Shop online or request a custom design."]],
  bags: [["Welcome to LuxeBag", "Bags that land soft and leave a statement."], ["Inside the boutique", "Warm light, dark wood and the best of the season."], ["The niche wall", "Every bag displayed like a piece of art."], ["Bridal clutches", "Gold, ivory and red — made for the big day."], ["The atelier", "Personalised and custom bags, crafted to order."], ["Ready when you are", "Order online with free delivery and COD."]],
  candles: [["Welcome to Lumière", "Hand-poured candles for warmer evenings."], ["Come in", "The air smells of vanilla, wood and lavender."], ["The candle wall", "Pillars, jars and tapers in every size."], ["The scent bar", "Find your fragrance before you buy."], ["Gift sets", "Curated boxes for every celebration."], ["Light one up", "Shop the collection online."]],
  banquet: [["Welcome to Vedic Utsav", "Every celebration begins at the gate."], ["The aisle", "Flowers, light and a path made for your entrance."], ["The mandap", "Traditional rituals, designed for unforgettable photos."], ["Dining in style", "Round tables, gold chairs and floral centrepieces."], ["Every detail", "Decor, catering and coordination handled for you."], ["Plan your event", "Tell us your date — we take care of the rest."]],
  site: [["KEYSTONE Builders", "Step onto a site where safety comes first."], ["The materials yard", "Quality-checked materials, logged every day."], ["Rising floor by floor", "Structure, MEP and finishes on schedule."], ["Heavy lifting", "Tower cranes and certified operators."], ["Scaffolding & safety", "2.1 million safe man-hours and counting."], ["Visit the site office", "Book a free site visit and estimate."]],
  clinic: [["Welcome to Lumen Dental", "Gentle care. Brilliant smiles."], ["Reception", "On time, every time — check in in seconds."], ["Calm waiting lounge", "Soft seating, natural light and zero clinic smell."], ["Treatment rooms", "Modern chairs, digital scans and painless care."], ["Digital smile design", "See your new smile before we begin."], ["Real results", "Book your appointment online."]],
  home: [["Future Tech Interiors", "Beautiful spaces. Better living."], ["Step into the home", "Light, texture and proportion, planned to the centimetre."], ["The living room", "Comfort that looks as good as it feels."], ["The kitchen", "An island for cooking, talking and everything between."], ["The bedroom", "Calm materials for slower mornings."], ["Design your space", "Start your project with a free consultation."]],
});

export function mountStory(THREE, section, world = "saree", options = {}) {
  if (!section || !WORLDS[world]) return () => {};
  const captions = options.captions || DEFAULT_CAPTIONS[world] || [];
  const accent = options.accent || "#d4a640";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Layout: tall section with a sticky stage
  section.style.position = "relative";
  section.style.height = `${Math.max(3, captions.length) * 100}vh`;
  section.setAttribute("aria-label", options.label || "Walk-through");
  const stage = document.createElement("div");
  // Pinned with JS (not CSS sticky) so it also works inside overflow-hidden page wrappers
  stage.style.cssText = "position:absolute;top:0;left:0;height:100vh;width:100%;overflow:hidden;";
  section.appendChild(stage);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch {
    section.style.height = "auto";
    return () => stage.remove();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  stage.appendChild(renderer.domElement);

  // Captions (inherit the site's fonts)
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;inset:0;pointer-events:none;display:flex;align-items:flex-end;padding:0 max(24px,6vw) 12vh;background:linear-gradient(0deg,rgba(0,0,0,.65),transparent 45%);";
  stage.appendChild(overlay);
  const captionEls = captions.map(([title, text], index) => {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;left:max(24px,6vw);bottom:12vh;max-width:620px;color:#fff;opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .8s cubic-bezier(.2,.7,.1,1);font-family:inherit;";
    el.innerHTML = `<div style="font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:${accent};margin-bottom:14px">Scene ${String(index + 1).padStart(2, "0")} / ${String(captions.length).padStart(2, "0")}</div><h2 style="margin:0 0 12px;font-size:clamp(34px,5vw,68px);line-height:1.02;font-family:inherit;color:#fff">${title}</h2><p style="margin:0;font-size:clamp(15px,1.5vw,19px);line-height:1.6;color:rgba(255,255,255,.82)">${text}</p>`;
    overlay.appendChild(el);
    return el;
  });
  const dots = document.createElement("div");
  dots.style.cssText = "position:absolute;right:max(20px,3vw);top:50%;transform:translateY(-50%);display:grid;gap:10px;";
  const dotEls = captions.map(() => { const d = document.createElement("i"); d.style.cssText = `display:block;width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.35);transition:all .4s`; dots.appendChild(d); return d; });
  stage.appendChild(dots);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
  const built = WORLDS[world](THREE, scene, makeHelpers(THREE));
  // Worlds are authored with soft values; boost to physically based light units
  const boost = options.lightBoost || 7;
  scene.traverse((object) => {
    if (object.isPointLight) { object.intensity *= boost; object.distance *= 1.7; }
    if (object.isHemisphereLight) object.intensity *= 1.8;
  });
  scene.add(new THREE.AmbientLight(0xffffff, options.ambient ?? 0.35));
  const pathPos = new THREE.CatmullRomCurve3(built.keys.map((k) => new THREE.Vector3(...k.pos)));
  const pathLook = new THREE.CatmullRomCurve3(built.keys.map((k) => new THREE.Vector3(...k.look)));
  const lookTarget = new THREE.Vector3();

  const resize = () => {
    window.dispatchEvent(new Event("scroll"));
    const width = stage.clientWidth; const height = stage.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 70 : 55;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  let progress = 0; let smooth = 0; let active = -1;
  let pinState = "";
  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
    const next = rect.top > 0 ? "before" : rect.bottom < window.innerHeight ? "after" : "pinned";
    if (next === "pinned") { stage.style.left = `${rect.left}px`; stage.style.width = `${rect.width}px`; }
    if (next !== pinState) {
      pinState = next;
      if (next === "pinned") { stage.style.position = "fixed"; stage.style.top = "0"; stage.style.bottom = ""; }
      else { stage.style.position = "absolute"; stage.style.left = "0"; stage.style.width = "100%"; stage.style.top = next === "before" ? "0" : ""; stage.style.bottom = next === "after" ? "0" : ""; }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const pointer = { x: 0, y: 0 };
  const onPointer = (event) => { pointer.x = (event.clientX / window.innerWidth - 0.5); pointer.y = (event.clientY / window.innerHeight - 0.5); };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let visible = false;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(section);

  const clock = new THREE.Clock();
  let frameId = 0;
  const frame = () => {
    frameId = requestAnimationFrame(frame);
    if (!visible) return;
    smooth += (progress - smooth) * (reduce ? 1 : 0.08);
    const t = clock.getElapsedTime();
    camera.position.copy(pathPos.getPoint(smooth));
    lookTarget.copy(pathLook.getPoint(smooth));
    lookTarget.x += pointer.x * 0.8; lookTarget.y -= pointer.y * 0.4;
    camera.position.y += reduce ? 0 : Math.sin(t * 1.6) * 0.015; // gentle walking sway
    camera.lookAt(lookTarget);
    built.update?.(t, smooth);
    const index = Math.min(captions.length - 1, Math.round(smooth * (captions.length - 1)));
    if (index !== active) {
      captionEls.forEach((el, i) => { el.style.opacity = i === index ? "1" : "0"; el.style.transform = i === index ? "none" : "translateY(30px)"; });
      dotEls.forEach((d, i) => { d.style.background = i === index ? accent : "rgba(255,255,255,.35)"; d.style.transform = i === index ? "scale(1.6)" : "none"; });
      active = index;
    }
    renderer.render(scene, camera);
  };
  frame();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointer);
    io.disconnect();
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      (Array.isArray(object.material) ? object.material : object.material ? [object.material] : []).forEach((m) => { m.map?.dispose?.(); m.dispose?.(); });
    });
    renderer.dispose();
    stage.remove();
    section.style.height = "";
  };
}
