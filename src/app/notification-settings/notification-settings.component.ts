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


  getCurrentDeviceStatusTitle(): string {
    if (!this.pushAvailable) return 'Push wird nicht unterstützt';
    if (this.hasLocalSubscription) return 'Push ist auf diesem Gerät aktiv';
    return 'Push ist auf diesem Gerät nicht aktiv';
  }

  getCurrentDeviceStatusText(): string {
    if (!this.pushAvailable) {
      return 'Dieser Browser oder diese Umgebung unterstützt aktuell keine Push-Benachrichtigungen.';
    }
    if (this.hasLocalSubscription) {
      return 'Dieses Gerät erhält Push-Meldungen, wenn dir ein Mangel zugewiesen wird.';
    }
    return 'Aktiviere Push, wenn du auf diesem Gerät informiert werden möchtest.';
  }

  getPermissionLabel(): string {
    switch (this.permission) {
      case 'granted': return 'Erlaubt';
      case 'denied': return 'Blockiert';
      case 'default': return 'Noch nicht entschieden';
      case 'unsupported': return 'Nicht unterstützt';
      default: return String(this.permission);
    }
  }

  getCurrentDeviceLabel(): string {
    return this._getDeviceTitle(window.navigator.userAgent);
  }

  getDeviceTitle(subscription: PushSubscriptionRegistration): string {
    return this._getDeviceTitle(subscription.userAgent);
  }

  getBrowserLabel(subscription: PushSubscriptionRegistration): string {
    return this._getBrowserLabel(subscription.userAgent);
  }

  getOperatingSystemLabel(subscription: PushSubscriptionRegistration): string {
    return this._getOperatingSystemLabel(subscription.userAgent);
  }

  getDeviceIcon(subscription: PushSubscriptionRegistration): string {
    const userAgent = subscription.userAgent || '';
    if (/Android|iPhone|Mobile/i.test(userAgent)) return 'smartphone';
    if (/iPad|Tablet/i.test(userAgent)) return 'tablet_mac';
    return 'computer';
  }

  isCurrentDevice(subscription: PushSubscriptionRegistration): boolean {
    return (subscription.userAgent || '') === window.navigator.userAgent;
  }

  private _getDeviceTitle(userAgent: string): string {
    if (!userAgent) return 'Unbekanntes Gerät';
    if (/Android/i.test(userAgent)) return 'Android-Gerät';
    if (/iPhone/i.test(userAgent)) return 'iPhone';
    if (/iPad/i.test(userAgent)) return 'iPad';
    if (/Windows/i.test(userAgent)) return 'Windows-PC';
    if (/Macintosh|Mac OS/i.test(userAgent)) return 'Mac';
    if (/Linux/i.test(userAgent)) return 'Linux-Gerät';
    return 'Gerät';
  }

  private _getBrowserLabel(userAgent: string): string {
    if (!userAgent) return 'Unbekannter Browser';
    if (/Edg\//i.test(userAgent)) return 'Microsoft Edge';
    if (/SamsungBrowser\//i.test(userAgent)) return 'Samsung Internet';
    if (/Firefox\//i.test(userAgent)) return 'Firefox';
    if (/Chrome\//i.test(userAgent) || /CriOS\//i.test(userAgent)) return 'Chrome';
    if (/Safari\//i.test(userAgent)) return 'Safari';
    return 'Browser';
  }

  private _getOperatingSystemLabel(userAgent: string): string {
    if (!userAgent) return 'Unbekanntes System';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad/i.test(userAgent)) return 'iOS';
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Macintosh|Mac OS/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return 'Betriebssystem';
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
