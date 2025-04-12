/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { Playground } from '../model/playground';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { InspectionService } from 'src/services/inspection.service';
import { PlaydeviceFeature } from '../model/playdevice-feature';
import { PlaydeviceService } from 'src/services/playdevice.service';
import { ErrorMessageDictionary } from '../model/error-message-dictionary';
import { ErrorMessage } from '../model/error-message';
import { InspectionReport } from '../model/inspection-report';
import { InspectionReportsAndDefects } from '../model/inspection-reports-and-defects';
import { Defect } from '../model/defect';
import { InspectionCriterion } from '../model/inspection-criterion';

@Component({
  selector: 'app-inspections',
  templateUrl: './inspections.component.html',
  styleUrls: ['./inspections.component.css']
})
export class InspectionsComponent implements OnInit {

  playgrounds: Playground[] = [];

  playgroundsFiltered: Observable<Playground[]> = new Observable<Playground[]>();

  playgroundSearchControl: FormControl = new FormControl();

  inspectionTypeControl: FormControl = new FormControl();

  availableInspectionTypes: string[] = [];

  sendFailureMessage: string = "";

  playgroundService: PlaygroundService;
  private playdeviceService: PlaydeviceService;
  private inspectionService: InspectionService;

  constructor(playgroundService: PlaygroundService,
    playdeviceService: PlaydeviceService,
    inspectionService: InspectionService
  ) {
    this.playgroundService = playgroundService;
    this.playdeviceService = playdeviceService;
    this.inspectionService = inspectionService;
  }

  ngOnInit(): void {
    if (this.inspectionService.selectedInspectionType) {
      this.inspectionTypeControl.setValue(this.inspectionService.selectedInspectionType);
      if (this.playgroundService.selectedPlayground &&
        this.playgroundService.selectedPlayground.name) {
        this.playgroundSearchControl.setValue(this.playgroundService.selectedPlayground.name);
      } else {
        this.selectInspectionType();
      }
    }

    this.inspectionService.getTypes().subscribe({
      next: (typesData) => {
        let inspectionTypesNames: string[] = typesData;
        for (let inspectionType of inspectionTypesNames) {
          this.availableInspectionTypes.push(inspectionType);
        }
      },
      error: (error) => {
      }
    });
  }

  selectPlayground() {

    // get playground from webservice:
    this.playgroundService.getPlaygroundByName(this.playgroundSearchControl.value,
      this.inspectionTypeControl.value, false)
      .subscribe(playgroundData => {
        // playground was received from webservice
        for (let playdevice of playgroundData.playdevices) {
          playdevice.properties.dateOfService = new Date();
          if (playdevice.properties.recommendedYearOfRenovation !== null &&
            playdevice.properties.recommendedYearOfRenovation !== undefined &&
            playdevice.properties.recommendedYearOfRenovation <= 0) {
            playdevice.properties.recommendedYearOfRenovation = undefined;
          }
        }

        // set reference on selected playground:
        this.playgroundService.selectedPlayground = playgroundData;

        // calculate date of last inspection of the whole playground
        for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
          for (let report of playdevice.properties.lastInspectionReports) {
            if (report.dateOfService && this.playgroundService.selectedPlayground.dateOfLastInspection) {
              if (report.dateOfService > this.playgroundService.selectedPlayground.dateOfLastInspection) {
                this.playgroundService.selectedPlayground.dateOfLastInspection = report.dateOfService;
              }
            }
          }
        }

        // make crosshair asset image offline available:
        let crossHairAssetImage: HTMLImageElement = new Image();
        crossHairAssetImage.src = "assets/crosshair.png";

      });

  }

  selectInspectionType() {
    this.playgroundSearchControl.setValue("");
    this.playgroundService.clearSelectedPlayground();
    this.inspectionService.selectedInspectionType = this.inspectionTypeControl.value;
    this._loadPlaygroundNames(this.inspectionTypeControl.value);
  }

  sendReport() {
    let playdevicesTemp: PlaydeviceFeature[] = this.playgroundService.selectedPlayground.playdevices;
    let playdevices: PlaydeviceFeature[] = [];
    for (let playdevice of playdevicesTemp) {
      if (!playdevice.properties.notToBeChecked) {
        playdevices.push(playdevice);
      }
    }
    this._sendInspectionReports();
  }

  canFinish(): boolean {
    if (this.playgroundService.selectedPlayground == null)
      return false;

    for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
      // Wenn Gerät prüfbar ist
      if (!playdevice.properties.notToBeChecked &&
        !playdevice.properties.cannotBeChecked) {
        // Checks auswerten
        PlaydeviceFeature.evaluateChecks(playdevice);
        if (playdevice.properties.hasOpenChecks)
          return false;
      }
      // Wenn Gerät nicht prüfbar ist, aber kein Grund angegeben
      else if (playdevice.properties.cannotBeChecked &&
        playdevice.properties.cannotBeCheckedReason != "")
        return false;
    }

    return true;
  }

  private _sendInspectionReports() {

    let inspectionReports: InspectionReport[] = [];
    let defects: Defect[] = [];

    for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
      if (!playdevice.properties.notToBeChecked &&
        !playdevice.properties.cannotBeChecked) {
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

        for (let defect of playdevice.properties.defects) {
          if (defect.isNewlyCreated) {
            defects.push(defect);
          }
        }

      }
    }

    this.inspectionService.postReports(inspectionReports)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage && errorMessage.errorMessage !== "") {
            let errorMessageString: string = this._evaluateErrorMessage(errorMessage);
            this.sendFailureMessage = "- " + errorMessageString;

          } else {
          }
        },
        error: (errorObj) => {
          this.sendFailureMessage = "- Unbekannte Fehlermeldung.";
        }
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

  private _evaluateErrorMessage(errorMessage: ErrorMessage): string {
    let errorMessageString: string = errorMessage.errorMessage;
    if (errorMessageString.startsWith("SPK-")) {
      let messageCode: number = Number(errorMessageString.split('-')[1]);
      errorMessageString = ErrorMessageDictionary.messages[messageCode]
        + " (" + errorMessageString + ")";
    }
    return errorMessageString;
  }

  private _filterPlaygroundsByName(playgroundName: string): Playground[] {
    let result: Playground[] = [];
    if (playgroundName != null) {
      playgroundName = playgroundName.trim().toLowerCase();
    }
    if (playgroundName === "") {
      result = this.playgrounds;
    } else {
      result = this.playgrounds.filter(playground => {
        let playgroundNameLower = playground.name.toLowerCase();
        let indexOfName: number = playgroundNameLower.indexOf(playgroundName);
        let isNull: boolean = indexOfName !== -1;
        return isNull;
      });
    }
    return result;
  }

  private _loadPlaygroundNames(inspectionType: string) {
    this.playgrounds = [];
    this.playgroundService.getPlaygroundsNames(inspectionType).subscribe({
      next: (playgroundsData) => {
        this.playgrounds = playgroundsData.sort();
        this.playgroundsFiltered = this.playgroundSearchControl.valueChanges.pipe(
          startWith(''),
          map(playgroundName => this._filterPlaygroundsByName(playgroundName))
        );

      },
      error: (error) => {
      }
    });
  }

}
