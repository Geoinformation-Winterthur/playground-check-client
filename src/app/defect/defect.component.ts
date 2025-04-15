import { Component, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DefectService } from 'src/services/defect.service';
import { UserService } from 'src/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageEvaluation } from 'src/helper/error-message-evaluation';
import { ImageHelper } from 'src/helper/image-helper';
import { DefectPicture } from '../model/defect-picture';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-defect',
  templateUrl: './defect.component.html',
  styleUrls: ['./defect.component.css']
})
export class DefectComponent implements OnInit {

  defect: Defect = new Defect();

  tid: number = -1;

  playdeviceFid: number = -1;

  environment;

  priorityControl: FormControl = new FormControl();
  responsibleBodyControl: FormControl = new FormControl();

  userService: UserService;
  private defectService: DefectService;

  private snackBar: MatSnackBar;

  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription;

  constructor(defectService: DefectService,
    userService: UserService,
    snackBar: MatSnackBar,
    activatedRoute: ActivatedRoute) {
    this.defectService = defectService;
    this.userService = userService;
    this.snackBar = snackBar;
    this.activatedRoute = activatedRoute;
    this.activatedRouteSubscription = new Subscription();
    this.environment = environment;
  }

  ngOnInit(): void {

    this.priorityControl = new FormControl();
    // Änderungen automatisch zurückschreiben
    this.priorityControl.valueChanges.subscribe(value => {
      this.defect.priority = value;
    });

    this.responsibleBodyControl = new FormControl();
    // Änderungen automatisch zurückschreiben
    this.responsibleBodyControl.valueChanges.subscribe(value => {
      this.defect.defectsResponsibleBodyId = value;
    });

    this.activatedRouteSubscription = this.activatedRoute.params
      .subscribe(params => {
        this.tid = parseInt(params['tid']);
        this.playdeviceFid = parseInt(params['playdeviceFid']);

        if (this.tid > 0) {
          this.defect = new Defect();
          this.defectService.getDefect(this.tid)
            .subscribe({
              next: (defect) => {
                this.defect = defect;
                setTimeout(() => {
                  this.priorityControl.setValue("" + this.defect.priority);
                  this.responsibleBodyControl.setValue("" + this.defect.defectsResponsibleBodyId);
                });
              },
              error: (errorObj) => {
              }
            })
        }
        else {
          this.defect = new Defect();
          this.defect.playdeviceFid = this.playdeviceFid;
          this.defect.dateCreation = new Date();
        }

      });
  }

  createDefect() {
    this.defectService.putDefect(this.defect)
      .subscribe({
        next: (defect) => {
          if (defect != null && defect.errorMessage != null
            && defect.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(defect);
            this.snackBar.open(defect.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snackBar.open("Mangel erfolgreich angelegt", "", {
              duration: 4000
            });
            this.defect = defect;
          }
        },
        error: (errorObj) => {
          this.snackBar.open("Unbekannter Fehler, evtl. schlechte Internetverbindung", "", {
            duration: 4000
          });
        }
      });
  }

  updateDefect() {
    this.defectService.postDefect(this.defect)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snackBar.open("Mangel erfolgreich aktualisiert", "", {
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

  switchDefectStatus(defect: Defect) {
    if (defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
  }

  uploadPhoto(defectTid: number, afterFixing: boolean, event: Event) {
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

          let defectPicture: DefectPicture = new DefectPicture();
          defectPicture.afterFixing = afterFixing;

          defectPicture.base64StringPicture = await pictureBase64Promise;

          let pictureBase64ThumbPromise: Promise<string> = ImageHelper.cropImage(defectPicture.base64StringPicture, 1, 1);
          defectPicture.base64StringPictureThumb = await pictureBase64ThumbPromise;

          this.defectService.putPicture(defectTid, defectPicture)
            .subscribe({
              next: (result) => {
                this.snackBar.open("Bild hochgeladen", "", {
                  duration: 4000
                });
              },
              error: (errorObj) => {
                this.snackBar.open("Unbekannter Fehler beim Bildhochladen", "", {
                  duration: 4000
                });
              }
            });
        }
      }
    }
  }

}
