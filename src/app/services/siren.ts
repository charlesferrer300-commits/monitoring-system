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

  startSiren(type: 'smoke' | 'temperature' | 'fire' = 'temperature') {
    if (this.audioCtx) return;

    this.isAlarming = true;
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillator = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (type === 'smoke') {
      this.oscillator.type = 'square'; // Smoke alarm beep
      this.oscillator.frequency.setValueAtTime(3000, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    } else if (type === 'fire') {
      this.oscillator.type = 'sawtooth'; // Fire engine siren
      this.oscillator.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    } else {
      this.oscillator.type = 'sine'; // Classic sound for temperature
      this.oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    }
    
    this.oscillator.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Siren effect modulation based on type
    if (type === 'smoke') {
      // Fast high-pitch beeps for smoke (toggling volume rapidly)
      let beepOn = true;
      this.sirenInterval = setInterval(() => {
        if (this.isAlarming && this.audioCtx) {
          beepOn = !beepOn;
          gain.gain.setValueAtTime(beepOn ? 0.2 : 0, this.audioCtx.currentTime);
        }
      }, 150);
    } else if (type === 'fire') {
      // Fire engine sweep (Wee-Woo)
      this.sirenInterval = setInterval(() => {
        if (this.isAlarming && this.audioCtx && this.oscillator) {
          this.oscillator.frequency.linearRampToValueAtTime(1200, this.audioCtx.currentTime + 0.4);
          this.oscillator.frequency.linearRampToValueAtTime(600, this.audioCtx.currentTime + 0.8);
        }
      }, 800);
    } else {
      // Undulating siren for temperature
      this.sirenInterval = setInterval(() => {
        if (this.isAlarming && this.audioCtx && this.oscillator) {
          this.oscillator.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.125);
          this.oscillator.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.25);
        }
      }, 250);
    }

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
