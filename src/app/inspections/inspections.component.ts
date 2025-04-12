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

  constructor(playgroundService: PlaygroundService,
    inspectionService: InspectionService
  ) {
    this.playgroundService = playgroundService;
    this.inspectionService = inspectionService;
  }

  ngOnInit(): void {
    if(this.inspectionService.selectedInspectionType){
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
      }});
  }

  selectPlayground() {

    // get playground from webservice:
    this.playgroundService.getPlaygroundByName(this.playgroundSearchControl.value,
      this.inspectionTypeControl.value)
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
        for (let playdevice of this.playgroundService.selectedPlayground.playdevices) {
          for (let report of playdevice.properties.lastInspectionReports) {
            if (report.dateOfService && this.playgroundService.selectedPlayground.dateOfLastInspection) {
              if (report.dateOfService > this.playgroundService.selectedPlayground.dateOfLastInspection) {
                this.playgroundService.selectedPlayground.dateOfLastInspection = report.dateOfService;
              }
            }
          }
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
