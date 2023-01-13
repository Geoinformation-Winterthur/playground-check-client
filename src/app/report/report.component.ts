/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { InspectionService } from 'src/services/inspection.service';
import { DefectService } from 'src/services/defect.service';
import { AppComponent } from '../app.component';
import { PlaydeviceFeature } from '../model/playdevice-feature';
import { Defect } from '../model/defect';
import { InspectionReport } from '../model/inspection-report';
import { InspectionCriterion } from '../model/inspection-criterion';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { PlaydeviceService } from 'src/services/playdevice.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  playgroundService: PlaygroundService;

  playgroundHasChecks: boolean = false;
  allChecksAreCompleted: boolean = false;
  someOldDefectsAreDone: boolean = false;

  isSendSucces: boolean = false;
  sendFailureMessage: string = "";

  private inspecionService: InspectionService;
  private defectService: DefectService;
  private playdeviceService: PlaydeviceService;


  constructor(playgroundService: PlaygroundService, inspecionService: InspectionService,
    defectService: DefectService, playdeviceService: PlaydeviceService) {
    this.playgroundService = playgroundService;
    this.inspecionService = inspecionService;
    this.defectService = defectService;
    this.playdeviceService = playdeviceService;
  }

  ngOnInit(): void {
    this.playgroundHasChecks = false;
    this.allChecksAreCompleted = false;
    this.someOldDefectsAreDone = false;

    if (this.playgroundService.selectedPlayground !== null &&
      this.playgroundService.selectedPlayground.playdevices !== null) {
      for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
        PlaydeviceFeature.evaluateHasChecks(playdevice);
        if (playdevice.properties.hasChecks) {
          this.playgroundHasChecks = true;
          break;
        }
      }
    }

    let allChecksAreCompletedTemp: boolean = false;
    if (this.playgroundHasChecks) {
      allChecksAreCompletedTemp = true;
      if (this.playgroundService.selectedPlayground !== null) {
        for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
          PlaydeviceFeature.evaluateChecks(playdevice);
          if (playdevice.properties.hasOpenChecks) {
            allChecksAreCompletedTemp = false;
            break;
          }
        }
      }
    }
    this.allChecksAreCompleted = allChecksAreCompletedTemp;

    if (this.playgroundService.selectedPlayground &&
      this.playgroundService.selectedPlayground.playdevices) {
      for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
        PlaydeviceFeature.evaluateSomeOldDefectsAreDone(playdevice);
        if (playdevice.properties.someOldDefectsAreDone === true) {
          this.someOldDefectsAreDone = true;
          break;
        }
      }
    }

  }

  sendReport() {
    let playdevices: PlaydeviceFeature[] = this.playgroundService.selectedPlayground.playdevices;
    this.playdeviceService.postPlaydevices(playdevices)
      .subscribe(resp => {
        // if sending playdevices was a success,
        // then send inspection reports:
        this._sendInspectionReports();
      }, errorObj => {
        this._setErrorResult(errorObj);
      });
  }

  sendDefects() {
    let allDefects: Defect[] = [];
    for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
      for (let defect of playdevice.properties.defects) {
        allDefects.push(defect);
      }
      for (let playdeviceDetail of playdevice.playdeviceDetails) {
        for (let defect of playdeviceDetail.properties.defects) {
          allDefects.push(defect);
        }
      }
    }
    this.defectService.postDefects(allDefects)
      .subscribe(resp => {
        this.isSendSucces = true;
        this.sendFailureMessage = "";
        this._resetReportCompStatus();
      }, error => {
        let errorMessage: string = "- " + error.error;
        if (!errorMessage || errorMessage.trim().length === 0) {
          this.sendFailureMessage = "- Keine Fehlermeldung vorhanden.";
        } else {
          this.sendFailureMessage = errorMessage;
        }
        this.isSendSucces = false;
      });
  }

  private _sendInspectionReports() {
    let inspectionReports: InspectionReport[] = [];
    for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
      this._collectInspectionReports(playdevice.properties.generalInspectionCriteria,
        inspectionReports, playdevice.properties.fid, 0,
        "", playdevice.properties.dateOfService);
      this._collectInspectionReports(playdevice.properties.mainFallProtectionInspectionCriteria,
        inspectionReports, playdevice.properties.fid, 0,
        "Hauptfallschutz", playdevice.properties.dateOfService);
      this._collectInspectionReports(playdevice.properties.secondaryFallProtectionInspectionCriteria,
        inspectionReports, playdevice.properties.fid, 0,
        "Nebenfallschutz", playdevice.properties.dateOfService);
      for (let playdeviceDetail of playdevice.playdeviceDetails) {
        this._collectInspectionReports(playdeviceDetail.properties.generalInspectionCriteria,
          inspectionReports, 0, playdeviceDetail.properties.fid,
          "", playdeviceDetail.properties.dateOfService);
        this._collectInspectionReports(playdeviceDetail.properties.mainFallProtectionInspectionCriteria,
          inspectionReports, 0, playdeviceDetail.properties.fid,
          "Hauptfallschutz", playdeviceDetail.properties.dateOfService);
        this._collectInspectionReports(playdeviceDetail.properties.secondaryFallProtectionInspectionCriteria,
          inspectionReports, 0, playdeviceDetail.properties.fid,
          "Nebenfallschutz", playdeviceDetail.properties.dateOfService);
      }
    }
    this.inspecionService.postReports(inspectionReports)
      .subscribe(resp => {
        this.isSendSucces = true;
        this.sendFailureMessage = "";
        this._resetReportCompStatus();
      }, errorObj => {
        this._setErrorResult(errorObj);
      });
  }

  private _collectInspectionReports(inspectionCriteria: InspectionCriterion[],
    inspectionReports: InspectionReport[], playdeviceFid: number,
    playdeviceDetailFid: number, fallProtectionType: string, playdeviceDateOfService?: Date) {
    if (inspectionCriteria !== null) {
      for (let inspectionCriterion of inspectionCriteria) {
        if (inspectionCriterion.currentInspectionReport !== null) {
          inspectionCriterion.currentInspectionReport.playdeviceFid
            = playdeviceFid;
          inspectionCriterion.currentInspectionReport.playdeviceDetailFid
            = playdeviceDetailFid;
          if (playdeviceDateOfService) {
            let playdeviceDateOfServiceCopy: Date = new Date(playdeviceDateOfService);
            playdeviceDateOfServiceCopy = new Date(playdeviceDateOfServiceCopy.toDateString());
            playdeviceDateOfServiceCopy.setHours(playdeviceDateOfServiceCopy.getHours() + 12);
            inspectionCriterion.currentInspectionReport
              .playdeviceDateOfService = playdeviceDateOfServiceCopy;
          }
          inspectionCriterion.currentInspectionReport.fallProtectionType = fallProtectionType;
          inspectionReports.push(inspectionCriterion.currentInspectionReport);
        }
      }
    }
  }

  private _resetReportCompStatus() {
    this.playgroundService.clearSelectedPlayground();
    this.playgroundHasChecks = false;
    this.allChecksAreCompleted = false;
    this.someOldDefectsAreDone = false;
  }

  private _setErrorResult(errorObj: HttpErrorResponse) {
    if (errorObj.status === 0) {
      // error type (could be): no connection
      this.sendFailureMessage = "- Unbekannte Fehlermeldung. " +
        "Eventuell besteht keine Internetverbindung, oder " +
        "das Datenzentrum ist nicht erreichbar.";
    } else if (errorObj.status === 400) {
      // error type: bad request
      this.sendFailureMessage = "- Der Server konnte keine Kontrollberichte " +
        "empfangen.";
    } else if (errorObj.status === 401) {
      // error type: unauthorized
      this.sendFailureMessage = "- Sie sind entweder nicht als Kontrolleur " +
        "in der Spielplatzkontrolle-Datenbank erfasst oder Sie haben " +
        "keine Zugriffsberechtigung.";
    } else if (errorObj.status === 409) {
      // error type: conflict
      this.sendFailureMessage = "- Für diesen Spielplatz ist am " +
        "selben Tag bereits ein Bericht eingereicht worden.";
    } else if (errorObj.status === 900) {
      // error type: proprietary
      this.sendFailureMessage = "- Es wurden Kontrollberichte ohne " +
        "Inspektionsdatum gesendet.";
    } else {
      this.sendFailureMessage = "- Unbekannte Fehlermeldung.";
    }
    this.isSendSucces = false;
  }

}
