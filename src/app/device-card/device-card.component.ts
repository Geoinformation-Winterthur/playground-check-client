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
import { PlaydeviceService } from 'src/services/playdevice.service';
import { ErrorMessageDictionary } from '../model/error-message-dictionary';
import { ErrorMessage } from '../model/error-message';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { InspectionService } from 'src/services/inspection.service';
import { environment } from 'src/environments/environment';
import { Playground } from '../model/playground';
import { ErrorMessageEvaluation } from 'src/helper/error-message-evaluation';

@Component({
  selector: 'spk-device-card',
  templateUrl: './device-card.component.html',
  styleUrls: ['./device-card.component.css']
})
export class DeviceCardComponent implements OnInit {

  @Input() playdevice: PlaydeviceFeature = new PlaydeviceFeature();
  @Input() cardType: string = "";

  readonly currentYear: number;

  private domSanitizer: DomSanitizer;
  private snackBar: MatSnackBar;

  environment;

  renovationTypeControl: FormControl = new FormControl();

  playgroundService: PlaygroundService;
  inspectionService: InspectionService;
  private playdeviceService: PlaydeviceService;

  constructor(playgroundService: PlaygroundService, domSanitizer: DomSanitizer,
    playdeviceService: PlaydeviceService, inspectionService: InspectionService,
    snackBar: MatSnackBar) {
    this.currentYear = new Date().getFullYear();
    this.playgroundService = playgroundService;
    this.domSanitizer = domSanitizer;
    this.playdeviceService = playdeviceService;
    this.inspectionService = inspectionService;
    this.snackBar = snackBar;
    this.environment = environment;
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

    PlaydeviceFeature.evaluateChecks(this.playdevice);

  }

  savePlayground() {
    // Send attributes of playdevices before sending reports:
    this.playdeviceService.postPlaydevice(this.playdevice)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snackBar.open("Spielgerät erfolgreich gespeichert", "", {
              duration: 4000
            });
          }
        },
        error: (errorObj) => {
          this.snackBar.open("Unbekannter Fehler, evtl. schlechte Internetverbindung", "", {
            duration: 4000
          });
        }
      });
  }

  hasConstructionDate(): boolean {
    if (this.playdevice.properties.constructionDate) {
      let constructionDate: Date = new Date(this.playdevice.properties.constructionDate);
      if (constructionDate.getFullYear() === 1) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  exchangePhoto(playdeviceFid: number, event: Event) {
    let inputElement: HTMLInputElement = event.target as HTMLInputElement;
    let files: FileList = inputElement.files as FileList;
    if (files && files.length > 0) {
      let file = files[0];
      if (file) {
        let fileReader: FileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = async () => {
          let pictureBase64String: string = fileReader.result as string;
          let pictureBase64Promise: Promise<string> = ImageHelper.downsizeImage(pictureBase64String, 1200, 800);
          pictureBase64String = await pictureBase64Promise;
          this.playdeviceService.putPicture(playdeviceFid, pictureBase64String)
            .subscribe({
              next: (errorMessage) => {
                if (errorMessage && errorMessage.errorMessage !== "") {
                  let errorMessageString: string = this._evaluateErrorMessage(errorMessage);
                  this.snackBar.open(errorMessageString, "", {
                    duration: 4000
                  });
                } else {
                  this.playdevice.properties.pictureBase64String = pictureBase64String;
                }
              },
              error: (errorObj) => {
                this.snackBar.open("Unbekannter Fehler", "", {
                  duration: 4000
                });
              }
            });
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

}
