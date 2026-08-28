import { Component, OnInit, inject, signal } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { NotificationService } from './services/notification';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgIf],
})
export class AppComponent implements OnInit {
  private notificationService = inject(NotificationService);
  showSplash = signal(true);

  constructor() {}

  async ngOnInit() {
    // Hide the native splash screen ONLY AFTER Angular is ready
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.hide();
    }

    // Hide web splash screen after 2.5 seconds to allow CSS animation to play
    setTimeout(() => {
      this.showSplash.set(false);
    }, 2500);

    // Initialize Native Notifications on App Start
    await this.notificationService.init();
  }
}
