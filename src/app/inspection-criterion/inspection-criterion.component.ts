import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { DeviceAttributesComponent } from '../device-attributes/device-attributes.component';
import { InspectionCriterion } from '../model/inspection-criterion';
import { InspectionReport } from '../model/inspection-report';

@Component({
  selector: 'spk-inspection-criterion',
  templateUrl: './inspection-criterion.component.html',
  styleUrls: ['./inspection-criterion.component.css']
})
export class InspectionCriterionComponent implements OnInit {

  @Input() inspectionCriterion: InspectionCriterion = new InspectionCriterion();

  deviceAttributesComponent: DeviceAttributesComponent;
  playgroundService: PlaygroundService;

  constructor(deviceAttributesComponent: DeviceAttributesComponent,
    playgroundService: PlaygroundService) {
    this.deviceAttributesComponent = deviceAttributesComponent;
    this.playgroundService = playgroundService;
  }

  ngOnInit(): void {
  }

}


