/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { Playground } from '../model/playground';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { of as ObservableOf } from 'rxjs';

@Component({
  selector: 'app-defects',
  templateUrl: './defects.component.html',
  styleUrls: ['./defects.component.css']
})
export class DefectsComponent implements OnInit {

  selectedPlayground: Playground = new Playground();

  playgrounds: Playground[] = [];

  playgroundsFiltered: Observable<Playground[]> = new Observable<Playground[]>();

  playgroundSearchControl: FormControl = new FormControl();
  showOnlyWithDefectsControl: FormControl = new FormControl();

  playgroundService: PlaygroundService;

  private activatedRoute: ActivatedRoute;
  private activatedRouteSubscription: Subscription;

  constructor(playgroundService: PlaygroundService,
    activatedRoute: ActivatedRoute,
    private router: Router) {
    this.playgroundService = playgroundService;
    this.activatedRoute = activatedRoute;
    this.activatedRouteSubscription = new Subscription();
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
      }
    });

    this.activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(params => {
        let playgroundName: string = params['playground_name'];
        if(playgroundName != null){
          playgroundName = playgroundName.trim();
          this._selectPlayground(playgroundName);  
        }
      });
  }

  selectPlayground() {
    this.showOnlyWithDefectsControl.setValue(false);
    const selectedName = this.playgroundSearchControl.value;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        playground_name: selectedName
      },
      queryParamsHandling: 'merge'
    });
  
    this._selectPlayground(selectedName);
  }

  onClickShowOnlyWithDefects() {
    if(this.showOnlyWithDefectsControl.value){
      let result: Playground[] = this.playgrounds.filter(playground => {
        return playground.hasOpenDeviceDefects;
      });
      this.playgroundsFiltered = ObservableOf(result);  
    } else {
      this.playgroundsFiltered = ObservableOf(this.playgrounds);  
    }
  }

  private _selectPlayground(playgroundName: string) {

    // get playground from webservice:
    this.playgroundService.getPlaygroundByName(playgroundName,
      "Keine Inspektion", true, false)
      .subscribe(playgroundData => {
        // playground was received from webservice
        for (let playdevice of playgroundData.playdevices) {
          if (playdevice.properties.recommendedYearOfRenovation !== null &&
            playdevice.properties.recommendedYearOfRenovation !== undefined &&
            playdevice.properties.recommendedYearOfRenovation <= 0) {
            playdevice.properties.recommendedYearOfRenovation = undefined;
          }
        }

        // set reference on selected playground:
        this.selectedPlayground = playgroundData;

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
