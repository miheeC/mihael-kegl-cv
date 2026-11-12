// Tiny WebAudio synth: no audio files. Created lazily on the first user gesture.
const TUNES = {
  catch: { notes: [523, 784, 1047], step: 0.07, dur: 0.16, type: 'triangle', vol: 0.16 },
  miss: { notes: [196, 165], step: 0.08, dur: 0.14, type: 'sine', vol: 0.12 },
  fixed: { notes: [659, 880], step: 0.09, dur: 0.14, type: 'triangle', vol: 0.12 },
  regress: { notes: [440, 349, 277], step: 0.11, dur: 0.2, type: 'sawtooth', vol: 0.06 },
  warp: { notes: [880, 1320, 660], step: 0.05, dur: 0.1, type: 'sine', vol: 0.1 },
  hint: { notes: [988, 1319], step: 0.12, dur: 0.22, type: 'sine', vol: 0.08 },
  spawn: { notes: [330, 440, 554], step: 0.1, dur: 0.2, type: 'sine', vol: 0.1 },
  ship: { notes: [523, 659, 784, 1047, 1319], step: 0.11, dur: 0.32, type: 'triangle', vol: 0.15 },
};

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }

  play(name) {
    const tune = TUNES[name];
    if (!tune || this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    tune.notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = tune.type;
      osc.frequency.value = freq;
      const t0 = now + i * tune.step;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(tune.vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tune.dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + tune.dur + 0.02);
    });
  }

  dispose() {
    if (this.ctx) this.ctx.close().catch(() => {});
    this.ctx = null;
  }
}
