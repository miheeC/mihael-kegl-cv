import * as THREE from 'three';
import { makeBug, makeHit } from './bugModel.js';
import { blocked, DESK, PALETTE, WALK, WALK_Y } from './desk.js';

const rand = (a, b) => a + Math.random() * (b - a);
const UP = new THREE.Vector3(0, 1, 0);

function turnToward(current, target, maxStep) {
  let d = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return current + Math.max(-maxStep, Math.min(maxStep, d));
}

/** Random free spot in a region, preferring ones reachable in a straight line. */
function randomSpot(region, from, minDist = 0) {
  for (let i = 0; i < 40; i++) {
    const x = rand(region.x0, region.x1);
    const z = rand(region.z0, region.z1);
    if (blocked(x, z, 0.6)) continue;
    if (from) {
      if (Math.hypot(x - from.x, z - from.z) < minDist) continue;
      let clear = true;
      for (let k = 1; k < 8 && clear; k++) {
        const f = k / 8;
        if (blocked(from.x + (x - from.x) * f, from.z + (z - from.z) * f, 0.45)) clear = false;
      }
      if (!clear && i < 30 && minDist === 0) continue;
    }
    return { x, z };
  }
  return { x: 0, z: 2 };
}

/**
 * Base critter: a bug that wanders the desk mat.
 * state: 'active' (catchable), 'hidden' (temporarily away), 'caught', 'waiting' (not spawned yet)
 */
class Critter {
  constructor(def, game, model, { speed = 1.2, region = WALK, hitRadius = 0.85 } = {}) {
    this.def = def;
    this.id = def.id;
    this.game = game;
    this.speed = speed;
    this.region = region;
    this.state = 'active';
    this.model = makeBug({ color: def.color, ...model });
    this.root = this.model.group;
    this.hit = makeHit(hitRadius * game.hitScale);
    this.hit.userData.critter = this;
    this.root.add(this.hit);
    this.hits = [this.hit];
    this.heading = rand(0, Math.PI * 2);
    this.target = null;
    this.pause = rand(0, 1);
    this.stride = 0;
    const p = randomSpot(region);
    this.root.position.set(p.x, WALK_Y, p.z);
    game.scene.add(this.root);
  }

  get pos() {
    return this.root.position;
  }

  /** World-space point and surface normal used for the hint ring and for tests. */
  anchor() {
    return { point: this.root.position, normal: UP };
  }

  catchable() {
    return this.state === 'active';
  }

  moveToward(target, speed, dt) {
    const dx = target.x - this.pos.x;
    const dz = target.z - this.pos.z;
    this.heading = turnToward(this.heading, Math.atan2(dx, dz), dt * 7);
    const nx = this.pos.x + Math.sin(this.heading) * speed * dt;
    const nz = this.pos.z + Math.cos(this.heading) * speed * dt;
    if (blocked(nx, nz, 0.4)) {
      this.target = null;
      this.heading += 1.2;
      return false;
    }
    this.pos.x = nx;
    this.pos.z = nz;
    return true;
  }

  wander(dt, speed = this.speed) {
    if (this.pause > 0) {
      this.pause -= dt;
      this.stride += (0 - this.stride) * Math.min(1, dt * 10);
      return;
    }
    if (!this.target || Math.hypot(this.target.x - this.pos.x, this.target.z - this.pos.z) < 0.3) {
      this.target = randomSpot(this.region, this.pos);
      if (Math.random() < 0.4) this.pause = rand(0.3, 1.3);
    }
    const moved = this.moveToward(this.target, speed, dt);
    this.stride += ((moved ? 1 : 0) - this.stride) * Math.min(1, dt * 10);
  }

  update(dt) {
    this.wander(dt);
    this.finish(dt);
  }

  finish(dt) {
    this.root.rotation.y = this.heading;
    this.model.animate(dt, this.stride);
  }

  /** Returns { caught: true } or { miss: 'message', poof?: bool }. */
  attempt() {
    return { caught: true };
  }

  hide() {
    this.root.visible = false;
  }

  poofPoints() {
    return [this.pos.clone().setY(this.pos.y + 0.35)];
  }
}

