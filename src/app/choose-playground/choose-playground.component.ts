/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { of as ObservableOf } from 'rxjs';
import { InspectionService } from '../../services/inspection.service';
import { PlaygroundService } from '../../services/playgrounds.service';
import { map, startWith } from 'rxjs/operators';
import { Playground } from '../model/playground';
import { InspectionReport } from '../model/inspection-report';
import { InspectionCriterion } from '../model/inspection-criterion';
import { environment } from 'src/environments/environment';
import { DocumentService } from 'src/services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-choose-playground',
  templateUrl: './choose-playground.component.html',
  styleUrls: ['./choose-playground.component.css']
})
export class ChoosePlaygroundComponent {

  availableInspectionTypes: string[] = [];

  playgroundName: string = "";

  showOnlyWithDefectsControl: FormControl = new FormControl();

  controlTypes: string[] = [];
  controlTypesFiltered: Observable<string[]> = new Observable<string[]>();

  playgrounds: Playground[] = [];
  playgroundsFiltered: Observable<Playground[]> = new Observable<Playground[]>();

  inspectionTypeControl: FormControl = new FormControl();

  playgroundSearchControl: FormControl = new FormControl();

  private snckBar: MatSnackBar;
  private inspectionService: InspectionService;
  playgroundService: PlaygroundService;
  documentService: DocumentService;

  isPlaygroundLoadSpinnerVisible: boolean = false;

  isPlaygroundsServiceOnline: boolean = false;

  loadingBarValue = 0;

  environment = environment;

  constructor(inspectionService: InspectionService,
    playgroundService: PlaygroundService,
    documentService: DocumentService,
    snckBar: MatSnackBar) {
    this.inspectionService = inspectionService;
    this.playgroundService = playgroundService;
    this.documentService = documentService;
    this.snckBar = snckBar;
  }

  ngOnInit(): void {
    this.inspectionTypeControl.disable();
    this.playgroundSearchControl.disable();

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

        this.availableInspectionTypes.push("Keine Inspektion");
        for (let inspectionType of inspectionTypesNames) {
          this.availableInspectionTypes.push(inspectionType);
        }

        this.isPlaygroundsServiceOnline = true;

        this.inspectionTypeControl.enable();

      },
      error: (error) => {
        this.isPlaygroundsServiceOnline = false;
      }});
  }

  selectInspectionType() {
    this.showOnlyWithDefectsControl.setValue(false);
    this.playgroundSearchControl.setValue("");
    this.playgroundSearchControl.disable();
    this.isPlaygroundLoadSpinnerVisible = true;
    this.playgroundService.clearSelectedPlayground();
    this.inspectionService.selectedInspectionType = this.inspectionTypeControl.value;
    this._loadPlaygroundNames(this.inspectionTypeControl.value);
  }

  selectPlayground() {

    this.inspectionService.loadRenovationTypes();

    this.showOnlyWithDefectsControl.setValue(false);
    
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
