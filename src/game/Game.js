import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildDesk, DESK } from './desk.js';
import { createCritters } from './critters.js';
import { Sound } from './sound.js';

const HOME = { azimuth: 0.5, polar: 0.93 };
const TARGET = new THREE.Vector3(0, 0.2, 0);
const UP = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const GROUND = new THREE.Plane(UP, 0);
const SLAB = new THREE.Box3(new THREE.Vector3(-DESK.w / 2, -DESK.h, -DESK.d / 2), new THREE.Vector3(DESK.w / 2, 0, DESK.d / 2));
const ease = (k) => 1 - Math.pow(1 - k, 3);

export class Game {
  /**
   * @param {HTMLElement} container
   * @param {Array} defs bug definitions, in ticket order
   * @param {{onCatch?: Function, onSay?: Function}} handlers
   */
  constructor(container, defs, handlers = {}) {
    this.container = container;
    this.defs = defs;
    this.handlers = handlers;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.coarse = window.matchMedia('(pointer: coarse)').matches;
    this.hitScale = this.coarse ? 1.4 : 1;
    this.raceEase = this.coarse || this.reduced ? 0.7 : 1;
    this.mode = 'intro';
    this.paused = false;
    this.caught = new Set();
    this.sound = new Sound();
    this.pointer = new THREE.Vector2();
    this.pointerGround = null;
    this.pointerMovedAt = 0;
    this.raycaster = new THREE.Raycaster();
    this.shift = 1; // 1 = scene pushed aside for the intro card, 0 = centred
    this.shiftTarget = 1;
    this.tween = null;
    this.pendingHeisen = false;
    this.confettiTime = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);
    this.renderer = renderer;
    this.canvas = renderer.domElement;
    this.canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.5, 300);

    this.scene.add(new THREE.HemisphereLight('#9aabff', '#2a1d44', 1.0));
    const key = new THREE.DirectionalLight('#cdd6ff', 1.6);
    key.position.set(-8, 13, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -13, right: 13, top: 10, bottom: -10, near: 1, far: 45 });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    this.scene.add(key);

    this.desk = buildDesk(this.scene);
    this.critters = createCritters(defs, this);
    this.byId = Object.fromEntries(this.critters.map((c) => [c.id, c]));
    this.refreshScreen();
    this.buildEffects();

    this.controls = new OrbitControls(this.camera, this.canvas);
    Object.assign(this.controls, {
      enablePan: false,
      enableDamping: true,
      dampingFactor: 0.09,
      rotateSpeed: 0.7,
      zoomSpeed: 0.6,
      minPolarAngle: 0.3,
      maxPolarAngle: 1.5,
      enabled: false,
    });
    this.controls.target.copy(TARGET);

    this.size = { w: 1, h: 1 };
    this.radius = 24;
    this.resize();
    this.setCamera(HOME.azimuth - 0.5, HOME.polar, this.radius * 1.25); // pulled back behind the intro card

    this.onDown = (e) => {
      this.sound.unlock();
      this.down = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    this.onUp = (e) => {
      const d = this.down;
      this.down = null;
      if (!d) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8 && performance.now() - d.t < 700) this.click(e.clientX, e.clientY);
    };
    this.onMove = (e) => {
      this.pointerMovedAt = performance.now();
      this.aim(e.clientX, e.clientY);
      const hit = new THREE.Vector3();
      this.pointerGround = this.raycaster.ray.intersectPlane(GROUND, hit) ? hit : null;
      if (!this.coarse) this.canvas.style.cursor = this.mode === 'play' && !this.paused && this.pick() ? 'pointer' : 'grab';
    };
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);

    this.last = performance.now();
    this.time = 0;
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
  }

  // ---------- camera ----------

  setCamera(azimuth, polar, radius) {
    this.camera.position.set(
      TARGET.x + radius * Math.sin(polar) * Math.sin(azimuth),
      TARGET.y + radius * Math.cos(polar),
      TARGET.z + radius * Math.sin(polar) * Math.cos(azimuth),
    );
    this.camera.lookAt(TARGET);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return; // hidden while the CV page is open
    this.size = { w, h };
    this.renderer.setSize(w, h);
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? 48 : 35;
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const fit = Math.max(9.6 / tanV, (aspect < 1 ? 10.8 : 12.4) / (tanV * aspect));
    const prev = this.radius;
    this.radius = fit;
    if (this.controls) {
      this.controls.minDistance = fit * 0.5;
      this.controls.maxDistance = fit * 1.3;
      if (prev) {
        const offset = this.camera.position.clone().sub(TARGET);
        offset.setLength(offset.length() * (fit / prev));
        this.camera.position.copy(TARGET).add(offset);
      }
    }
    this.applyShift();
  }

  applyShift() {
    const { w, h } = this.size;
    if (this.shift < 0.002) {
      this.camera.clearViewOffset();
    } else if (w >= 900) {
      this.camera.setViewOffset(w, h, -w * 0.2 * this.shift, 0, w, h);
    } else {
      this.camera.setViewOffset(w, h, 0, h * 0.2 * this.shift, w, h);
    }
    this.camera.updateProjectionMatrix();
  }

  // ---------- effects ----------

  buildEffects() {
    const ringMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthTest: false, side: THREE.DoubleSide });
    this.ring = { mesh: new THREE.Mesh(new THREE.RingGeometry(0.95, 1.12, 48), ringMat), critter: null, until: 0 };
    this.ring.mesh.renderOrder = 10;
    this.ring.mesh.visible = false;
    this.scene.add(this.ring.mesh);

    const rippleMat = new THREE.MeshBasicMaterial({ color: '#9fb0ff', transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.ripple = { mesh: new THREE.Mesh(new THREE.RingGeometry(0.8, 0.9, 40), rippleMat), life: 0 };
    this.ripple.mesh.rotation.x = -Math.PI / 2;
    this.ripple.mesh.visible = false;
    this.scene.add(this.ripple.mesh);

    const chip = new THREE.IcosahedronGeometry(0.1, 0);
    this.poofs = [];
    for (let i = 0; i < 90; i++) {
      const m = new THREE.Mesh(chip, new THREE.MeshBasicMaterial({ color: '#fff', transparent: true }));
      m.visible = false;
      this.scene.add(m);
      this.poofs.push({ m, v: new THREE.Vector3(), life: 0 });
    }
    this.nextPoof = 0;

    this.confetti = [];
    if (!this.reduced) {
      const paper = new THREE.PlaneGeometry(0.26, 0.14);
      for (let i = 0; i < 130; i++) {
        const color = this.defs[i % this.defs.length].color;
        const m = new THREE.Mesh(paper, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
        m.visible = false;
        this.scene.add(m);
        this.confetti.push({ m, vy: 0, spin: new THREE.Vector3() });
      }
    }
  }

  poof(points, color, count = 14) {
    for (const p of points) {
      for (let i = 0; i < count; i++) {
        const f = this.poofs[this.nextPoof];
        this.nextPoof = (this.nextPoof + 1) % this.poofs.length;
        f.m.position.copy(p);
        f.m.material.color.set(i % 4 === 0 ? '#ffffff' : color);
        f.m.visible = true;
        f.life = 0.55 + Math.random() * 0.35;
        const a = Math.random() * Math.PI * 2;
        const s = 1.2 + Math.random() * 3;
        f.v.set(Math.cos(a) * s, 2 + Math.random() * 3.5, Math.sin(a) * s);
      }
    }
  }

  updateEffects(dt, t) {
    for (const f of this.poofs) {
      if (f.life <= 0) continue;
      f.life -= dt;
      f.v.y -= 11 * dt;
      f.m.position.addScaledVector(f.v, dt);
      f.m.scale.setScalar(Math.max(0.01, f.life * 1.6));
      f.m.rotation.x += dt * 8;
      if (f.life <= 0) f.m.visible = false;
    }

    const r = this.ring;
    const c = r.critter;
    if (c && c.state === 'active' && performance.now() < r.until) {
      const { point, normal } = c.anchor();
      r.mesh.visible = true;
      r.mesh.position.copy(point).addScaledVector(normal, 0.08);
      r.mesh.quaternion.setFromUnitVectors(Z, normal);
      const pulse = this.reduced ? 0.5 : (t * 1.4) % 1;
      r.mesh.scale.setScalar(0.9 + pulse * 0.9);
      r.mesh.material.opacity = 0.95 - pulse * 0.7;
    } else {
      r.mesh.visible = false;
    }

    if (this.ripple.life > 0) {
      this.ripple.life -= dt * 2.6;
      const k = 1 - Math.max(0, this.ripple.life);
      this.ripple.mesh.scale.setScalar(0.2 + k * 0.9);
      this.ripple.mesh.material.opacity = (1 - k) * 0.7;
      if (this.ripple.life <= 0) this.ripple.mesh.visible = false;
    }

    if (this.confettiTime > 0 || this.confetti.some((p) => p.m.visible)) {
      this.confettiTime -= dt;
      for (const p of this.confetti) {
        if (!p.m.visible) continue;
        p.m.position.y -= p.vy * dt;
        p.m.position.x += Math.sin(t * 2 + p.vy * 3) * dt * 0.6;
        p.m.rotation.x += p.spin.x * dt;
        p.m.rotation.y += p.spin.y * dt;
        if (p.m.position.y < -5) {
          if (this.confettiTime > 0) this.dropConfetti(p, 12);
          else p.m.visible = false;
        }
      }
    }
  }

  dropConfetti(p, y) {
    p.m.visible = true;
    p.m.position.set((Math.random() - 0.5) * 22, y + Math.random() * 10, (Math.random() - 0.5) * 14);
    p.vy = 2.5 + Math.random() * 3;
    p.spin.set(2 + Math.random() * 6, 2 + Math.random() * 6, 0);
  }

  // ---------- input ----------

  aim(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  /** Critter under the current ray, ignoring anything hidden behind the desk slab. */
  pick() {
    const targets = this.critters.filter((c) => c.state === 'active').flatMap((c) => c.hits);
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    if (!hit) return null;
    const slab = this.raycaster.ray.intersectBox(SLAB, new THREE.Vector3());
    if (slab && slab.distanceTo(this.raycaster.ray.origin) < hit.distance - 0.25) return null;
    return hit.object.userData.critter;
  }

  click(clientX, clientY) {
    if (this.mode !== 'play' || this.paused) return;
    this.aim(clientX, clientY);
    const critter = this.pick();
    if (critter) {
      this.resolve(critter);
      return;
    }
    const p = this.raycaster.ray.intersectPlane(GROUND, new THREE.Vector3());
    if (p && Math.abs(p.x) < DESK.w / 2 && Math.abs(p.z) < DESK.d / 2) {
      this.ripple.mesh.position.set(p.x, 0.06, p.z);
      this.ripple.mesh.visible = true;
      this.ripple.life = 1;
    }
  }

  resolve(critter) {
    const res = critter.attempt();
    if (res.caught) {
      critter.state = 'caught';
      this.poof(critter.poofPoints(), critter.def.color, 16);
      critter.hide();
      this.caught.add(critter.id);
      this.sound.play('catch');
      this.refreshScreen();
      if (this.caught.size === this.defs.length - 1 && this.byId.heisen?.state === 'waiting') this.pendingHeisen = true;
      this.handlers.onCatch?.(critter.id);
    } else {
      if (res.poof) this.poof(res.poof, critter.def.color, 10);
      this.say(res.miss, res.sound || 'miss');
    }
  }

  // ---------- API used by the React layer ----------

  start() {
    this.sound.unlock();
    this.mode = 'play';
    this.shiftTarget = 0;
    const offset = this.camera.position.clone().sub(TARGET);
    const from = new THREE.Spherical().setFromVector3(offset);
    // Take the short way round to the home angle.
    let d = ((HOME.azimuth - from.theta + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    this.tween = { k: 0, from, to: { theta: from.theta + d, phi: HOME.polar, radius: this.radius } };
    if (this.reduced) this.tween.k = 0.999;
  }

  /** Stops rendering while the game is hidden behind the CV page. */
  setRunning(on) {
    if (this.disposed || on === !!this.raf) return;
    if (on) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
      this.resize();
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  setPaused(paused) {
    this.paused = paused;
    this.controls.enabled = !paused && this.mode !== 'intro' && !this.tween;
    if (!paused && this.pendingHeisen) {
      this.pendingHeisen = false;
      setTimeout(() => {
        if (this.disposed) return;
        this.byId.heisen.spawn();
        this.say('One blocker left, and nobody can reproduce it. A Heisenbug just appeared.', 'spawn');
      }, 500);
    }
  }

  say(message, sound) {
    if (sound) this.sound.play(sound);
    this.handlers.onSay?.(message);
  }

  setMuted(muted) {
    this.sound.muted = muted;
  }

  setContrast(on) {
    this.byId.contrast?.setContrast(on);
  }

  /** Pings a bug with a ring. Returns the hint text. */
  hint(id) {
    const critter = id ? this.byId[id] : this.critters.find((c) => c.state === 'active');
    if (!critter || critter.state !== 'active') return 'Nothing to ping right now. Give it a second.';
    this.ring.critter = critter;
    this.ring.until = performance.now() + 4500;
    this.sound.play('hint');
    return critter.def.hint;
  }

  /** Keyboard focus highlight for a bug chip. */
  focus(id) {
    if (!id) {
      if (this.ring.until === Infinity) this.ring.critter = null;
      return;
    }
    this.ring.critter = this.byId[id];
    this.ring.until = Infinity;
  }

  /** Keyboard path: try to catch a bug without pointing at it. Same rules apply. */
  attemptById(id) {
    if (this.mode !== 'play' || this.paused) return;
    const critter = this.byId[id];
    if (!critter) return;
    if (critter.state !== 'active') {
      this.say(critter.state === 'waiting' ? 'It has not shown up yet. File the other seven first.' : 'It is not on the desk right now. Try again in a moment.');
      return;
    }
    this.resolve(critter);
  }

  finale() {
    this.mode = 'done';
    this.sound.play('ship');
    this.confettiTime = 6;
    this.confetti.forEach((p, i) => this.dropConfetti(p, 8 + (i % 10)));
  }

  refreshScreen() {
    this.desk.screen.draw({
      caught: this.defs.map((d) => this.caught.has(d.id)),
      colors: this.defs.map((d) => d.color),
    });
  }

  /** Screen positions of a bug's click targets. Used by the Playwright suite. */
  locate(id) {
    const critter = this.byId[id];
    if (!critter) return null;
    const rect = this.canvas.getBoundingClientRect();
    this.camera.updateMatrixWorld();
    const points = critter.hits.map((hit) => {
      const v = hit.getWorldPosition(new THREE.Vector3()).project(this.camera);
      return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
    });
    return { state: critter.state, points };
  }

  // ---------- loop ----------

  frame(now) {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const t = this.time;

    if (Math.abs(this.shift - this.shiftTarget) > 0.001) {
      this.shift += (this.shiftTarget - this.shift) * Math.min(1, dt * 4);
      if (Math.abs(this.shift - this.shiftTarget) <= 0.001) this.shift = this.shiftTarget;
      this.applyShift();
    }

    if (this.tween) {
      const tw = this.tween;
      tw.k = Math.min(1, tw.k + dt / 1.1);
      const k = ease(tw.k);
      const s = tw.from;
      this.setCamera(s.theta + (tw.to.theta - s.theta) * k, s.phi + (tw.to.phi - s.phi) * k, s.radius + (tw.to.radius - s.radius) * k);
      if (tw.k >= 1) {
        this.tween = null;
        this.controls.enabled = !this.paused;
      }
    } else if (!this.reduced && (this.mode === 'intro' || (this.mode === 'done' && !this.down))) {
      const offset = this.camera.position.clone().sub(TARGET).applyAxisAngle(UP, dt * (this.mode === 'intro' ? 0.07 : 0.1));
      this.camera.position.copy(TARGET).add(offset);
      this.camera.lookAt(TARGET);
    }
    if (!this.tween && this.mode !== 'intro') this.controls.update();

    for (const c of this.critters) {
      if (c.state === 'caught') {
        if (c.fade) c.fade(dt);
        continue;
      }
      c.update(dt, t);
    }
    this.desk.update(t, this.reduced);
    this.updateEffects(dt, t);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.controls.dispose();
    this.sound.dispose();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
    });
    this.renderer.dispose();
    this.canvas.remove();
  }
}
