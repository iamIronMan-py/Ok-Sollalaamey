import bgmUrl from '../assets/married-life.mp3';
import barkUrl from '../assets/puppy-bark.mp3';
import takeoffUrl from '../assets/takeoff-sfx.mp3';
import landingUrl from '../assets/landing-sfx.mp3';

class StoryAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgm: HTMLAudioElement | null = null;
  private bgmFade = 0;
  private barkBase: HTMLAudioElement | null = null;
  private takeoffAudio: HTMLAudioElement | null = null;
  private landingAudio: HTMLAudioElement | null = null;
  private cruiseAudio: HTMLAudioElement | null = null;
  private cruiseFade = 0;
  private cruiseTarget = 0;
  muted = false;
  private unlocked = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.5;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  unlock() {
    const ctx = this.ensure();
    if (!ctx) return;
    this.unlocked = true;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    this.startBgm();
  }

  setMuted(value: boolean) {
    this.muted = value;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(value ? 0 : 0.34, this.ctx.currentTime, 0.05);
    }
    if (this.bgmFade) {
      window.cancelAnimationFrame(this.bgmFade);
      this.bgmFade = 0;
    }
    if (this.bgm) {
      this.bgm.muted = value;
      if (value) {
        this.bgm.volume = 0;
      } else if (!this.bgm.paused) {
        this.fadeBgm(0.2, 500);
      } else {
        void this.bgm.play().then(() => this.fadeBgm(0.2, 800)).catch(() => undefined);
      }
    }
    if (this.cruiseAudio) {
      this.cruiseAudio.muted = value;
      if (value) {
        this.cruiseAudio.pause();
      } else if (this.cruiseTarget > 0) {
        void this.cruiseAudio.play().catch(() => undefined);
      }
    }
  }

  private fadeBgm(target: number, ms: number) {
    const audio = this.bgm;
    if (!audio) return;
    if (this.bgmFade) {
      window.cancelAnimationFrame(this.bgmFade);
      this.bgmFade = 0;
    }
    const from = audio.volume;
    const started = performance.now();
    const step = () => {
      const node = this.bgm;
      if (!node) {
        this.bgmFade = 0;
        return;
      }
      const k = Math.min(1, (performance.now() - started) / Math.max(1, ms));
      node.volume = Math.min(1, Math.max(0, from + (target - from) * k));
      if (k < 1) {
        this.bgmFade = window.requestAnimationFrame(step);
      } else {
        this.bgmFade = 0;
      }
    };
    this.bgmFade = window.requestAnimationFrame(step);
  }

  private startBgm() {
    if (!this.bgm) {
      const audio = new Audio(bgmUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.muted = true;
      this.bgm = audio;
      void audio.play().then(() => {
        if (!this.muted) {
          audio.muted = false;
          this.fadeBgm(0.2, 2200);
        }
      }).catch(() => {
        audio.muted = this.muted;
      });
      return;
    }
    if (this.bgm.paused) {
      void this.bgm.play().then(() => {
        if (!this.muted) {
          this.bgm!.muted = false;
          this.fadeBgm(0.2, 1400);
        }
      }).catch(() => undefined);
      return;
    }
    if (!this.muted) {
      if (this.bgm.muted) this.bgm.muted = false;
      if (!this.bgmFade && this.bgm.volume < 0.005) this.fadeBgm(0.2, 900);
    }
  }

  private rampCruise(target: number, ms = 700) {
    this.cruiseTarget = target;
    const audio = this.cruiseAudio;
    if (!audio) return;
    if (this.cruiseFade) return;
    const started = performance.now();
    const from = audio.volume;
    const step = () => {
      const node = this.cruiseAudio;
      if (!node) {
        this.cruiseFade = 0;
        return;
      }
      const k = Math.min(1, (performance.now() - started) / Math.max(1, ms));
      node.volume = from + (this.cruiseTarget - from) * k;
      if (k < 1) {
        this.cruiseFade = window.requestAnimationFrame(step);
      } else {
        this.cruiseFade = 0;
        if (this.cruiseTarget <= 0.001) node.pause();
      }
    };
    this.cruiseFade = window.requestAnimationFrame(step);
  }

  startCruise() {
    if (this.muted || !this.unlocked) return;
    const ctx = this.ensure();
    if (ctx?.state === 'suspended') void ctx.resume().catch(() => undefined);
    if (!this.cruiseAudio) {
      const audio = new Audio(takeoffUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.playbackRate = 0.82;
      this.cruiseAudio = audio;
      void audio.play().then(() => this.rampCruise(0.09, 900)).catch(() => undefined);
      return;
    }
    if (this.cruiseAudio.paused) {
      void this.cruiseAudio.play().then(() => this.rampCruise(0.09, 900)).catch(() => undefined);
    } else {
      this.rampCruise(0.09, 600);
    }
  }

  stopCruise() {
    if (!this.cruiseAudio) return;
    if (this.cruiseAudio.paused) return;
    this.rampCruise(0, 800);
  }

  setFlight(_t: number | null) {
    // continuous airplane/engine sound intentionally disabled
  }

  stopTakeoff() {
    if (this.takeoffAudio) {
      this.takeoffAudio.pause();
      this.takeoffAudio.currentTime = 0;
    }
  }

  stopLanding() {
    if (this.landingAudio) {
      this.landingAudio.pause();
      this.landingAudio.currentTime = 0;
    }
  }

  play(cue: string) {
    if (this.muted || !this.unlocked) return;
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
    if (cue === 'bark') {
      const audio = this.barkBase ? (this.barkBase.cloneNode(true) as HTMLAudioElement) : new Audio(barkUrl);
      if (!this.barkBase) this.barkBase = audio;
      audio.currentTime = 0;
      audio.volume = 0.45;
      void audio.play().catch(() => undefined);
      return;
    }
    if (cue === 'takeoff') {
      if (!this.takeoffAudio) this.takeoffAudio = new Audio(takeoffUrl);
      this.takeoffAudio.currentTime = 0;
      this.takeoffAudio.volume = 0.45;
      void this.takeoffAudio.play().catch(() => undefined);
      return;
    }
    if (cue === 'landing') {
      if (!this.landingAudio) this.landingAudio = new Audio(landingUrl);
      this.landingAudio.currentTime = 0;
      this.landingAudio.volume = 0.5;
      void this.landingAudio.play().catch(() => undefined);
      return;
    }
  }
}

export const storyAudio = new StoryAudio();
