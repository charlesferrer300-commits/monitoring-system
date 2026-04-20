import { Injectable, inject } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { DeviceMonitorService } from './device-monitor';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private deviceService = inject(DeviceMonitorService);

  constructor() {}

  async init() {
    // Request permission to use push notifications
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied permissions!');
      return;
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // Listen for incoming notifications (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ', notification);
      // Even if foreground, we can trigger the siren if the notification contains emergency data
      if (notification.data?.type === 'emergency') {
        this.deviceService.triggerAlarm(notification.body || 'EMERGENCY DETECTED!');
      }
    });

    // Listen for when user clicks the notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ', notification);
      if (notification.notification.data?.type === 'emergency') {
        this.deviceService.triggerAlarm(notification.notification.body || 'EMERGENCY DETECTED!');
      }
    });
  }

  // Local-only Mock Notification (for testing without FCM server)
  async showLocalMockAlert(title: string, body: string) {
    // This uses the native notification system
    // In a real app, you would send this from Firebase Cloud Functions
    console.log(`Local Alert Mock: ${title} - ${body}`);
  }
}
