/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { BrowserModule } from '@angular/platform-browser';
 import { NgModule } from '@angular/core';
 
 import { HttpClientModule } from '@angular/common/http';
 import { AppRoutingModule } from './app-routing.module';
 import { AppComponent } from './app.component';
 import { MatButtonModule } from '@angular/material/button';
 import { MatToolbarModule } from '@angular/material/toolbar';
 import { MatIconModule } from '@angular/material/icon';
 import { MatListModule } from '@angular/material/list';
 import { MatCardModule } from '@angular/material/card';
 import { MatSnackBarModule } from '@angular/material/snack-bar';
 import { MatTooltipModule } from '@angular/material/tooltip';
 import { MatMenuModule } from '@angular/material/menu';
 import { MatChipsModule } from '@angular/material/chips';
 import { MatFormFieldModule } from '@angular/material/form-field';
 import { MatInputModule } from '@angular/material/input';
 import { MatCheckboxModule } from '@angular/material/checkbox';
 import { MatDatepickerModule } from '@angular/material/datepicker';
 import { MatNativeDateModule } from '@angular/material/core';
 import { MatSelectModule } from '@angular/material/select';
 import { MatExpansionModule } from '@angular/material/expansion';
 import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 import { FlexLayoutModule } from '@angular/flex-layout';
 import { MAT_DATE_LOCALE } from '@angular/material/core';
 import { ChoosePlaygroundComponent } from './choose-playground/choose-playground.component';
 import { MatSidenavModule } from '@angular/material/sidenav';
 import { DeviceAttributesComponent } from './device-attributes/device-attributes.component';
 import { WelcomeComponent } from './welcome/welcome.component';
 import { ReportComponent } from './report/report.component';
 import { ImprintComponent } from './imprint/imprint.component';
 import { MatTabsModule } from '@angular/material/tabs';
 import { MatAutocompleteModule } from '@angular/material/autocomplete';
 import { MatProgressBarModule } from '@angular/material/progress-bar';
 import { MatGridListModule } from '@angular/material/grid-list';
 import { ServiceWorkerModule } from '@angular/service-worker';
 import { environment } from '../environments/environment';
 import { LoginComponent } from './login/login.component';
 
 import { JwtModule } from '@auth0/angular-jwt';
 import { ChooseDeviceComponent } from './choose-device/choose-device.component';
 
 import { UserService } from 'src/services/user.service';
 import { DeviceCardComponent } from './device-card/device-card.component';
 import { DefectComponent } from './defect/defect.component';
 import { InspectionCriterionComponent } from './inspection-criterion/inspection-criterion.component';
 
 
 export function getToken(){
   let userTokenTemp = localStorage.getItem(UserService.userTokenName);
   let userToken: string = userTokenTemp !== null ? userTokenTemp : "";
   if(userToken !== ""){
     return userToken;
   } else {
     return null;
   }
 }
 
 @NgModule({
   declarations: [
     AppComponent,
     ChoosePlaygroundComponent,
     DeviceAttributesComponent,
     WelcomeComponent,
     ReportComponent,
     ImprintComponent,
     LoginComponent,
     ChooseDeviceComponent,
     DeviceCardComponent,
     DefectComponent,
     InspectionCriterionComponent
   ],
   imports: [
     BrowserModule,
     AppRoutingModule,
     HttpClientModule,
     MatButtonModule,
     MatToolbarModule,
     MatIconModule,
     MatListModule,
     MatCardModule,
     MatSnackBarModule,
     MatTooltipModule,
     MatMenuModule,
     MatChipsModule,
     MatFormFieldModule,
     MatInputModule,
     MatCheckboxModule,
     ReactiveFormsModule,
     BrowserAnimationsModule,
     FormsModule,
     FlexLayoutModule,
     MatDatepickerModule,
     MatNativeDateModule,
     MatSelectModule,
     MatGridListModule,
     MatAutocompleteModule,
     MatProgressBarModule,
     MatExpansionModule,
     MatSidenavModule,
     MatTabsModule,
     ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
     JwtModule.forRoot({
       config: {
         tokenGetter: getToken,
         allowedDomains: [environment.apiDomain],
         disallowedRoutes: []
       }
     })
   ],
   providers: [UserService, MatDatepickerModule,
     {provide: MAT_DATE_LOCALE, useValue: 'de-CH'}
   ],
   bootstrap: [AppComponent]
 })
 export class AppModule { }
 