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
import { User } from '../model/user';

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
  responsibleUserControl: FormControl = new FormControl();

  assignableUsers: User[] = [];

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
      this.defect.defectsResponsibleBodyId = value !== null && value !== undefined && value !== "" ? parseInt(value) : -1;
    });

    this.responsibleUserControl = new FormControl();
    this.responsibleUserControl.valueChanges.subscribe(value => {
      this.defect.responsibleUserFid = value !== null && value !== undefined && value !== "" ? parseInt(value) : -1;
      if (this.defect.responsibleUserFid <= 0) {
        this.defect.assignmentStatus = "";
      } else if (this.defect.assignmentStatus == null || this.defect.assignmentStatus.trim().length === 0) {
        this.defect.assignmentStatus = "zugewiesen";
      }
    });

    this.userService.getAssignableUsers().subscribe({
      next: (users) => {
        this.assignableUsers = users;
      },
      error: () => {
        this.assignableUsers = [];
      }
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
                  this.responsibleBodyControl.setValue(this.defect.defectsResponsibleBodyId > 0 ? "" + this.defect.defectsResponsibleBodyId : "");
                  this.responsibleUserControl.setValue(this.defect.responsibleUserFid > 0 ? "" + this.defect.responsibleUserFid : "");
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
          setTimeout(() => {
            this.responsibleBodyControl.setValue("");
            this.responsibleUserControl.setValue("");
          });
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

  acceptAssignment() {
    this.defectService.acceptAssignment(this.defect)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", { duration: 4000 });
          } else {
            this.defect.assignmentStatus = "angenommen";
            this.defect.dateAssignmentAccepted = new Date();
            this.defect.dateAssignmentRejected = undefined;
            this.snackBar.open("Auftrag angenommen", "", { duration: 4000 });
          }
        },
        error: () => {
          this.snackBar.open("Auftrag konnte nicht angenommen werden", "", { duration: 4000 });
        }
      });
  }

  rejectAssignment() {
    this.defectService.rejectAssignment(this.defect)
      .subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", { duration: 4000 });
          } else {
            this.defect.assignmentStatus = "abgelehnt";
            this.defect.dateAssignmentRejected = new Date();
            this.snackBar.open("Auftrag abgelehnt", "", { duration: 4000 });
          }
        },
        error: () => {
          this.snackBar.open("Auftrag konnte nicht abgelehnt werden", "", { duration: 4000 });
        }
      });
  }

  isAssignmentForCurrentUser(): boolean {
    const localUser = this.userService.getLocalUser();
    if (this.defect == null || this.defect.responsibleUserFid <= 0 || localUser == null) return false;
    if (localUser.fid === this.defect.responsibleUserFid) return true;

    for (let user of this.assignableUsers) {
      if (user.fid === this.defect.responsibleUserFid
        && user.mailAddress != null && localUser.mailAddress != null
        && user.mailAddress.trim().toLowerCase() === localUser.mailAddress.trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  }


  getAssignmentStatusLabel(): string {
    if (this.defect.assignmentStatus === 'angenommen') return 'angenommen';
    if (this.defect.assignmentStatus === 'abgelehnt') return 'abgelehnt';
    return 'zugewiesen';
  }

  getAssignmentStatusClass(): string {
    if (this.defect.assignmentStatus === 'angenommen') return 'status-accepted';
    if (this.defect.assignmentStatus === 'abgelehnt') return 'status-rejected';
    return 'status-assigned';
  }

  getResponsibleUserName(fid: number): string {
    for (let user of this.assignableUsers) {
      if (user.fid === fid) return user.firstName + " " + user.lastName;
    }
    return "";
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
                if(afterFixing)
                  this.defect.defectPicsAfterFixingTids.push(result.tid);
                else
                  this.defect.defectPicsTids.push(result.tid);
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
