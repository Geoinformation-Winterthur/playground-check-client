/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { InspectionService } from 'src/services/inspection.service';
import { DefectService } from 'src/services/defect.service';
import { PlaydeviceFeature } from '../model/playdevice-feature';
import { Defect } from '../model/defect';
import { InspectionReport } from '../model/inspection-report';
import { InspectionCriterion } from '../model/inspection-criterion';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { PlaydeviceService } from 'src/services/playdevice.service';
import { ErrorMessageDictionary } from '../model/error-message-dictionary';
import { ErrorMessage } from '../model/error-message';

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
  showMessageReportsWereSend: boolean = false;

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
          if (playdevice.properties.hasOpenChecks &&
                  !playdevice.properties.cannotBeChecked ||
                  (playdevice.properties.cannotBeChecked &&
                      !playdevice.properties.cannotBeCheckedReason)) {
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
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage && errorMessage.errorMessage !== "") {
            let errorMessageString: string = this._evaluateErrorMessage(errorMessage);
            this.sendFailureMessage = "- " + errorMessageString;
            this.isSendSucces = false;
          } else {
            // if sending playdevices was a success,
            // then send inspection reports:
            this._sendInspectionReports();
          }
        },
        error: (errorObj) => {
          this.sendFailureMessage = "- Unbekannte Fehlermeldung.";
          this.isSendSucces = false;
        }
      });
  }

  sendDefects() {
    let playdevices: PlaydeviceFeature[] = this.playgroundService.selectedPlayground.playdevices;
    this.playdeviceService.postPlaydevices(playdevices)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage && errorMessage.errorMessage !== "") {
            let errorMessageString: string = this._evaluateErrorMessage(errorMessage);
            this.sendFailureMessage = "- " + errorMessageString;
            this.isSendSucces = false;
          } else {
            // if sending playdevices was a success,
            // then send inspection reports:
            this._sendDefects();
          }
        },
        error: (errorObj) => {
          this.sendFailureMessage = "- Unbekannte Fehlermeldung.";
          this.isSendSucces = false;
        }
      });
  }

  private _sendDefects(reportsSent: boolean = false) {
    let allDefects: Defect[] = this.playgroundService.getAllDefectsOfSelectedPlayground();
    this.defectService.postDefects(allDefects)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage && errorMessage.errorMessage !== "") {
            this.showMessageReportsWereSend = reportsSent;
            let errorMessageString: string = this._evaluateErrorMessage(errorMessage);
            this.sendFailureMessage = "- " + errorMessageString;
            this.isSendSucces = false;
          } else {
            this.isSendSucces = true;
            this.sendFailureMessage = "";
            this._resetReportCompStatus();
          }
        },
        error: (error) => {
          this.sendFailureMessage = "- Unbekannte Fehlermeldung.";
          this.isSendSucces = false;
        }
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
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage && errorMessage.errorMessage !== "") {
            let errorMessageString: string = this._evaluateErrorMessage(errorMessage);
            this.sendFailureMessage = "- " + errorMessageString;
            this.isSendSucces = false;
        
          } else {
            this._sendDefects(true);
          }
        },
        error: (errorObj) => {
          this.sendFailureMessage = "- Unbekannte Fehlermeldung.";
          this.isSendSucces = false;
        }
      });
  }

  private _evaluateErrorMessage(errorMessage: ErrorMessage) : string {
    let errorMessageString: string = errorMessage.errorMessage;
    if (errorMessageString.startsWith("SPK-")) {
      let messageCode: number = Number(errorMessageString.split('-')[1]);
      errorMessageString = ErrorMessageDictionary.messages[messageCode]
        + " (" + errorMessageString + ")";
    }
    return errorMessageString;
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

}
