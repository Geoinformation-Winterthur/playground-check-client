/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { Playground } from '../model/playground';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-choose-device',
  templateUrl: './choose-device.component.html',
  styleUrls: ['./choose-device.component.css']
})
export class ChooseDeviceComponent implements OnInit {

  selectedPlayground: Playground = new Playground();

  playgrounds: Playground[] = [];

  playgroundsFiltered: Observable<Playground[]> = new Observable<Playground[]>();

  playgroundSearchControl: FormControl = new FormControl();

  playgroundService: PlaygroundService;

  constructor(playgroundService: PlaygroundService) {
    this.playgroundService = playgroundService;
  }

  ngOnInit(): void {
        this.playgrounds = [];
        this.playgroundService.getPlaygroundsNames("Keine Inspektion").subscribe({
         next: (playgroundsData) => {
                 this.playgroundSearchControl.enable();  
                 this.playgroundsFiltered = this.playgroundSearchControl.valueChanges.pipe(
                    startWith(''),
                    map(playgroundName => this._filterPlaygroundsByName(playgroundName))
                 );
          
           this.playgrounds = playgroundsData.sort();
               this.playgroundSearchControl.enable();       
         },
         error: (error) => {
         }});
  }

  selectPlayground() {

    // get playground from webservice:
    this.playgroundService.getPlaygroundByName(this.playgroundSearchControl.value,
        "Keine Inspektion", false, false)
      .subscribe(playgroundData => {
        // playground was received from webservice
        for (let playdevice of playgroundData.playdevices) {
          playdevice.properties.dateOfService = new Date();
          if(playdevice.properties.recommendedYearOfRenovation !== null &&
               playdevice.properties.recommendedYearOfRenovation !== undefined &&
                   playdevice.properties.recommendedYearOfRenovation <= 0){
            playdevice.properties.recommendedYearOfRenovation = undefined;
          }
        }

        // set reference on selected playground:
        this.selectedPlayground = playgroundData;

        // calculate date of last inspection of the whole playground
        for (let playdevice of this.selectedPlayground.playdevices) {
          for (let report of playdevice.properties.lastInspectionReports) {
            if(report.dateOfService && this.selectedPlayground.dateOfLastInspection) {
             if (report.dateOfService > this.selectedPlayground.dateOfLastInspection) {
               this.selectedPlayground.dateOfLastInspection = report.dateOfService;
             } 
            }
          }
        }

        // make crosshair asset image offline available:
        let crossHairAssetImage: HTMLImageElement = new Image();
        crossHairAssetImage.src = "assets/crosshair.png";

      });

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

}
