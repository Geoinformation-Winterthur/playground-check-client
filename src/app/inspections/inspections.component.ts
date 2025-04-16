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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageEvaluation } from 'src/helper/error-message-evaluation';

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

  playgroundService: PlaygroundService;
  private inspectionService: InspectionService;
  private snackBar: MatSnackBar;

  constructor(playgroundService: PlaygroundService,
    inspectionService: InspectionService,
    snackBar: MatSnackBar
  ) {
    this.playgroundService = playgroundService;
    this.inspectionService = inspectionService;
    this.snackBar = snackBar;
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
      this.inspectionTypeControl.value, false, true)
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
        if(this.playgroundService.selectedPlayground.dateOfLastInspection)
          this.playgroundService.selectedPlayground.dateOfLastInspection
                = new Date(this.playgroundService.selectedPlayground.dateOfLastInspection);
        for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
          if (playdevice.properties.dateOfService && this.playgroundService.selectedPlayground.dateOfLastInspection)
            if (playdevice.properties.dateOfService > this.playgroundService.selectedPlayground.dateOfLastInspection)
              this.playgroundService.selectedPlayground.dateOfLastInspection = playdevice.properties.dateOfService;
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
        (!playdevice.properties.cannotBeCheckedReason ||
          playdevice.properties.cannotBeCheckedReason.trim() == ""))
        return false;
    }

    return true;
  }

  get wasAlreadyInspectedToday(): boolean {
    const inspectionDate = this.playgroundService.selectedPlayground?.dateOfLastInspection;
    if (!inspectionDate) return false;

    const today = new Date();
    const lastInspection = new Date(inspectionDate);

    const result: boolean = lastInspection.getDate() === today.getDate() &&
      lastInspection.getMonth() === today.getMonth() &&
      lastInspection.getFullYear() === today.getFullYear()

    return result;
  }

  private _sendInspectionReports() {

    let inspectionReports: InspectionReport[] = [];

    for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
      if (!playdevice.properties.notToBeChecked &&
        !playdevice.properties.cannotBeChecked) {
        this._collectInspectionReports(playdevice.properties.generalInspectionCriteria,
          inspectionReports, playdevice.properties.fid,
          "", playdevice.properties.dateOfService);
        this._collectInspectionReports(playdevice.properties.mainFallProtectionInspectionCriteria,
          inspectionReports, playdevice.properties.fid,
          "Hauptfallschutz", playdevice.properties.dateOfService);
        this._collectInspectionReports(playdevice.properties.secondaryFallProtectionInspectionCriteria,
          inspectionReports, playdevice.properties.fid,
          "Nebenfallschutz", playdevice.properties.dateOfService);
      }
    }

    this.inspectionService.postReports(inspectionReports)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snackBar.open("Prüfbericht erfolgreich gespeichert", "", {
              duration: 4000
            });
            this.playgroundService.selectedPlayground = new Playground();
            this.playgroundSearchControl.reset();
            this.inspectionTypeControl.reset();
          }
        },
        error: (errorObj) => {
          this.snackBar.open("Unbekannte Fehlermeldung, evtl. schlechte Internetverbindung", "", {
            duration: 4000
          });
        }
      });
  }

  private _collectInspectionReports(inspectionCriteria: InspectionCriterion[],
    inspectionReports: InspectionReport[], playdeviceFid: number,
    fallProtectionType: string, playdeviceDateOfService?: Date) {
    if (inspectionCriteria !== null) {
      for (let inspectionCriterion of inspectionCriteria) {
        if (inspectionCriterion.currentInspectionReport !== null) {
          inspectionCriterion.currentInspectionReport.playdeviceFid
                = playdeviceFid;
          if (playdeviceDateOfService) {
            let playdeviceDateOfServiceCopy: Date = new Date(playdeviceDateOfService);
            playdeviceDateOfServiceCopy = new Date(playdeviceDateOfServiceCopy.toDateString());
            playdeviceDateOfServiceCopy.setHours(playdeviceDateOfServiceCopy.getHours() + 12);
            inspectionCriterion.currentInspectionReport
              .playdeviceDateOfService = playdeviceDateOfServiceCopy;
          }
          inspectionCriterion.currentInspectionReport.inspectionText = inspectionCriterion.check;
          inspectionCriterion.currentInspectionReport.maintenanceText = inspectionCriterion.maintenance;
          inspectionCriterion.currentInspectionReport.fallProtectionType = fallProtectionType;
          inspectionCriterion.currentInspectionReport.inspectionType = this.inspectionTypeControl.value;
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
