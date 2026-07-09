import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PushSubscriptionRegistration } from '../model/push-subscription-registration';
import { PushNotificationService } from 'src/services/push-notification.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent implements OnInit {

  pushAvailable: boolean = false;
  permission: NotificationPermission | string = 'default';
  hasLocalSubscription: boolean = false;
  ownSubscriptions: PushSubscriptionRegistration[] = [];
  isWorking: boolean = false;

  constructor(private pushNotificationService: PushNotificationService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.refreshState();
  }

  refreshState(): void {
    this.pushAvailable = this.pushNotificationService.isPushAvailable();
    this.permission = this.pushNotificationService.getNotificationPermission();

    if (this.pushAvailable) {
      this.pushNotificationService.getLocalSubscription().subscribe(subscription => {
        this.hasLocalSubscription = subscription != null;
      });
    }

    this.pushNotificationService.getOwnSubscriptions().subscribe({
      next: subscriptions => {
        this.ownSubscriptions = subscriptions;
      },
      error: () => {
        this.ownSubscriptions = [];
      }
    });
  }

  async registerCurrentDevice(): Promise<void> {
    this.isWorking = true;
    try {
      const registerRequest = await this.pushNotificationService.registerCurrentDevice();
      registerRequest.subscribe({
        next: errorMessage => {
          this.isWorking = false;
          if (errorMessage != null && errorMessage.errorMessage != null && errorMessage.errorMessage.trim().length !== 0) {
            this.snackBar.open(errorMessage.errorMessage, '', { duration: 4000 });
          } else {
            this.snackBar.open('Push-Benachrichtigungen auf diesem Gerät aktiviert', '', { duration: 4000 });
            this.refreshState();
          }
        },
        error: () => {
          this.isWorking = false;
          this.snackBar.open('Push-Registrierung fehlgeschlagen', '', { duration: 4000 });
        }
      });
    } catch (error: any) {
      this.isWorking = false;
      this.snackBar.open(error && error.message ? error.message : 'Push-Registrierung fehlgeschlagen', '', { duration: 5000 });
    }
  }

  async unregisterCurrentDevice(): Promise<void> {
    this.isWorking = true;
    try {
      const unregisterRequest = await this.pushNotificationService.unregisterCurrentDevice();
      unregisterRequest.subscribe({
        next: errorMessage => {
          this.isWorking = false;
          if (errorMessage != null && errorMessage.errorMessage != null && errorMessage.errorMessage.trim().length !== 0) {
            this.snackBar.open(errorMessage.errorMessage, '', { duration: 4000 });
          } else {
            this.snackBar.open('Push-Benachrichtigungen auf diesem Gerät deaktiviert', '', { duration: 4000 });
            this.refreshState();
          }
        },
        error: () => {
          this.isWorking = false;
          this.snackBar.open('Push-Deaktivierung fehlgeschlagen', '', { duration: 4000 });
        }
      });
    } catch (error: any) {
      this.isWorking = false;
      this.snackBar.open(error && error.message ? error.message : 'Push-Deaktivierung fehlgeschlagen', '', { duration: 5000 });
    }
  }
}
