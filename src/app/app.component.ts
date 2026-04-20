import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationService } from './services/notification';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private notificationService = inject(NotificationService);

  constructor() {}

  async ngOnInit() {
    // Initialize Native Notifications on App Start
    await this.notificationService.init();
  }
}
