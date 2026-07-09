import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { ErrorMessage } from 'src/app/model/error-message';
import { PushSubscriptionRegistration } from 'src/app/model/push-subscription-registration';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(private http: HttpClient, private swPush: SwPush) { }

  public isPushAvailable(): boolean {
    return this.swPush.isEnabled && 'Notification' in window;
  }

  public getNotificationPermission(): NotificationPermission | string {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  public async registerCurrentDevice(): Promise<Observable<ErrorMessage>> {
    if (!this.isPushAvailable()) {
      throw new Error('Push-Benachrichtigungen werden auf diesem Gerät oder in dieser Umgebung nicht unterstützt.');
    }
    if (!environment.vapidPublicKey || environment.vapidPublicKey.trim().length === 0) {
      throw new Error('Der VAPID Public Key ist im Frontend nicht konfiguriert.');
    }

    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: environment.vapidPublicKey
    });

    const registration = this._toRegistration(subscription);
    return this.http.post<ErrorMessage>(environment.apiUrl + '/PushSubscription/Register', registration);
  }

  public async unregisterCurrentDevice(): Promise<Observable<ErrorMessage>> {
    const subscription = await this.swPush.subscription.pipe(take(1)).toPromise();
    if (subscription == null) {
      throw new Error('Dieses Gerät ist aktuell nicht für Push-Benachrichtigungen registriert.');
    }

    const registration = this._toRegistration(subscription);
    return this.http.request<ErrorMessage>('delete',
      environment.apiUrl + '/PushSubscription/Unregister', { body: registration }).pipe(
        mergeMap(async errorMessage => {
          if (errorMessage == null || errorMessage.errorMessage == null || errorMessage.errorMessage.trim().length === 0) {
            await subscription.unsubscribe();
          }
          return errorMessage;
        })
      );
  }

  public getOwnSubscriptions(): Observable<PushSubscriptionRegistration[]> {
    return this.http.get<PushSubscriptionRegistration[]>(environment.apiUrl + '/PushSubscription/Me');
  }

  public getLocalSubscription(): Observable<PushSubscription | null> {
    return this.swPush.subscription;
  }

  private _toRegistration(subscription: PushSubscription): PushSubscriptionRegistration {
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    const registration = new PushSubscriptionRegistration();
    registration.endpoint = subscription.endpoint;
    registration.p256dh = this._arrayBufferToBase64Url(p256dhKey);
    registration.auth = this._arrayBufferToBase64Url(authKey);
    registration.userAgent = window.navigator.userAgent;
    return registration;
  }

  private _arrayBufferToBase64Url(buffer: ArrayBuffer | null): string {
    if (buffer == null) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
