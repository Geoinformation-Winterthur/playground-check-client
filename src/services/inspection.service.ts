/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InspectionReport } from 'src/app/model/inspection-report';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getTypes(): Observable<string[]> {
    let result: Observable<string[]> = this.http.get(environment.apiUrl + "/inspection/types") as Observable<string[]>;
    return result;
  }

  postReports(inspectionReports : InspectionReport[]): Observable<any> {
    let result: Observable<any> = 
          this.http.post<InspectionReport[]>(environment.apiUrl + "/inspection/", inspectionReports);
    return result;
  }

}
