/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { Input } from '@angular/core';
 import { Component, OnInit } from '@angular/core';
 import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
 import { ImageHelper } from 'src/helper/image-helper';
 import { PlaygroundService } from 'src/services/playgrounds.service';
import { InspectionReport } from '../model/inspection-report';
 import { PlaydeviceFeature } from '../model/playdevice-feature';
 
 @Component({
   selector: 'spk-device-card',
   templateUrl: './device-card.component.html',
   styleUrls: ['./device-card.component.css']
 })
 export class DeviceCardComponent implements OnInit {
 
   @Input() playdevice: PlaydeviceFeature = new PlaydeviceFeature();
 
   readonly currentYear: number;
   playgroundService: PlaygroundService;
   private domSanitizer: DomSanitizer;
 
   constructor(playgroundService: PlaygroundService, domSanitizer: DomSanitizer) {
     this.currentYear = new Date().getFullYear();
     this.playgroundService = playgroundService;
     this.domSanitizer = domSanitizer;
    }
 
   ngOnInit(): void {
     PlaydeviceFeature.evaluateChecks(this.playdevice);
     PlaydeviceFeature.evaluateDefects(this.playdevice);
   }

   sanitizeUrl(base64String: string): SafeUrl {
    return ImageHelper.sanitizeUrl(base64String, this.domSanitizer);
  }

  switchAllCheckBoxes(activate: boolean) {

    for (let genInspCriterion of this.playdevice.properties.generalInspectionCriteria) {
      let inspectionReport: InspectionReport = genInspCriterion.currentInspectionReport;
      if (activate) {
        inspectionReport.inspectionDone = true;
        inspectionReport.maintenanceDone = true;
      } else {
        inspectionReport.inspectionDone = false;
        inspectionReport.maintenanceDone = false;
      }
    }

    for (let mainFallInspCriterion of this.playdevice.properties.mainFallProtectionInspectionCriteria) {
      let inspectionReport: InspectionReport = mainFallInspCriterion.currentInspectionReport;
      if (activate) {
        inspectionReport.inspectionDone = true;
        inspectionReport.maintenanceDone = true;
      } else {
        inspectionReport.inspectionDone = false;
        inspectionReport.maintenanceDone = false;
      }
    }

    for (let secFallInspCriterion of this.playdevice.properties.secondaryFallProtectionInspectionCriteria) {
      let inspectionReport: InspectionReport = secFallInspCriterion.currentInspectionReport;
      if (activate) {
        inspectionReport.inspectionDone = true;
        inspectionReport.maintenanceDone = true;
      } else {
        inspectionReport.inspectionDone = false;
        inspectionReport.maintenanceDone = false;
      }
    }

    for (let detail of this.playdevice.playdeviceDetails) {
      for (let inspectionCriterion of detail.properties.generalInspectionCriteria) {
        let inspectionReport: InspectionReport = inspectionCriterion.currentInspectionReport;
        if (activate) {
          inspectionReport.inspectionDone = true;
          inspectionReport.maintenanceDone = true;
        } else {
          inspectionReport.inspectionDone = false;
          inspectionReport.maintenanceDone = false;
        }
      }
      for (let mainFallInspCriterion of detail.properties.mainFallProtectionInspectionCriteria) {
        let inspectionReport: InspectionReport = mainFallInspCriterion.currentInspectionReport;
        if (activate) {
          inspectionReport.inspectionDone = true;
          inspectionReport.maintenanceDone = true;
        } else {
          inspectionReport.inspectionDone = false;
          inspectionReport.maintenanceDone = false;
        }
      }
  
      for (let secFallInspCriterion of detail.properties.secondaryFallProtectionInspectionCriteria) {
        let inspectionReport: InspectionReport = secFallInspCriterion.currentInspectionReport;
        if (activate) {
          inspectionReport.inspectionDone = true;
          inspectionReport.maintenanceDone = true;
        } else {
          inspectionReport.inspectionDone = false;
          inspectionReport.maintenanceDone = false;
        }
      }
    }

    PlaydeviceFeature.evaluateChecks(this.playdevice);

  }
 
 }
 