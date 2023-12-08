/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { InspectionService } from '../../services/inspection.service';
import { PlaygroundService } from '../../services/playgrounds.service';
import { map, startWith } from 'rxjs/operators';
import { Playground } from '../model/playground';
import { InspectionReport } from '../model/inspection-report';
import { InspectionCriterion } from '../model/inspection-criterion';

@Component({
  selector: 'app-choose-playground',
  templateUrl: './choose-playground.component.html',
  styleUrls: ['./choose-playground.component.css']
})
export class ChoosePlaygroundComponent {

  availableInspectionTypes: string[] = [];

  playgroundName: string = "";

  controlTypes: string[] = [];
  controlTypesFiltered: Observable<string[]> = new Observable<string[]>();

  playgrounds: Playground[] = [];
  playgroundsFiltered: Observable<Playground[]> = new Observable<Playground[]>();

  inspectionTypeControl: FormControl = new FormControl();

  playgroundSearchControl: FormControl = new FormControl();

  private inspectionService: InspectionService;
  playgroundService: PlaygroundService;

  isPlaygroundLoadSpinnerVisible: boolean = false;

  isPlaygroundsServiceOnline: boolean = false;

  loadingBarValue = 0;

  constructor(inspectionService: InspectionService,
    playgroundService: PlaygroundService) {
    this.inspectionService = inspectionService;
    this.playgroundService = playgroundService;
  }

  ngOnInit(): void {
    this.inspectionTypeControl.disable();
    this.playgroundSearchControl.disable();

    if (this.playgroundService.selectedPlayground !== null) {
      this.inspectionTypeControl.setValue(this.playgroundService.selectedPlayground.selectedInspectionType);
      this.playgroundSearchControl.setValue(this.playgroundService.selectedPlayground.name);
    }

    this.inspectionService.getTypes().subscribe({
      next: (typesData) => {
        let inspectionTypesNames: string[] = typesData;

        this.availableInspectionTypes.push("Keine Inspektion");
        for (let inspectionType of inspectionTypesNames) {
          this.availableInspectionTypes.push(inspectionType);
        }

        this.isPlaygroundsServiceOnline = true;

        if(this.inspectionService.chosenType){
          this.inspectionTypeControl.setValue(this.inspectionService.chosenType);
          this.selectInspectionType();
        }

        this.inspectionTypeControl.enable();

      },
      error: (error) => {
        this.isPlaygroundsServiceOnline = false;
      }});
  }

  selectInspectionType() {
    this.playgroundSearchControl.setValue("");
    this.playgroundSearchControl.disable();
    this.isPlaygroundLoadSpinnerVisible = true;
    this.playgroundService.clearSelectedPlayground();
    this.inspectionService.chosenType = this.inspectionTypeControl.value;
    this._loadPlaygroundNames(this.inspectionTypeControl.value);
  }

