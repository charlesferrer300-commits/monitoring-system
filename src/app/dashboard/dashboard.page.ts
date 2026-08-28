import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeviceMonitorService } from '../services/device-monitor';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DashboardPage {
  public deviceService = inject(DeviceMonitorService);

  public statusGreeting = () => {
    if (this.deviceService.isAlarming()) return 'EMERGENCY: UNLOCKED';
    return this.deviceService.isLocked() ? 'Home is Secure' : 'Front Door is Open';
  };
}
