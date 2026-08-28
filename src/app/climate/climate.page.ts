import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeviceMonitorService } from '../services/device-monitor';

@Component({
  selector: 'app-climate',
  templateUrl: './climate.page.html',
  styleUrls: ['./climate.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ClimatePage {
  public deviceService = inject(DeviceMonitorService);

  public advice = () => {
    const temp = this.deviceService.temperature();
    if (temp >= 60) return "🚨 EXTREME HEAT: Immediate evacuation recommended. Structure fire risk high.";
    if (temp >= 45) return "⚠️ EMERGENCY: Safety protocols active. Door unlocked for evacuation.";
    if (temp >= 40) return "🔥 CRITICAL: High temperature detected. System will auto-unlock at 45°C.";
    if (temp >= 30) return "🌡️ WARNING: Room is getting hot. Activate cooling systems immediately.";
    if (temp < 23) return "❄️ COOL: Room temperature is low. Heating is optional.";
    return "Environment is within target range.";
  };

  public adviceColor = () => {
    const temp = this.deviceService.temperature();
    if (temp >= 45) return 'var(--danger)';
    if (temp >= 30) return 'var(--warning)';
    return 'var(--text-dim)';
  };

  // Chart Logic Ported to Angular
  getChartBarStyles(value: number, index: number) {
    const minTemp = 20;
    const maxTemp = 60;
    const safetyLimit = 45;
    
    const tempHeight = Math.min(100, Math.max(8, ((value - minTemp) / (maxTemp - minTemp)) * 100));
    const isCritical = value >= safetyLimit;

    return {
      'height': `${tempHeight}%`,
      'width': '100%',
      'background': isCritical ? 'linear-gradient(180deg, #f43f5e, #991b1b)' : 'linear-gradient(180deg, #38bdf8, #1d4ed8)',
      'transition': 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      'border-radius': '6px 6px 2px 2px',
      'box-shadow': isCritical ? '0 0 10px rgba(244, 63, 94, 0.4)' : 'none'
    };
  }

  getThresholdPosition() {
    const minTemp = 20;
    const maxTemp = 60;
    const safetyLimit = 45;
    return Math.min(100, Math.max(8, ((safetyLimit - minTemp) / (maxTemp - minTemp)) * 100));
  }
}
