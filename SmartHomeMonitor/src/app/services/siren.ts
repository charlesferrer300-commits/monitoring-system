import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SirenService {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private isAlarming = false;
  private sirenInterval: any = null;

  constructor() {}

  startSiren() {
    if (this.audioCtx) return;

    this.isAlarming = true;
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillator = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    this.oscillator.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Siren effect modulation
    this.sirenInterval = setInterval(() => {
      if (this.isAlarming && this.audioCtx && this.oscillator) {
        this.oscillator.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.5);
        this.oscillator.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 1.0);
      }
    }, 1000);

    this.oscillator.start();
  }

  stopSiren() {
    this.isAlarming = false;
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
