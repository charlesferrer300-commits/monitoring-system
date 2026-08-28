import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { NotificationService } from './services/notification';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgIf],
})
export class AppComponent implements OnInit {
  private notificationService = inject(NotificationService);
  showSplash = true;

  constructor() {}

  async ngOnInit() {
    // Hide splash screen after 2.5 seconds to allow animation to play
    setTimeout(() => {
      this.showSplash = false;
    }, 2500);

    // Initialize Native Notifications on App Start
    await this.notificationService.init();
  }
}
