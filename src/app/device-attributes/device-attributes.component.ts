/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { UserService } from 'src/services/user.service';
import { Defect } from '../model/defect';
import { InspectionReport } from '../model/inspection-report';
import { PlaydeviceDetail } from '../model/playdevice-detail';
import { PlaydeviceFeature } from '../model/playdevice-feature';
import { InspectionService } from 'src/services/inspection.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-device-attributes',
  templateUrl: './device-attributes.component.html',
  styleUrls: ['./device-attributes.component.css']
})
export class DeviceAttributesComponent implements OnInit {

  playdevice: PlaydeviceFeature | PlaydeviceDetail;

  // is this device a detail?:
  isDetail: boolean = false;

  readonly currentYear: number;

  playgroundService: PlaygroundService;
  inspectionService: InspectionService;
  userService: UserService;

  selectedLastInspectionType: string = "";
  selectedNextToLastInspectionType: string = "";

  renovationTypeControl: FormControl = new FormControl();

  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription;

  constructor(playgroundService: PlaygroundService, inspectionService: InspectionService,
    userService: UserService, activatedRoute: ActivatedRoute) {
    this.playdevice = new PlaydeviceFeature();
    this.currentYear = new Date().getFullYear();
    this.playgroundService = playgroundService;
    this.inspectionService = inspectionService;
    this.userService = userService;
    this.activatedRoute = activatedRoute;
    this.activatedRouteSubscription = new Subscription();
  }

  ngOnInit() {

    if (this.playgroundService.selectedPlayground.inspectionTypeOptions.length !== 0) {
      this.selectedLastInspectionType = this.playgroundService.selectedPlayground.inspectionTypeOptions[0];
      this.selectedNextToLastInspectionType = this.playgroundService.selectedPlayground.inspectionTypeOptions[0];
    }

    this.activatedRouteSubscription = this.activatedRoute.params
      .subscribe(params => {
        let playdeviceId: number = parseInt(params['id']);
        let deviceType: string = params['devicetype'];

        if (deviceType === 'playdevice') {
          let playdeviceLocal = this.playgroundService.selectedPlayground
            .playdevices.find(plydvc => plydvc.properties.fid === playdeviceId);
          this.playdevice = playdeviceLocal as PlaydeviceFeature;
          this.playdevice.properties.dateOfService = new Date();
          PlaydeviceFeature.evaluateChecks(this.playdevice as PlaydeviceFeature);
          PlaydeviceFeature.evaluateHasOldInspectionReports(this.playdevice as PlaydeviceFeature);
        } else if (deviceType === 'playdevicedetail') {
          this.isDetail = true;
          for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
            for (let playdeviceDetail of playdevice.playdeviceDetails) {
              if (playdeviceDetail.properties.fid === playdeviceId) {
                this.playdevice = playdeviceDetail;
                PlaydeviceDetail.evaluateChecks(this.playdevice as PlaydeviceDetail);
                PlaydeviceDetail.evaluateHasOldInspectionReports(this.playdevice as PlaydeviceDetail);
                break;
              }
            }
          }
        }

      });
  }

  /*
  getErrorMessageBezeichnung() {
    return this.email.hasError('reqired') ? 'Sie müssen einen Wert eingeben' :
      this.email.hasError('email') ? 'Keine gültige Bezeichnung' : '';
  }
  */

  getNumberOfInspectionCriteria(): number {
    let numberOfInspectionCriteria: number = 0;
    if (this.playdevice.properties.generalInspectionCriteria !== null)
      numberOfInspectionCriteria += this.playdevice.properties.generalInspectionCriteria.length;
    if (this.playdevice.properties.mainFallProtectionInspectionCriteria !== null)
      numberOfInspectionCriteria += this.playdevice.properties.mainFallProtectionInspectionCriteria.length;
    if (this.playdevice.properties.secondaryFallProtectionInspectionCriteria !== null)
      numberOfInspectionCriteria += this.playdevice.properties.secondaryFallProtectionInspectionCriteria.length;
    return numberOfInspectionCriteria;
  }

  hasLastInspectionReports(inspectionType: string): boolean {
    for (let report of this.playdevice.properties.lastInspectionReports) {
      if (report.inspectionType === inspectionType) {
        return true;
      }
    }
    return false;
  }

  hasNextToLastInspectionReports(inspectionType: string): boolean {
    for (let report of this.playdevice.properties.nextToLastInspectionReports) {
      if (report.inspectionType === inspectionType) {
        return true;
      }
    }
    return false;
  }

  areDefectsDone(defects: Defect[]): boolean {
    let allDefectsDone: boolean = false;
    allDefectsDone = true;
    for (let defect of defects) {
      if (!defect.dateDone) {
        allDefectsDone = false;
        break;
      }
    }
    return allDefectsDone;
  }

  /*
  This method is needed for calendar ui:
  This clears out all dates in the future,
  so that only dates in the past (excluding today)
  can be selected.
  */
  dateFilterAllFuture(calDate: Date): boolean {
    if (calDate == undefined) {
      calDate = new Date();
    }
    let today = new Date();
    return calDate < today;
  }

  /*
  This method is needed for calendar UI:
  This clears out all dates in the past,
  so that only dates in the future (including today)
  can be selected.
  */
  dateFilterAllPast(calDate: Date): boolean {
    if (calDate == undefined) {
      calDate = new Date();
    }
    let today: Date = new Date();
    today.setDate(today.getDate() - 1);
    return calDate > today;
  }

  /*
  This method is needed for calendar ui:
  This clears out all dates in the future,
  so that only dates in the past (excluding today)
  can be selected. Additionally this clears out
  all dates that are before the last inspection.
  */
  dateFilterForInspection = this.dateFilterForInspectionValidate.bind(this);
  dateFilterForInspectionValidate(calDate: Date): boolean {
    if (calDate == undefined) {
      calDate = new Date();
    }
    let today = new Date();

    if (this.playgroundService.selectedPlayground.dateOfLastInspection) {

      let dateOflastInspection: Date = this.playgroundService.selectedPlayground.dateOfLastInspection;
      let dateOflastInspectionString: string = dateOflastInspection.toString();
      dateOflastInspection = new Date(dateOflastInspectionString);

      if (dateOflastInspection.getFullYear() != 1) {
        // if dateOflastInspection is really set (year is not 0001)
        // exclude days before dateOflastInspection and all future days:
        return calDate > dateOflastInspection && calDate < today;
      }

    }

    // if dateOflastInspection is not really set (year is null or 0001)
    return calDate < today;  // exclude all future days

  }

  switchDefectStatus(defect: Defect) {
    if (defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
    this.playgroundService.localStoreSelectedPlayground();
  }

  validateRenovationYear() {
    let today: Date = new Date();
    if (this.playdevice.properties.recommendedYearOfRenovation &&
      this.playdevice.properties.recommendedYearOfRenovation < today.getFullYear()) {
      this.playdevice.properties.recommendedYearOfRenovation = undefined;
      this.renovationTypeControl.setValue("");
    }
    this.playgroundService.localStoreSelectedPlayground();
  }

  selectRenovationType() {
    this.playdevice.properties.renovationType = this.renovationTypeControl.value;
    this.playgroundService.localStoreSelectedPlayground();
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

}
