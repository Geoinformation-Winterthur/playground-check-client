/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  postPlaydevice(playdevice: PlaydeviceFeature): Observable<any> {
    if (playdevice.properties.recommendedYearOfRenovation === null ||
      playdevice.properties.recommendedYearOfRenovation === undefined ||
      playdevice.properties.recommendedYearOfRenovation < 0) {
      playdevice.properties.recommendedYearOfRenovation = 0;
    }
    if (!playdevice.properties.defects) {
      playdevice.properties.defects = [];
    }
    let result: Observable<any> =
      this.http.post<PlaydeviceFeature[]>(environment.apiUrl + "/playdevice/", playdevice);
    return result;
  }

  putPicture(fid: number, picture: string): Observable<any> {
    let imageHeader: HttpHeaders = new HttpHeaders({ "content-type": "application/json" });
    let result: Observable<any> =
      this.http.put<string>(environment.apiUrl + "/playdevice/?fid=" + fid,
        { data: picture },
        { headers: imageHeader });
    return result;

  }
}
