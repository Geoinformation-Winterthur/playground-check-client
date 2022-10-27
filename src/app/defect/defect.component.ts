import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { UserService } from 'src/services/user.service';
import { DeviceAttributesComponent } from '../device-attributes/device-attributes.component';
import { Defect } from '../model/defect';
import { InspectionCriterion } from '../model/inspection-criterion';

@Component({
  selector: 'spk-defect',
  templateUrl: './defect.component.html',
  styleUrls: ['./defect.component.css']
})
export class DefectComponent implements OnInit {

  @Input() defect: Defect = new Defect();
  @Input() inspectionCriterion: InspectionCriterion = new InspectionCriterion();
  @Input() j: number = 0;

  deviceAttributesComponent: DeviceAttributesComponent;

  playgroundService: PlaygroundService;
  userService: UserService;

  constructor(deviceAttributesComponent: DeviceAttributesComponent,
    playgroundService: PlaygroundService, userService: UserService) {
    this.deviceAttributesComponent = deviceAttributesComponent;
    this.playgroundService = playgroundService;
    this.userService = userService;
   }

  ngOnInit(): void {
  }

  switchDefectStatus(defect: Defect){
    if(defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
    this.playgroundService.localStoreSelectedPlayground();
  }

}
