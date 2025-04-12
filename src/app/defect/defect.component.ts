import { Component, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-defect',
  templateUrl: './defect.component.html',
  styleUrls: ['./defect.component.css']
})
export class DefectComponent implements OnInit {

  defect: Defect = new Defect();

  tid: number = -1;

  playdeviceFid: number = -1;

  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription;

  constructor(activatedRoute: ActivatedRoute) {
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
        }
        else {
          this.defect = new Defect();
          this.defect.playdeviceFid = this.playdeviceFid;
          this.defect.dateCreation = new Date();
        }

      });
  }

}
