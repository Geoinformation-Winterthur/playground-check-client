import { Component, Input, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { UserService } from 'src/services/user.service';
import { DefectsComponent } from '../defects/defects.component';

@Component({
  selector: 'spk-defect-card',
  templateUrl: './defect-card.component.html',
  styleUrls: ['./defect-card.component.css']
})
export class DefectCardComponent implements OnInit {

  @Input() defect: Defect = new Defect();

  playgroundService: PlaygroundService;
  userService: UserService;

  constructor(playgroundService: PlaygroundService,
    userService: UserService, private defectsComponent: DefectsComponent) {
    this.playgroundService = playgroundService;
    this.userService = userService;
  }

  ngOnInit(): void {
  }

  switchDefectStatus(defect: Defect) {
    if (defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
    this.playgroundService.localStoreSelectedPlayground();
  }

  removeDefect(defectUuid: string) {
    if (this.defectsComponent.playdevice.properties.defects) {
      this.defectsComponent.playdevice.properties.defects =
      this.defectsComponent.playdevice.properties.defects
          .filter((defect) => defect.uuid !== defectUuid);
    }
  }

}