class Flaky extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'beetle', emissive: def.color, size: 0.85 }, { speed: 1.5 });
    this.model.mats.forEach((m) => (m.transparent = true));
    this.clock = rand(0, 2);
    this.opacity = 1;
  }

  update(dt) {
    this.clock += dt;
    const lit = this.clock % 2.7 < 1.75;
    this.opacity += ((lit ? 1 : 0.05) - this.opacity) * Math.min(1, dt * 9);
    this.model.setOpacity(this.opacity);
    this.model.main.emissiveIntensity = 0.35 + this.opacity * 0.6;
    this.root.traverse((o) => {
      if (o.isMesh && o !== this.hit) o.castShadow = this.opacity > 0.4;
    });
    this.wander(dt);
    this.finish(dt);
  }

  attempt() {
    if (this.opacity < 0.45) return { miss: 'Test passed this time. That is a flaky test: catch it while it glows.' };
    return { caught: true };
  }
}

class Regression extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'roach', size: 0.85 }, { speed: 1.5, region: { x0: 2.2, x1: 7.2, z0: -0.4, z1: 3.9 } });
    this.lives = 2;
    this.away = 0;
    this.pop = 1;
  }

  update(dt) {
    if (this.state === 'hidden') {
      this.away -= dt;
      if (this.away <= 0) {
        this.state = 'active';
        this.root.visible = true;
        this.pos.set(-1, WALK_Y, -0.2);
        this.heading = 0;
        this.target = { x: 2.6, z: 1.6 };
        this.pause = 0;
        this.pop = 0;
        this.game.say('Regression: the bug you just fixed is back. Catch it again.', 'regress');
      }
      return;
    }
    this.pop = Math.min(1, this.pop + dt * 3);
    this.root.scale.setScalar(0.2 + 0.8 * this.pop);
    this.wander(dt);
    this.finish(dt);
  }

  attempt() {
    if (this.lives > 1) {
      this.lives = 1;
      this.state = 'hidden';
      this.away = 2.4;
      const res = { miss: 'Fixed and closed. That was easy…', poof: this.poofPoints(), sound: 'fixed' };
      this.root.visible = false;
      return res;
    }
    return { caught: true };
  }
}

class Race extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'racer', stripe: '#ffffff', size: 0.85 }, { hitRadius: 1.0 });
    // The base model becomes racer A; add racer B alongside it.
    this.a = { model: this.model, root: this.root };
    const modelB = makeBug({ color: def.color, shape: 'racer', stripe: '#ffffff', size: 0.85 });
    const hitB = makeHit(1.0 * game.hitScale);
    hitB.userData.critter = this;
    modelB.group.add(hitB);
    this.hits.push(hitB);
    game.scene.add(modelB.group);
    this.b = { model: modelB, root: modelB.group };
    this.angle = rand(0, Math.PI * 2);
    this.t = 0;
  }

  place(racer, angle) {
    const cx = 0.2;
    const cz = 1.75;
    const rx = 5.5;
    const rz = 1.85;
    racer.root.position.set(cx + Math.cos(angle) * rx, WALK_Y, cz + Math.sin(angle) * rz);
    // Tangent of the ellipse, travelling in +angle.
    racer.root.rotation.y = Math.atan2(-Math.sin(angle) * rx, Math.cos(angle) * rz);
  }

  update(dt) {
    this.t += dt;
    this.angle += dt * 1.15 * this.game.raceEase;
    this.place(this.a, this.angle);
    this.place(this.b, this.angle + 0.5 + Math.sin(this.t * 0.8) * 0.3);
    this.a.model.animate(dt, 1, 22);
    this.b.model.animate(dt, 1, 22);
  }

  hide() {
    this.a.root.visible = false;
    this.b.root.visible = false;
  }

  poofPoints() {
    return [this.a.root.position.clone().setY(0.4), this.b.root.position.clone().setY(0.4)];
  }
}

