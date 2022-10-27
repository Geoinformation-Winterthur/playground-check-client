/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlaydeviceFeature } from '../app/model/playdevice-feature';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaydeviceService {

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  postPlaydevices(playdevices : PlaydeviceFeature[]): Observable<any> {
    for(let playdevice of playdevices){
      if(playdevice.properties.costEstimation === null ||
          playdevice.properties.costEstimation === undefined ||
              playdevice.properties.costEstimation < 0){
          playdevice.properties.costEstimation = 0;
      }
      if(playdevice.properties.recommendedYearOfRenovation === null ||
        playdevice.properties.recommendedYearOfRenovation === undefined ||
              playdevice.properties.recommendedYearOfRenovation < 0){
          playdevice.properties.recommendedYearOfRenovation = 0;
      }
    }
    let result: Observable<any> = 
          this.http.post<PlaydeviceFeature[]>(environment.apiUrl + "/playdevice/", playdevices);
    return result;
  }
}
