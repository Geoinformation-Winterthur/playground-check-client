/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceAttributesComponent } from './device-attributes/device-attributes.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { ChooseDeviceComponent } from './choose-device/choose-device.component';
import { UserService } from 'src/services/user.service';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { InspectionsComponent } from './inspections/inspections.component';
import { DefectsComponent } from './defects/defects.component';
import { DefectComponent } from './defect/defect.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },
  { path: 'choosedevice', component: ChooseDeviceComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'inspections', component: InspectionsComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'defects', component: DefectsComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'defect/:playdeviceFid/:tid', component: DefectComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'deviceattributes/:devicetype/:id', component: DeviceAttributesComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'users', component: UsersComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'users/:email', component: UserComponent, pathMatch: 'full', canActivate: [UserService] },
  { path: 'login', component: LoginComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
