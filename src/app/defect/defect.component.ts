import { Component, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DefectService } from 'src/services/defect.service';
import { UserService } from 'src/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageEvaluation } from 'src/helper/error-message-evaluation';

@Component({
  selector: 'app-defect',
  templateUrl: './defect.component.html',
  styleUrls: ['./defect.component.css']
})
export class DefectComponent implements OnInit {

  defect: Defect = new Defect();

  tid: number = -1;

  playdeviceFid: number = -1;

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
  }

  ngOnInit(): void {
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
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snackBar.open(errorMessage.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snackBar.open("Mangel erfolgreich angelegt", "", {
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

}
