import { Injectable, signal, computed, effect } from '@angular/core';
import { SirenService } from './siren';

export interface DeviceLog {
  text: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceMonitorService {
  // State using Signals
  isLocked = signal(true);
  temperature = signal(24.8);
  humidity = signal(47);
  latencyMs = signal(12);
  signalStrength = signal(98);
  networkHealth = signal(96);
  isAlarming = signal(false);
  smokeActive = signal(false);
  
  temperatureHistory = signal<number[]>([24.2, 24.5, 24.8, 25.0, 25.2, 24.9, 24.7, 24.8, 25.1, 25.0, 24.9, 24.8]);
  logs = signal<DeviceLog[]>([
    { text: "System secured by user", time: "08:42 AM" },
    { text: "Environment sensor updated", time: "08:31 AM" },
    { text: "Door unlocked via Mobile App", time: "08:15 AM" },
    { text: "System started successfully", time: "07:30 AM" }
  ]);

  private isManualMode = false;
  private bc = new BroadcastChannel('iot_simulation');

  constructor(private sirenService: SirenService) {
    // FIREBASE READY: This is where we will call this.setupFirebaseListeners() in Phase 4
    this.setupSimulationListener();
    
    // Auto-update data loop
    setInterval(() => this.updateData(), 3000);

    // Effect to handle siren and body class based on alarm state
    effect(() => {
      if (this.isAlarming()) {
        this.sirenService.startSiren();
        document.body.classList.add('emergency-mode');
      } else {
        this.sirenService.stopSiren();
        document.body.classList.remove('emergency-mode');
      }
    });
  }

  // PHASE 4 PLACEHOLDER: Ready to plug in Firebase SDK
  private setupFirebaseListeners() {
    /*
      onValue(ref(db, 'devices/frontDoor/isLocked'), (snapshot) => {
        this.isLocked.set(snapshot.val());
      });
      ... and so on for temperature, smoke, etc.
    */
  }

  private setupSimulationListener() {
    this.bc.onmessage = (event) => {
      const { type, value } = event.data;
      this.isManualMode = true;

      if (type === 'TEMP_CHANGE') {
        this.updateTemperature(parseFloat(value));
      }

      if (type === 'SMOKE_DETECTED') {
        this.smokeActive.set(value);
        if (value === true) {
          this.triggerAlarm("SMOKE DETECTED! Emergency Unlock Initiated.");
        } else {
          this.resetAlarm();
        }
      }
    };
  }

  private updateTemperature(newTemp: number) {
    this.temperature.set(newTemp);
    
    // Always update history so the graph moves
    const history = this.temperatureHistory();
    this.temperatureHistory.set([...history.slice(1), newTemp]);
    
    this.checkSafetyProtocols();
  }

  checkSafetyProtocols() {
    if (this.temperature() >= 45 && !this.isAlarming()) {
      this.triggerAlarm("CRITICAL TEMPERATURE! Emergency Unlock Initiated.");
    }
  }

  // Manual Simulation Triggers for Settings Tab
  simulateTempRise() {
    this.isManualMode = true;
    this.updateTemperature(this.temperature() + 10);
  }

  simulateSmoke() {
    this.isManualMode = true;
    const newState = !this.smokeActive();
    this.smokeActive.set(newState);
    if (newState) {
      this.triggerAlarm("SMOKE DETECTED! (Simulated)");
    } else {
      this.resetAlarm();
    }
  }

  triggerAlarm(message: string) {
    if (this.isAlarming()) return;
    this.isAlarming.set(true);
    this.isLocked.set(false);
    this.addLog(`⚠️ ${message}`);
  }

  resetAlarm() {
    this.isAlarming.set(false);
    this.smokeActive.set(false);
    this.isManualMode = false; // Allow auto-update again
    
    // IMPORTANT: Reset temperature to safe level so UI resets
    this.updateTemperature(24.8);
    
    this.addLog("System alarm cleared. Temperature normalized.");
  }

  toggleLock() {
    if (this.isAlarming()) return;
    const newState = !this.isLocked();
    this.isLocked.set(newState);
    this.addLog(newState ? "Door locked via Mobile App" : "Door unlocked via Mobile App");
  }

  pollDevices() {
    this.addLog("Manual status refresh triggered");
    this.updateData();
  }

  addLog(text: string) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const currentLogs = this.logs();
    const newLogs = [{ text, time }, ...currentLogs].slice(0, 8);
    this.logs.set(newLogs);
  }

  private updateData() {
    // If alarming, we don't randomize temp but we still update latency/health
    if (!this.isAlarming() && !this.isManualMode) {
      const currentTemp = this.temperature();
      const newTemp = parseFloat((currentTemp + (Math.random() * 0.6 - 0.3)).toFixed(1));
      this.updateTemperature(this.clamp(newTemp, 22.0, 29.5));
    }
    
    this.humidity.set(this.clamp(Math.round(this.humidity() + (Math.random() * 4 - 2)), 40, 62));
    this.latencyMs.set(this.clamp(Math.round(this.latencyMs() + (Math.random() * 4 - 2)), 7, 28));
    this.signalStrength.set(this.clamp(Math.round(this.signalStrength() + (Math.random() * 2 - 1)), 86, 100));
    
    const newHealth = Math.round((this.signalStrength() + (100 - this.latencyMs())) / 2);
    this.networkHealth.set(this.clamp(newHealth, 78, 99));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
