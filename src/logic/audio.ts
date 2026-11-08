// Web Audio API Sound Synthesizer for tactile feedback

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Subtle tactile UI click sound
  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Audio context error ignore
    }
  }

  // Wooden meeple placement "thump"
  playMeeplePlace() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio context error ignore
    }
  }

  // Prehistoric leather cup shake: muffled hollow rattle of wooden dice inside leather
  playDiceShake() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(220 + Math.random() * 260, t);
        osc.frequency.exponentialRampToValueAtTime(140 + Math.random() * 80, t + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 400, t);
        filter.Q.setValueAtTime(3, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
      }
    } catch {
      // Ignore
    }
  }

  // Wooden dice clatter and landing on felt/table
  playDiceLand() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [0, 0.04, 0.09, 0.14].forEach((delay, idx) => {
        const t = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380 - idx * 60 + Math.random() * 40, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.045);

        gain.gain.setValueAtTime(0.22 / (idx * 0.5 + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  // Dice roll rattle sound
  playDiceRoll() {
    this.playDiceShake();
    setTimeout(() => {
      this.playDiceLand();
    }, 320);
  }

  // Resource harvest chime
  playHarvest() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [440, 554, 659];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    } catch {
      // Ignore
    }
  }

  // Building or card purchase fanfare
  playPurchase() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.27);
      });
    } catch {
      // Ignore
    }
  }

  // Tool tap/use sound
  playTool() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore
    }
  }

  // Famine penalty buzz
  playFamine() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Ignore
    }
  }
}

// Celtic & Adventure Calm Ambient Music Synthesizer & Player
class AmbientMusicManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;
  private isRunning: boolean = false;
  private audioNodeGains: GainNode[] = [];
  private melodyInterval: any = null;
  private audioTag: HTMLAudioElement | null = null;
  private volume: number = 0.55;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('age_de_pierre_ambient_music');
      this.enabled = saved === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  start() {
    this.enabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('age_de_pierre_ambient_music', 'true');
    }

    if (this.isRunning) return;
    this.isRunning = true;

    // First try HTML5 audio file if exists
    try {
      if (!this.audioTag) {
        this.audioTag = new Audio('/audio/ambient_celtic.mp3');
        this.audioTag.loop = true;
        this.audioTag.volume = this.volume;
      }
      const playPromise = this.audioTag.play();
      if (playPromise) {
        playPromise.catch(() => {
          // If mp3 is not present or blocked, fallback gracefully to procedural Celtic synthesizer
          this.startProceduralCeltic();
        });
      }
    } catch {
      this.startProceduralCeltic();
    }
  }

  private startProceduralCeltic() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.audioNodeGains.push(masterGain);

      // 1. Celtic low drone: D2 (73.4 Hz) + A2 (110 Hz) with warm filter
      const droneOsc1 = ctx.createOscillator();
      const droneOsc2 = ctx.createOscillator();
      const droneFilter = ctx.createBiquadFilter();
      const droneGain = ctx.createGain();

      droneOsc1.type = 'sawtooth';
      droneOsc1.frequency.setValueAtTime(73.41, ctx.currentTime); // D2
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(110.00, ctx.currentTime); // A2

      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(180, ctx.currentTime);
      droneFilter.Q.setValueAtTime(3.5, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.25, ctx.currentTime);

      // Breathing LFO on drone filter
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // slow breathing cycle ~12s
      lfoGain.gain.setValueAtTime(60, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(droneFilter.frequency);
      lfo.start();

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();

      // 2. Soft Celtic Harp / Wooden Whistle pentatonic arpeggio generator
      // D Celtic Pentatonic: D4, E4, F#4, A4, B4, D5, E5
      const celticScale = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25];

      const playCelticNote = () => {
        if (!this.isRunning || !this.ctx) return;
        try {
          const noteFreq = celticScale[Math.floor(Math.random() * celticScale.length)];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

          // Gentle pluck envelope with long reverb-like decay
          const now = this.ctx.currentTime;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 3.4);
        } catch {
          // Ignore
        }
      };

      // Play first note immediately, then schedule calm Celtic notes every 2.5 to 5.5 seconds
      playCelticNote();
      this.melodyInterval = setInterval(() => {
        playCelticNote();
      }, 3500);

    } catch (e) {
      console.warn('Procedural Celtic audio error', e);
    }
  }

  stop() {
    this.enabled = false;
    this.isRunning = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('age_de_pierre_ambient_music', 'false');
    }

    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }

    if (this.audioTag) {
      try {
        this.audioTag.pause();
        this.audioTag.currentTime = 0;
      } catch {
        // Ignore
      }
    }

    this.audioNodeGains.forEach(g => {
      try {
        g.disconnect();
      } catch {}
    });
    this.audioNodeGains = [];
  }

  toggle(): boolean {
    if (this.enabled) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioTag) {
      this.audioTag.volume = this.volume;
    }
  }
}

export const sound = new SoundEffects();
export const ambientMusic = new AmbientMusicManager();
