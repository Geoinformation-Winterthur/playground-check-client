/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playground } from '../app/model/playground';
import { environment } from 'src/environments/environment';
import { Defect } from 'src/app/model/defect';


@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {

  public selectedPlayground: Playground = new Playground();

  private static playgroundTokenName: string = environment.playgroundToken;
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public activateSelectedPlaygroundFromLocalStorage() {
    this.selectedPlayground =
      JSON.parse(localStorage.getItem(PlaygroundService.playgroundTokenName)!);
  }

  public clearSelectedPlayground() {
    this.selectedPlayground = new Playground();
    localStorage.removeItem(PlaygroundService.playgroundTokenName);
  }

  public localStoreSelectedPlayground() {
    if (this.selectedPlayground !== null) {
      let storagePlayground: Playground = JSON.parse(localStorage.getItem(PlaygroundService.playgroundTokenName)!);
      if (storagePlayground !== null) {
        if (this.selectedPlayground.id === storagePlayground.id) {
          localStorage.setItem(PlaygroundService.playgroundTokenName, JSON.stringify(this.selectedPlayground));
        }
      } else {
        localStorage.setItem(PlaygroundService.playgroundTokenName, JSON.stringify(this.selectedPlayground));
      }
    }
  }

   getPlaygroundsNames(inspectionType : string): Observable<Playground[]> {
     let result: Observable<Playground[]> = this.http.get(environment.apiUrl +
       "/playground/onlynames?inspectiontype=" + inspectionType) as Observable<Playground[]>;
     return result;
   }

   getPlaygroundById(id : number, inspectionType: string): Observable<Playground> {
    let result: Observable<Playground> = this.http.get(environment.apiUrl +
       "/playground/" + id + "&inspectiontype="+inspectionType) as Observable<Playground>;
    return result;
  }

  getPlaygroundByName(name : string, inspectionType: string): Observable<Playground> {
    let result: Observable<Playground> = this.http.get(environment.apiUrl + 
      "/playground/byname?name=" + name + "&inspectiontype="+inspectionType) as Observable<Playground>;
    return result;
  }

  getPlaydeviceImage(x : number, y: number): Observable<string> {
    let requestUrl: string = environment.apiUrl + "/playground/mapimage?x=" + x + "&y=" + y;
    let result: Observable<string> = this.http.get(requestUrl, {
      responseType: "text"
    }) as Observable<string>;
    return result;
  }

  public getAllDefectsOfSelectedPlayground() : Defect[] {
    let result: Defect[] = [];
    for (let playdevice of this.selectedPlayground.playdevices) {
        for (let defect of playdevice.properties.defects) {
            result.push(defect);
        }
        for (let playdeviceDetail of playdevice.playdeviceDetails) {
          for (let defect of playdeviceDetail.properties.defects) {
            result.push(defect);
          }
        }
      }
    return result;
  }


}
