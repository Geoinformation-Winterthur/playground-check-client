/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { Component, EventEmitter, Input, Output } from '@angular/core';
 import { Subscription } from 'rxjs';
 import { MediaChange, MediaObserver } from '@angular/flex-layout';
 import { CookieService } from 'ngx-cookie-service';
 import { MatSnackBar } from '@angular/material/snack-bar';
 import { UserService } from '../services/user.service';
 import { environment } from 'src/environments/environment';
 import { PlaygroundService } from 'src/services/playgrounds.service';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
 
 @Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
 })
 export class AppComponent {
 
   @Input() isSideNavDisableClose: boolean = true;
   @Output() disableCloseChange: EventEmitter<boolean> = new EventEmitter<boolean>();

   public sideNavOpened: boolean = false;
   public sideNavMode: MatDrawerMode = 'side';
 
   title: string = environment.title;
   shorttitle: string = environment.shorttitle;
   subtitle: string = environment.subtitle;
   features = environment.features;
 
   private mediaWatcher: Subscription;
 
   private cookieService: CookieService;
   private snckBar: MatSnackBar;
 
   private playgroundService: PlaygroundService;
 
   public userService: UserService;
 
   constructor(cookieService: CookieService, snckBar: MatSnackBar, oMedia: MediaObserver,
     playgroundService: PlaygroundService, userService: UserService, titleService: Title,
     swPush: SwPush, router: Router) {
     titleService.setTitle(this.title);
     this.cookieService = cookieService;
     this.playgroundService = playgroundService;
     this.userService = userService;
     this.snckBar = snckBar;
     this.mediaWatcher = oMedia.asObservable().subscribe((mChange: MediaChange[]) => {
       if (mChange[0].mqAlias === 'xs') {
         this.sideNavMode = "over";
         this.isSideNavDisableClose = false;
         this.sideNavOpened = false;
        } else {
        this.sideNavMode = "side";
        this.isSideNavDisableClose = true;
        this.sideNavOpened = true;
       }
       this.disableCloseChange.emit(this.isSideNavDisableClose)
      });
     this.showCookieNotification();

     if (this.features.pushNotifications) {
       swPush.messages.subscribe((message: any) => {
       if (message != null && message.title) {
         this.snckBar.open(message.title, "", { duration: 6000 });
       }
     });

       swPush.notificationClicks.subscribe((event: any) => {
       let url = "/defects";
       if (event != null && event.notification != null && event.notification.data != null) {
         if (event.notification.data.url) url = event.notification.data.url;
         if (event.notification.data.defectTid && event.notification.data.playdeviceFid) {
           url = "/defect/" + event.notification.data.playdeviceFid + "/" + event.notification.data.defectTid;
         }
       }
         router.navigateByUrl(url);
       });
     }
   }
 
   ngOnInit() {
     this.playgroundService.activateSelectedPlaygroundFromLocalStorage();
   }
 
   public isUserLoggedIn(): boolean {
     return this.userService.isUserLoggedIn();
   }
 
   public logUserOut(event: Event) {
     this.playgroundService.clearSelectedPlayground();
     this.userService.logout();
   }
 
 
   public toggleSideNav(event: Event) {
     if(!this.isSideNavDisableClose) {
        this.sideNavOpened = !this.sideNavOpened;
     }
   }
 
   private showCookieNotification() {
     const hideInfoCookieName: string = environment.hideInfoCookieName;
     let hideInfoValue: string = this.cookieService.get(hideInfoCookieName);
 
     if (hideInfoValue !== 'true') {
       let snckBarHandle = this.snckBar.open('Diese App verwendet Cookies. Nähere Informationen im Impressum.',
         'X', {
         duration: 99999999999999
       });
       snckBarHandle.afterDismissed().subscribe(() => {
         this.cookieService.set(hideInfoCookieName, 'true', 50 * 365, undefined, undefined, false, "Lax");
       });
     }
   }
 
 }
 