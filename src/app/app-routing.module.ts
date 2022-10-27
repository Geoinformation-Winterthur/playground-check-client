/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { NgModule } from '@angular/core';
 import { Routes, RouterModule } from '@angular/router';
 import { DeviceAttributesComponent } from './device-attributes/device-attributes.component';
 import { ChoosePlaygroundComponent } from './choose-playground/choose-playground.component';
 import { ReportComponent } from './report/report.component';
 import { WelcomeComponent } from './welcome/welcome.component';
 import { LoginComponent } from './login/login.component';
 import { ChooseDeviceComponent } from './choose-device/choose-device.component';
 import { UserService } from 'src/services/user.service';
 
 const routes: Routes = [
   {path: '', component: WelcomeComponent, pathMatch: 'full'},
   {path: 'chooseplayground', component: ChoosePlaygroundComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'choosedevice', component: ChooseDeviceComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'deviceattributes/:devicetype/:id', component: DeviceAttributesComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'report', component: ReportComponent, pathMatch: 'full', canActivate: [UserService]},
   {path: 'login', component: LoginComponent, pathMatch: 'full'}
 ];
 
 @NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule]
 })
 export class AppRoutingModule { }
 