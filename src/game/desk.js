import * as THREE from 'three';

export const PALETTE = {
  bg: '#0d1024',
  mat: '#2b3454',
  wood: '#c4935f',
  woodDark: '#8f6640',
  alu: '#cfd4e0',
  ink: '#161a2c',
  cream: '#f3ead7',
  duck: '#ffd84a',
  leaf: '#3fa66a',
  pot: '#d9774a',
  lamp: '#3d4a7a',
  warm: '#ffc27a',
  ok: '#5fe3a1',
  bad: '#ff6b6b',
};

export const DESK = { w: 18, d: 11, h: 1 };
/** Area of the desk mat that bugs may walk on. */
export const WALK = { x0: -7.3, x1: 7.3, z0: -4.0, z1: 4.0 };
export const WALK_Y = 0.045;

const CIRCLES = [
  { x: 4.7, z: -3.1, r: 0.85 }, // mug
  { x: 7.3, z: -3.9, r: 0.95 }, // lamp
  { x: -6.8, z: 2.6, r: 0.9 }, // duck
  { x: -7.3, z: -3.6, r: 0.95 }, // plant
];
const RECTS = [{ x0: -3.7, x1: 1.7, z0: -4.5, z1: -0.85 }]; // laptop

export function blocked(x, z, pad = 0.4) {
  if (x < WALK.x0 || x > WALK.x1 || z < WALK.z0 || z > WALK.z1) return true;
  for (const c of CIRCLES) {
    const dx = x - c.x;
    const dz = z - c.z;
    const r = c.r + pad;
    if (dx * dx + dz * dz < r * r) return true;
  }
  for (const r of RECTS) {
    if (x > r.x0 - pad && x < r.x1 + pad && z > r.z0 - pad && z < r.z1 + pad) return true;
  }
  return false;
}

const std = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...opts });

function mesh(geo, mat, parent, { cast = true, receive = false } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  parent.add(m);
  return m;
}

function keyboardTexture() {
  const c = document.createElement('canvas');
  c.width = 520;
  c.height = 340;
  const g = c.getContext('2d');
  g.fillStyle = PALETTE.alu;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#20253a';
  const rows = 5;
  const cols = 13;
  const x0 = 28;
  const y0 = 24;
  const kw = (c.width - x0 * 2) / cols;
  const kh = 34;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      if (r === rows - 1 && k > 3 && k < 9) continue;
      g.beginPath();
      g.roundRect(x0 + k * kw + 2, y0 + r * kh + 2, kw - 4, kh - 4, 5);
      g.fill();
    }
  }
  g.beginPath();
  g.roundRect(x0 + 4 * kw + 2, y0 + 4 * kh + 2, kw * 5 - 4, kh - 4, 5);
  g.fill();
  g.fillStyle = '#bcc2d0';
  g.beginPath();
  g.roundRect(c.width / 2 - 95, 214, 190, 108, 10);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** The laptop screen is a live canvas: the release pipeline for v8.4. */
function makeScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const g = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  function draw({ caught, colors }) {
    const total = caught.length;
    const done = caught.filter(Boolean).length;
    const shipped = done === total;
    const W = canvas.width;
    const H = canvas.height;
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#111936');
    bg.addColorStop(1, '#0a0f22');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    g.fillStyle = '#1b2547';
    g.fillRect(0, 0, W, 58);
    ['#ff6b6b', '#ffb627', '#5fe3a1'].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(34 + i * 30, 29, 9, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = '#aab6e6';
    g.font = '600 24px ui-monospace, Menlo, monospace';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillText('staging  ›  release/v8.4', 140, 30);

    g.textAlign = 'center';
    g.fillStyle = shipped ? PALETTE.ok : PALETTE.bad;
    g.font = '800 96px system-ui, -apple-system, Helvetica, Arial, sans-serif';
    g.fillText(shipped ? 'SHIPPED' : 'BLOCKED', W / 2, 172);
    g.fillStyle = '#d6dcf5';
    g.font = '500 30px system-ui, -apple-system, Helvetica, Arial, sans-serif';
    g.fillText(shipped ? 'All 8 blockers filed. Zero open.' : `${total - done} of ${total} release blockers open`, W / 2, 252);

    const gap = 84;
    const sx = W / 2 - (gap * (total - 1)) / 2;
    for (let i = 0; i < total; i++) {
      const x = sx + i * gap;
      const y = 350;
      g.lineWidth = 6;
      if (caught[i]) {
        g.fillStyle = colors[i];
        g.beginPath();
        g.arc(x, y, 27, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#0a0f22';
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(x - 11, y + 1);
        g.lineTo(x - 3, y + 10);
        g.lineTo(x + 12, y - 9);
        g.stroke();
      } else {
        g.strokeStyle = '#4a5788';
        g.beginPath();
        g.arc(x, y, 24, 0, Math.PI * 2);
        g.stroke();
      }
    }

    g.fillStyle = '#1b2547';
    g.beginPath();
    g.roundRect(70, 430, W - 140, 22, 11);
    g.fill();
    if (done) {
      g.fillStyle = shipped ? PALETTE.ok : '#8ea2ff';
      g.beginPath();
      g.roundRect(70, 430, ((W - 140) * done) / total, 22, 11);
      g.fill();
    }
    texture.needsUpdate = true;
  }

  return { texture, draw };
}

export function buildDesk(scene) {
  const root = new THREE.Group();
  scene.add(root);

  // Slab and mat
  const slab = mesh(
    new THREE.BoxGeometry(DESK.w, DESK.h, DESK.d),
    [
      std(PALETTE.woodDark),
      std(PALETTE.woodDark),
      std(PALETTE.wood, { roughness: 0.7 }),
      std(PALETTE.woodDark),
      std(PALETTE.woodDark),
      std(PALETTE.woodDark),
    ],
    root,
    { cast: true, receive: true },
  );
  slab.position.y = -DESK.h / 2;
  const mat = mesh(new THREE.BoxGeometry(15.8, 0.04, 9.2), std(PALETTE.mat, { roughness: 0.85 }), root, {
    cast: false,
    receive: true,
  });
  mat.position.y = 0.02;

  // Laptop
  const laptop = new THREE.Group();
  laptop.position.set(-1, 0, -2.65);
  root.add(laptop);
  const base = mesh(new THREE.BoxGeometry(5.2, 0.16, 3.4), std(PALETTE.alu, { roughness: 0.35, metalness: 0.4 }), laptop, {
    receive: true,
  });
  base.position.y = 0.12;
  const keys = mesh(new THREE.PlaneGeometry(5.0, 3.2), new THREE.MeshStandardMaterial({ map: keyboardTexture(), roughness: 0.5 }), laptop, {
    cast: false,
    receive: true,
  });
  keys.rotation.x = -Math.PI / 2;
  keys.position.y = 0.205;
  const lid = new THREE.Group();
  lid.position.set(0, 0.2, -1.66);
  lid.rotation.x = -0.24;
  laptop.add(lid);
  const panel = mesh(new THREE.BoxGeometry(5.2, 3.3, 0.12), std(PALETTE.alu, { roughness: 0.35, metalness: 0.4 }), lid);
  panel.position.y = 1.65;
  const bezel = mesh(new THREE.PlaneGeometry(5.06, 3.16), new THREE.MeshBasicMaterial({ color: '#05070f' }), lid, { cast: false });
  bezel.position.set(0, 1.65, 0.062);
  const screen = makeScreen();
  const display = mesh(new THREE.PlaneGeometry(4.8, 3.0), new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false }), lid, {
    cast: false,
  });
  display.position.set(0, 1.65, 0.066);
  const glow = new THREE.PointLight('#7f9bff', 9, 9, 2);
  glow.position.set(-1, 1.6, -1.4);
  root.add(glow);

  // Mug with steam
  const mug = new THREE.Group();
  mug.position.set(4.7, 0.04, -3.1);
  root.add(mug);
  const cup = mesh(new THREE.CylinderGeometry(0.72, 0.62, 1.25, 32, 1, true), std(PALETTE.cream, { side: THREE.DoubleSide, roughness: 0.3 }), mug);
  cup.position.y = 0.625;
  const bottom = mesh(new THREE.CircleGeometry(0.62, 32), std(PALETTE.cream), mug, { cast: false });
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.01;
  const coffee = mesh(new THREE.CircleGeometry(0.68, 32), std('#3a2418', { roughness: 0.2 }), mug, { cast: false });
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 1.08;
  const handle = mesh(new THREE.TorusGeometry(0.34, 0.085, 10, 24, Math.PI), std(PALETTE.cream, { roughness: 0.3 }), mug);
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.7, 0.62, 0);
  mug.rotation.y = -0.6;
  const steam = [];
  const steamMat = () => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.2, depthWrite: false });
  for (let i = 0; i < 4; i++) {
    const p = mesh(new THREE.SphereGeometry(0.16, 10, 8), steamMat(), mug, { cast: false });
    steam.push({ p, t: i / 4 });
  }

  // Desk lamp
  const lamp = new THREE.Group();
  lamp.position.set(7.3, 0, -3.9);
  root.add(lamp);
  const lampMat = std(PALETTE.lamp, { roughness: 0.4, metalness: 0.5 });
  mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.16, 32), lampMat, lamp).position.y = 0.12;
  const pole = mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.4, 10), lampMat, lamp);
  pole.position.set(-0.25, 2.3, 0.1);
  pole.rotation.z = 0.12;
  const arm = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.9, 10), lampMat, lamp);
  arm.position.set(-1.75, 4.75, 0.75);
  arm.rotation.set(0.5, 0, 1.25);
  const head = new THREE.Group();
  head.position.set(-3.1, 4.95, 1.4);
  head.rotation.set(0.45, 0, 0.5);
  lamp.add(head);
  mesh(new THREE.ConeGeometry(0.75, 1.0, 24, 1, true), std(PALETTE.lamp, { side: THREE.DoubleSide, roughness: 0.4, metalness: 0.5 }), head);
  const bulb = mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshBasicMaterial({ color: '#fff1cf', toneMapped: false }), head, { cast: false });
  bulb.position.y = -0.3;
  const spot = new THREE.SpotLight(PALETTE.warm, 3.2, 0, 0.72, 0.7, 0);
  spot.position.set(4.2, 4.7, -2.5);
  spot.target.position.set(1.4, 0, 0.6);
  root.add(spot, spot.target);

  // Rubber duck: the debugging assistant
  const duck = new THREE.Group();
  duck.position.set(-6.8, 0.04, 2.6);
  duck.rotation.y = 0.9;
  root.add(duck);
  const duckMat = std(PALETTE.duck, { roughness: 0.35 });
  const db = mesh(new THREE.SphereGeometry(0.75, 20, 14), duckMat, duck);
  db.scale.set(1, 0.8, 1.2);
  db.position.y = 0.58;
  const tail = mesh(new THREE.ConeGeometry(0.3, 0.55, 12), duckMat, duck);
  tail.position.set(0, 0.92, -0.78);
  tail.rotation.x = -0.8;
  mesh(new THREE.SphereGeometry(0.46, 18, 12), duckMat, duck).position.set(0, 1.32, 0.42);
  const beak = mesh(new THREE.ConeGeometry(0.2, 0.42, 12), std('#ff8a3d', { roughness: 0.4 }), duck);
  beak.rotation.x = Math.PI / 2;
  beak.scale.set(1.25, 1, 0.6);
  beak.position.set(0, 1.26, 0.92);
  for (const side of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.065, 8, 6), std('#161a2c', { roughness: 0.2 }), duck, { cast: false }).position.set(side * 0.2, 1.46, 0.8);
  }

  // Plant
  const plant = new THREE.Group();
  plant.position.set(-7.3, 0.04, -3.6);
  root.add(plant);
  mesh(new THREE.CylinderGeometry(0.78, 0.56, 1.0, 20), std(PALETTE.pot, { roughness: 0.8 }), plant).position.y = 0.5;
  const soil = mesh(new THREE.CircleGeometry(0.72, 20), std('#3b2a22'), plant, { cast: false });
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 1.005;
  const leafMat = std(PALETTE.leaf, { roughness: 0.55 });
  const leaves = [];
  for (let i = 0; i < 9; i++) {
    const holder = new THREE.Group();
    holder.position.y = 1.0;
    holder.rotation.y = (i / 9) * Math.PI * 2 + (i % 2) * 0.3;
    const lean = 0.25 + (i % 3) * 0.28;
    holder.rotation.z = lean;
    const leaf = mesh(new THREE.SphereGeometry(1, 12, 8), leafMat, holder);
    const len = 1.1 + (i % 4) * 0.22;
    leaf.scale.set(0.2, len, 0.07);
    leaf.position.y = len;
    plant.add(holder);
    leaves.push({ holder, lean, k: i });
  }

  // Sticky notes and a pen
  const notes = new THREE.Group();
  notes.position.set(5.9, 0.04, 2.5);
  notes.rotation.y = -0.28;
  root.add(notes);
  const n1 = mesh(new THREE.BoxGeometry(1.5, 0.05, 1.5), std('#ffe066', { roughness: 0.9 }), notes, { cast: false, receive: true });
  n1.position.y = 0.025;
  const n2 = mesh(new THREE.BoxGeometry(1.5, 0.02, 1.5), std('#ff8fab', { roughness: 0.9 }), notes, { cast: false, receive: true });
  n2.position.set(-0.5, 0.012, -0.9);
  n2.rotation.y = 0.5;
  const pen = mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 10), std('#8ea2ff', { roughness: 0.3 }), root);
  pen.rotation.set(Math.PI / 2, 0, 1.1);
  pen.position.set(3.4, 0.11, 3.75);

  // Floating dust in the lamp light, and distant specks behind the desk
  const dustGeo = new THREE.BufferGeometry();
  const N = 260;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 16 + Math.random() * 34;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = -10 + Math.random() * 30;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: '#9fb0ff', size: 0.09, transparent: true, opacity: 0.6, depthWrite: false }),
  );
  scene.add(dust);

  return {
    root,
    screen,
    update(t, calm) {
      for (const s of steam) {
        const k = (t * 0.22 + s.t) % 1;
        s.p.position.set(Math.sin(k * 6 + s.t * 9) * 0.16, 1.15 + k * 1.5, Math.cos(k * 5 + s.t * 4) * 0.12);
        s.p.scale.setScalar(0.6 + k * 1.3);
        s.p.material.opacity = 0.22 * (1 - k) * Math.min(1, k * 6);
      }
      if (!calm) {
        for (const l of leaves) l.holder.rotation.z = l.lean + Math.sin(t * 0.9 + l.k) * 0.025;
        dust.rotation.y = t * 0.008;
      }
    },
  };
}