const HALF_W = DESK.w / 2;
const HALF_D = DESK.d / 2;
const FACES = [
  { len: DESK.w, start: [-HALF_W, HALF_D], dir: [1, 0], normal: [0, 0, 1] },
  { len: DESK.d, start: [HALF_W, HALF_D], dir: [0, -1], normal: [1, 0, 0] },
  { len: DESK.w, start: [HALF_W, -HALF_D], dir: [-1, 0], normal: [0, 0, -1] },
  { len: DESK.d, start: [-HALF_W, -HALF_D], dir: [0, 1], normal: [-1, 0, 0] },
];
const PERIMETER = FACES.reduce((a, f) => a + f.len, 0);

/** Walks the vertical outer sides of the desk slab. */
class Edge extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'beetle', size: 0.62 }, { speed: 1.5, hitRadius: 0.75 });
    this.s = rand(2, 12);
    this.normal = new THREE.Vector3(0, 0, 1);
    this.qTarget = new THREE.Quaternion();
    this.basis = new THREE.Matrix4();
    this.place(true);
  }

  place(snap) {
    let s = ((this.s % PERIMETER) + PERIMETER) % PERIMETER;
    let face = FACES[0];
    for (const f of FACES) {
      if (s <= f.len) {
        face = f;
        break;
      }
      s -= f.len;
    }
    const x = face.start[0] + face.dir[0] * s;
    const z = face.start[1] + face.dir[1] * s;
    this.normal.set(...face.normal);
    this.pos.set(x, -DESK.h / 2, z);
    const zAxis = new THREE.Vector3(face.dir[0], 0, face.dir[1]);
    const xAxis = new THREE.Vector3().crossVectors(this.normal, zAxis);
    this.basis.makeBasis(xAxis, this.normal, zAxis);
    this.qTarget.setFromRotationMatrix(this.basis);
    if (snap) this.root.quaternion.copy(this.qTarget);
  }

  anchor() {
    return { point: this.pos, normal: this.normal };
  }

  update(dt) {
    if (this.pause > 0) {
      this.pause -= dt;
      this.stride += (0 - this.stride) * Math.min(1, dt * 10);
    } else {
      this.s += this.speed * dt;
      this.stride += (1 - this.stride) * Math.min(1, dt * 10);
      if (Math.random() < dt * 0.12) this.pause = rand(0.6, 1.8);
    }
    this.place(false);
    this.root.quaternion.slerp(this.qTarget, Math.min(1, dt * 12));
    this.model.animate(dt, this.stride);
  }

  poofPoints() {
    return [this.pos.clone().addScaledVector(this.normal, 0.3)];
  }
}

class Leak extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'slug', size: 1 }, { speed: 0.6, hitRadius: 0.8 });
    this.age = rand(4, 10);
    this.trail = [];
    this.sinceDrop = 0;
    const geo = new THREE.CircleGeometry(1, 14);
    for (let i = 0; i < 34; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      game.scene.add(m);
      this.trail.push({ m, life: 0 });
    }
    this.next = 0;
  }

  growth() {
    return 0.35 + 1.15 * Math.min(1, this.age / 38);
  }

  update(dt) {
    this.age += dt;
    if (this.age > 46) {
      this.age = 0;
      this.game.poof(this.poofPoints(), this.def.color, 10);
    }
    const g = this.growth();
    this.root.scale.setScalar(g);
    // Keep the click target usable while the slug is still tiny.
    this.hit.scale.setScalar(Math.max(1, 0.75 / g));
    const before = { x: this.pos.x, z: this.pos.z };
    this.wander(dt);
    this.finish(dt);
    this.sinceDrop += Math.hypot(this.pos.x - before.x, this.pos.z - before.z);
    if (this.sinceDrop > 0.3 * g + 0.12) {
      this.sinceDrop = 0;
      const d = this.trail[this.next];
      this.next = (this.next + 1) % this.trail.length;
      d.life = 1;
      d.m.visible = true;
      d.m.position.set(this.pos.x - Math.sin(this.heading) * 0.5 * g, WALK_Y + 0.004, this.pos.z - Math.cos(this.heading) * 0.5 * g);
      d.m.scale.setScalar(0.22 * g);
    }
    this.fade(dt);
  }

  fade(dt) {
    for (const d of this.trail) {
      if (d.life <= 0) continue;
      d.life -= dt / 7;
      d.m.material.opacity = Math.max(0, d.life) * 0.5;
      if (d.life <= 0) d.m.visible = false;
    }
  }

  hide() {
    super.hide();
    for (const d of this.trail) d.life = Math.min(d.life, 0.25);
  }
}

