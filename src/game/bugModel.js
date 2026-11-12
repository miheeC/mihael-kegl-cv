import * as THREE from 'three';

const SPHERE = new THREE.SphereGeometry(1, 20, 14);
const LEG = new THREE.CylinderGeometry(0.035, 0.025, 1, 6).translate(0, -0.5, 0);
const ANTENNA = new THREE.CylinderGeometry(0.018, 0.018, 1, 5).translate(0, 0.5, 0);
const WING = new THREE.CircleGeometry(1, 3);

const SHAPES = {
  beetle: { body: [0.5, 0.36, 0.62], head: 0.27, headZ: 0.66, legs: 3, legLen: 0.62 },
  mite: { body: [0.46, 0.4, 0.5], head: 0.24, headZ: 0.52, legs: 3, legLen: 0.55 },
  roach: { body: [0.4, 0.28, 0.85], head: 0.24, headZ: 0.9, legs: 3, legLen: 0.66 },
  racer: { body: [0.34, 0.26, 0.74], head: 0.22, headZ: 0.8, legs: 3, legLen: 0.6 },
  slug: { body: [0.42, 0.34, 0.9], head: 0.3, headZ: 0.82, legs: 0, legLen: 0 },
  moth: { body: [0.3, 0.26, 0.66], head: 0.22, headZ: 0.7, legs: 3, legLen: 0.5 },
};

/**
 * Builds a small procedural bug. Local +Z is forward, feet rest on y = 0.
 * Returns the group plus handles for animation and material tweaks.
 */
export function makeBug({
  color,
  accent = '#1a1c2c',
  shape = 'beetle',
  size = 1,
  transparent = false,
  eyes = true,
  stripe = null,
  emissive = null,
}) {
  const s = SHAPES[shape];
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(size);
  group.add(body);

  const main = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.05, transparent });
  const dark = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.6, transparent });
  if (emissive) {
    main.emissive = new THREE.Color(emissive);
    main.emissiveIntensity = 0.5;
  }
  const mats = [main, dark];
  const add = (geo, mat, parent = body) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    parent.add(m);
    return m;
  };

  const lift = s.legs ? 0.14 : 0.0;
  const by = s.body[1] + lift;

  const abdomen = add(SPHERE, main);
  abdomen.scale.set(...s.body);
  abdomen.position.y = by;

  const head = add(SPHERE, shape === 'slug' ? main : dark);
  head.scale.setScalar(s.head);
  head.position.set(0, by - 0.04, s.headZ);

  if (shape === 'beetle' || shape === 'mite' || shape === 'roach') {
    const seam = add(new THREE.BoxGeometry(0.03, 0.02, s.body[2] * 1.5), dark);
    seam.position.set(0, by + s.body[1] - 0.005, -0.05);
  }
  if (stripe) {
    const sm = new THREE.MeshStandardMaterial({ color: stripe, roughness: 0.4, transparent });
    mats.push(sm);
    const st = add(new THREE.BoxGeometry(0.16, 0.03, s.body[2] * 1.5), sm);
    st.position.set(0, by + s.body[1] - 0.012, -0.02);
  }
  if (shape === 'moth') {
    for (const side of [-1, 1]) {
      const w = add(WING, main);
      w.material.side = THREE.DoubleSide;
      w.scale.set(0.62, 0.5, 1);
      w.rotation.set(-Math.PI / 2, 0, side * 0.5 + Math.PI / 2);
      w.position.set(side * 0.5, by + 0.06, -0.12);
    }
  }

  // Eyes: on stalks for the slug, on the head for everything else.
  const eyeMats = [];
  if (eyes) {
    const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, transparent });
    const pupil = new THREE.MeshStandardMaterial({ color: '#12131f', roughness: 0.25, transparent });
    eyeMats.push(white, pupil);
    mats.push(white, pupil);
    for (const side of [-1, 1]) {
      const ex = side * s.head * 0.55;
      const ey = head.position.y + s.head * (shape === 'slug' ? 1.35 : 0.5);
      const ez = s.headZ + s.head * (shape === 'slug' ? 0.2 : 0.68);
      if (shape === 'slug') {
        const stalk = add(ANTENNA, main);
        stalk.scale.set(2.2, s.head * 1.2, 2.2);
        stalk.position.set(ex, head.position.y + s.head * 0.4, ez - 0.02);
      }
      const w = add(SPHERE, white);
      w.scale.setScalar(s.head * 0.42);
      w.position.set(ex, ey, ez);
      const p = add(SPHERE, pupil);
      p.scale.setScalar(s.head * 0.22);
      p.position.set(ex * 1.04, ey + 0.005, ez + s.head * 0.3);
    }
  }

  // Antennae
  const antennae = [];
  if (shape !== 'slug') {
    for (const side of [-1, 1]) {
      const a = add(ANTENNA, dark);
      a.scale.set(1, 0.42, 1);
      a.position.set(side * s.head * 0.45, head.position.y + s.head * 0.6, s.headZ + s.head * 0.3);
      a.rotation.set(0.9, 0, -side * 0.45);
      antennae.push(a);
    }
  }

  // Legs: pivots on the body sides, swung around X while walking.
  const legs = [];
  for (let i = 0; i < s.legs; i++) {
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      const z = (i - (s.legs - 1) / 2) * s.body[2] * 0.62;
      pivot.position.set(side * s.body[0] * 0.78, by - 0.02, z);
      const tilt = new THREE.Group();
      tilt.rotation.z = side * 1.0;
      const leg = add(LEG, dark, tilt);
      leg.scale.set(1, s.legLen, 1);
      pivot.add(tilt);
      body.add(pivot);
      legs.push({ pivot, offset: (i % 2 === 0 ? 0 : Math.PI) + (side > 0 ? 0 : Math.PI) });
    }
  }

  let phase = Math.random() * 10;
  return {
    group,
    body,
    main,
    mats,
    eyeMats,
    setOpacity(o) {
      for (const m of mats) m.opacity = o;
    },
    /** amount: 0 (still) .. 1 (full stride). */
    animate(dt, amount, rate = 14) {
      phase += dt * rate * (0.25 + amount);
      for (const l of legs) l.pivot.rotation.x = Math.sin(phase + l.offset) * 0.55 * amount;
      for (let i = 0; i < antennae.length; i++) {
        antennae[i].rotation.x = 0.9 + Math.sin(phase * 0.35 + i) * 0.12;
      }
      body.position.y = Math.abs(Math.sin(phase * 0.5)) * 0.03 * amount;
      if (shape === 'slug') abdomen.scale.z = s.body[2] * (1 + Math.sin(phase * 0.4) * 0.08 * (0.3 + amount));
    },
  };
}

/** Invisible, generous click target. colorWrite off keeps it raycastable but unseen. */
export function makeHit(radius) {
  const mat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  const hit = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), mat);
  hit.position.y = 0.3;
  hit.renderOrder = -1;
  return hit;
}
