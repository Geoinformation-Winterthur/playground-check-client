/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Fachstelle Geoinformation Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { User } from '../model/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageEvaluation } from 'src/helper/error-message-evaluation';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: User = new User();

  activeCheckBox: boolean = false;

  userRoleFormControl: FormControl = new FormControl();

  private activatedRoute: ActivatedRoute;
  private router: Router;
  private userService: UserService;
  private snckBar: MatSnackBar;

  constructor(activatedRoute: ActivatedRoute, userService: UserService,
    router: Router, snckBar: MatSnackBar) {
    this.activatedRoute = activatedRoute;
    this.userService = userService;
    this.router = router;
    this.snckBar = snckBar;
  }

  ngOnInit(): void {
    this.user = new User();
    this.activatedRoute.params
      .subscribe({
        next: (params) => {
          let userEMail: string = params['email'];
            this.userService.getUser(userEMail).subscribe({
              next: (userArray: any) => {
                if (userArray !== null && userArray.length === 1) {
                  ErrorMessageEvaluation._evaluateErrorMessage(userArray[0]);
                  if (userArray[0].errorMessage.trim().length === 0) {
                    this.user = userArray[0];
                    this.userRoleFormControl.setValue(this.user.role);
                  }
                } else {
                  this.user.errorMessage = "Benutzer existiert nicht.";
                }
              },
              error: () => {
              }
            });
        },
        error: (error) => {
        }
      });

  }

  updateUser() {
    if (this.user && this.user.mailAddress) {
      this.userService.updateUser(this.user).subscribe({
        next: (errorMessage) => {
          if (errorMessage != null && errorMessage.errorMessage != null
            && errorMessage.errorMessage.trim().length !== 0) {
            ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
            this.snckBar.open(errorMessage.errorMessage, "", {
              duration: 4000
            });
          } else {
            this.snckBar.open("Benutzer erfolgreich aktualisiert", "", {
              duration: 4000
            });
          }
        },
        error: (error) => {
        }
      });
    }
  }

  changePassphrase() {
    this.userService.updateUser(this.user, true).subscribe({
      next: (errorMessage) => {
        if (errorMessage != null && errorMessage.errorMessage != null
          && errorMessage.errorMessage.trim().length !== 0) {
          ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
          this.snckBar.open(errorMessage.errorMessage, "", {
            duration: 4000
          });
        } else {
          this.snckBar.open("Passwort erfolgreich geändert", "", {
            duration: 4000
          });
        }
      },
      error: (error) => {
      }
    })
  }

  deleteUser() {
    this.userService.deleteUser(this.user.mailAddress).subscribe({
      next: (errorMessage) => {
        if (errorMessage != null && errorMessage.errorMessage != null
          && errorMessage.errorMessage.trim().length !== 0) {
          ErrorMessageEvaluation._evaluateErrorMessage(errorMessage);
          this.snckBar.open(errorMessage.errorMessage, "", {
            duration: 4000
          });
        } else {
          this.router.navigate(["/users"]);
        }
      },
      error: (error) => {
      }
    })
  }

  onUserRoleChange() {
    this.user.role = this.userRoleFormControl.value;
    this.updateUser();
  }

}