class Contrast extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'moth', eyes: false, size: 1.05, accent: '#323c5e' }, { speed: 0.55, region: { x0: -6.2, x1: 1.5, z0: 0.2, z1: 3.8 } });
    this.model.main.color.set('#37426a');
    this.model.main.roughness = 0.85;
    this.on = false;
  }

  setContrast(on) {
    this.on = on;
    this.model.main.color.set(on ? this.def.color : '#37426a');
    this.model.main.emissive.set(on ? this.def.color : '#000000');
    this.model.main.emissiveIntensity = on ? 0.55 : 0;
    this.model.mats[1].color.set(on ? '#ffffff' : '#323c5e');
  }
}

class Heisen extends Critter {
  constructor(def, game) {
    super(def, game, { shape: 'mite', transparent: true, emissive: '#b9a8ff', size: 1.05, accent: '#6c5fb8' }, { speed: 1.5, hitRadius: 1.0 });
    this.state = 'waiting';
    this.root.visible = false;
    this.tries = 0;
    this.t = 0;
    this.pop = 1;
  }

  spawn() {
    const p = randomSpot({ x0: -5, x1: 6, z0: 0, z1: 3.6 });
    this.pos.set(p.x, WALK_Y, p.z);
    this.state = 'active';
    this.root.visible = true;
    this.pop = 0;
    this.game.poof(this.poofPoints(), this.def.color, 12);
  }

  update(dt) {
    if (this.state !== 'active') return;
    this.t += dt;
    this.pop = Math.min(1, this.pop + dt * 3);
    this.root.scale.setScalar(0.2 + 0.8 * this.pop);
    this.model.setOpacity(0.62 + Math.sin(this.t * 5) * 0.2);
    const ptr = this.game.pointerGround;
    const fresh = performance.now() - this.game.pointerMovedAt < 1200;
    if (ptr && fresh && !this.game.coarse) {
      const dx = this.pos.x - ptr.x;
      const dz = this.pos.z - ptr.z;
      const d = Math.hypot(dx, dz);
      if (d < 1.9 && d > 0.001) {
        const away = { x: this.pos.x + (dx / d) * 2, z: this.pos.z + (dz / d) * 2 };
        this.pause = 0;
        const moved = this.moveToward(away, 3.1, dt);
        if (!moved) this.target = randomSpot(this.region, this.pos);
        this.stride = 1;
        this.finish(dt);
        return;
      }
    }
    this.wander(dt);
    this.finish(dt);
  }

  attempt() {
    this.tries += 1;
    if (this.tries < 3) {
      const from = this.poofPoints();
      const p = randomSpot(this.region, this.pos, 5);
      this.pos.set(p.x, WALK_Y, p.z);
      this.target = null;
      this.pop = 0;
      return {
        miss: this.tries === 1 ? 'Cannot reproduce. It moved the moment you looked.' : 'Works on my machine. One more try.',
        poof: from,
        sound: 'warp',
      };
    }
    return { caught: true };
  }
}

export function createCritters(defs, game) {
  const make = {
    typo: (d) => new Critter(d, game, { shape: 'mite', size: 0.9 }, { speed: 0.85, region: { x0: -3.4, x1: 3.2, z0: 0.5, z1: 3.6 } }),
    flaky: (d) => new Flaky(d, game),
    regression: (d) => new Regression(d, game),
    race: (d) => new Race(d, game),
    edge: (d) => new Edge(d, game),
    leak: (d) => new Leak(d, game),
    contrast: (d) => new Contrast(d, game),
    heisen: (d) => new Heisen(d, game),
  };
  return defs.map((d) => make[d.id](d));
}

export { PALETTE };