  selectPlayground() {
    // get playground from webservice:
    this.playgroundService.getPlaygroundByName(this.playgroundSearchControl.value,
      this.inspectionTypeControl.value)
      .subscribe(playgroundData => {
        // playground was received from webservice

        this.loadingBarValue = 0;

        const numberOfPlaydevices: number = playgroundData.playdevices.length;
        const loadingIncrementStep: number = (100 / numberOfPlaydevices) / 2;

        for (let playdevice of playgroundData.playdevices) {
          playdevice.properties.dateOfService = new Date();
          if(playdevice.properties.recommendedYearOfRenovation !== null &&
               playdevice.properties.recommendedYearOfRenovation !== undefined &&
                   playdevice.properties.recommendedYearOfRenovation <= 0){
            playdevice.properties.recommendedYearOfRenovation = undefined;
          }
          this._instantiateInspectionReports(playdevice.properties.generalInspectionCriteria);
          this._instantiateInspectionReports(playdevice.properties.mainFallProtectionInspectionCriteria);
          this._instantiateInspectionReports(playdevice.properties.secondaryFallProtectionInspectionCriteria);

          for (let playdeviceDetail of playdevice.playdeviceDetails) {
            playdeviceDetail.properties.dateOfService = new Date();
            this._instantiateInspectionReports(playdeviceDetail.properties.generalInspectionCriteria);
            this._instantiateInspectionReports(playdeviceDetail.properties.mainFallProtectionInspectionCriteria);
            this._instantiateInspectionReports(playdeviceDetail.properties.secondaryFallProtectionInspectionCriteria);
          }
          this.loadingBarValue += loadingIncrementStep;
        }

        // set reference on selected playground:
        this.playgroundService.selectedPlayground = playgroundData;

        // update selected inspection type on playground object:
        this.playgroundService.selectedPlayground.selectedInspectionType = this.inspectionTypeControl.value;

        // calculate date of last inspection of the whole playground
        for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
          for (let report of playdevice.properties.lastInspectionReports) {
            if(report.dateOfService && this.playgroundService.selectedPlayground.dateOfLastInspection) {
             if (report.dateOfService > this.playgroundService.selectedPlayground.dateOfLastInspection) {
               this.playgroundService.selectedPlayground.dateOfLastInspection = report.dateOfService;
             } 
            }
          }
          for (let playdeviceDetail of playdevice.playdeviceDetails) {
            for (let report of playdeviceDetail.properties.lastInspectionReports) {
             if (report.dateOfService && this.playgroundService.selectedPlayground.dateOfLastInspection) {
               if (report.dateOfService > this.playgroundService.selectedPlayground.dateOfLastInspection) {
                 this.playgroundService.selectedPlayground.dateOfLastInspection = report.dateOfService;
               }
              }
            }
          }
        }


        // set playground from webservice as new playground in local storage:
        this.playgroundService.localStoreSelectedPlayground();

        // make crosshair asset image offline available:
        let crossHairAssetImage: HTMLImageElement = new Image();
        crossHairAssetImage.src = "assets/crosshair.png";

        // update map images on all playdevices:
        for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
         this.playgroundService.getPlaydeviceImage(
            playdevice.geometry.coordinates[0],
            playdevice.geometry.coordinates[1]
          )
            .subscribe(image => {
              playdevice.properties.mapImageBase64String = image;
              this.playgroundService.localStoreSelectedPlayground();
              this.loadingBarValue += loadingIncrementStep;
              if(this.loadingBarValue > 99) {
               this.playgroundService.selectedPlayground.hasFullyLoaded = true;
              }
            });
        }

      });

  }

  private _instantiateInspectionReports(inspectionCriteria: InspectionCriterion[]) {
    if (inspectionCriteria) {
      for (let inspectionCriterion of inspectionCriteria) {
        inspectionCriterion.currentInspectionReport = new InspectionReport();
        inspectionCriterion.currentInspectionReport.inspectionType = this.inspectionTypeControl.value;
        inspectionCriterion.currentInspectionReport.inspectionText = inspectionCriterion.check;
        inspectionCriterion.currentInspectionReport.maintenanceText = inspectionCriterion.maintenance;
      }
    }
  }

  private _loadPlaygroundNames(inspectionType: string) {
    this.playgrounds = [];
    this.playgroundService.getPlaygroundsNames(inspectionType).subscribe({
     next: (playgroundsData) => {
       this.isPlaygroundsServiceOnline = true;
       this.playgrounds = playgroundsData.sort();

       this.isPlaygroundLoadSpinnerVisible = false;
       this.playgroundSearchControl.enable();  
       this.playgroundsFiltered = this.playgroundSearchControl.valueChanges.pipe(
          startWith(''),
          map(playgroundName => this._filterPlaygroundsByName(playgroundName))
       );
 
     },
     error: (error) => {
        this.isPlaygroundsServiceOnline = false;
     }});
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
        let isNull: boolean = playgroundNameLower.indexOf(playgroundName) === 0;
        return isNull;
      });
    }
    return result;
  }

}
