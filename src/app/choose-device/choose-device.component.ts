/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { Playground } from '../model/playground';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from 'src/services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  documentService: DocumentService;

  private snckBar: MatSnackBar;
  private activatedRouteSubscription: Subscription;

  constructor(playgroundService: PlaygroundService,
    documentService: DocumentService, snckBar: MatSnackBar,
    private router: Router, private activatedRoute: ActivatedRoute) {
    this.playgroundService = playgroundService;
    this.documentService = documentService;
    this.snckBar = snckBar;
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
         }});

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

  downloadPdf(documentOfAcceptanceFid: number, type: string){
    this.documentService.getDocument(documentOfAcceptanceFid, type).subscribe({
      next: (documentData) => {
        let objUrl = window.URL.createObjectURL(documentData);
        let newBrowserTab = window.open();
        if(newBrowserTab)
          newBrowserTab.location.href = objUrl;
      },
      error: (error) => {
        this.snckBar.open("Fehler beim Download des PDF-Dokuments.", "", {
          duration: 4000
        });
      }});
  }

  private _selectPlayground(playgroundName: string) {

    // get playground from webservice:
    this.playgroundService.getPlaygroundByName(playgroundName,
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
