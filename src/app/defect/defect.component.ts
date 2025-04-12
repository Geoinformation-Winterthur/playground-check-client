import { Component, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DefectService } from 'src/services/defect.service';
import { UserService } from 'src/services/user.service';

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

  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription;

  constructor(defectService: DefectService,
      userService: UserService,
      activatedRoute: ActivatedRoute) {
    this.defectService = defectService;
    this.userService = userService;
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

  switchDefectStatus(defect: Defect) {
    if (defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
  }

}
