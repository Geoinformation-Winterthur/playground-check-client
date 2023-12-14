import { Component, Input, OnInit } from '@angular/core';
import { PlaydeviceFeature } from '../model/playdevice-feature';
import { PlaydeviceDetail } from '../model/playdevice-detail';
import { Defect } from '../model/defect';

@Component({
  selector: 'spk-defects',
  templateUrl: './defects.component.html',
  styleUrls: ['./defects.component.css']
})
export class DefectsComponent implements OnInit {

  @Input() playdevice: PlaydeviceFeature | PlaydeviceDetail;
  @Input() isInCheckMode: boolean = false;

  constructor() {
    this.playdevice = new PlaydeviceFeature();
  }

  ngOnInit(): void {
  }

  createEmptyDefect() {
    if (!this.playdevice.properties.defects) {
      this.playdevice.properties.defects = [];
    }
    let defect: Defect = new Defect();
    defect.uuid = (crypto as any).randomUUID();
    defect.isNewlyCreated = true;
    defect.playdeviceFid = this.playdevice.properties.fid;
    this.playdevice.properties.defects.push(defect);
  }

}
