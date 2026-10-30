/**
 * Cyber Dino Web Audio API Synthesizer Engine
 * Generates all SFX and ambient background arpeggio purely through browser audio oscillators.
 * Zero external mp3 dependencies ensures 100% reliability in sandbox environments.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxVol: number = 0.8;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.sfxVol = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.sfxVol;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isMusicPlaying) {
      this.stopMusic();
      this.isMusicPlaying = true; // remember preference
    } else if (!this.isMuted && this.isMusicPlaying) {
      this.startMusic();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.initCtx();
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.isMusicPlaying = false;
    } else {
      this.isMusicPlaying = true;
      if (!this.isMuted) {
        this.startMusic();
      }
    }
    return this.isMusicPlaying;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  private startMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);
    const notes = [130.81, 155.56, 174.61, 196.0, 233.08, 196.0, 174.61, 155.56];
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], now);

        gain.gain.setValueAtTime(0.04 * this.sfxVol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
        noteIdx++;
      } catch {
        // audio context might be paused
      }
    }, 240);
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public play(type: 'jump' | 'doubleJump' | 'slide' | 'emp' | 'chrono' | 'shield' | 'pickup' | 'quantumCore' | 'hit' | 'gameOver' | 'click' | 'upgrade') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.15 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.06);
          break;

        case 'jump':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);
          gain.gain.setValueAtTime(0.24 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.17);
          break;

        case 'doubleJump':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(920, now + 0.2);
          gain.gain.setValueAtTime(0.3 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.21);
          break;

        case 'slide':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.18);
          gain.gain.setValueAtTime(0.15 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.19);
          break;

        case 'emp':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(900, now);
          osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
          gain.gain.setValueAtTime(0.4 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.46);
          break;

        case 'chrono':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(640, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
          gain.gain.setValueAtTime(0.28 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.36);
          break;

        case 'shield':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(700, now + 0.25);
          gain.gain.setValueAtTime(0.32 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.26);
          break;

        case 'pickup':
          osc.type = 'square';
          osc.frequency.setValueAtTime(587, now);
          osc.frequency.setValueAtTime(880, now + 0.07);
          gain.gain.setValueAtTime(0.18 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.17);
          break;

        case 'quantumCore':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.08);
          osc.frequency.setValueAtTime(1046, now + 0.16);
          gain.gain.setValueAtTime(0.3 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.29);
          break;

        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.24);
          gain.gain.setValueAtTime(0.38 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'gameOver':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.linearRampToValueAtTime(180, now + 0.2);
          osc.frequency.linearRampToValueAtTime(70, now + 0.52);
          gain.gain.setValueAtTime(0.35 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.start(now);
          osc.stop(now + 0.56);
          break;

        case 'upgrade':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
          gain.gain.setValueAtTime(0.3 * this.sfxVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
      }
    } catch {
      // Audio fallback silent
    }
  }
}

export const soundEngine = new SoundEngine();
