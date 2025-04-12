/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InspectionReport } from 'src/app/model/inspection-report';
import { InspectionReportsAndDefects } from 'src/app/model/inspection-reports-and-defects';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {

  http: HttpClient;
  selectedInspectionType: string;
  availableRenovationTypes: string[];

  constructor(http: HttpClient) {
    this.http = http;
    this.selectedInspectionType = "";
    this.availableRenovationTypes = [];
  }

  getTypes(): Observable<string[]> {
    let result: Observable<string[]> = this.http.get(environment.apiUrl + "/inspection/types") as Observable<string[]>;
    return result;
  }

  loadRenovationTypes() {
    this.http.get(environment.apiUrl + "/inspection/renovationtypes")
    .subscribe({
      next: (typesData) => {
        this.availableRenovationTypes = typesData as string[];
      },
      error: (error) => {
      }});
  }

  postReports(inspectionReports: InspectionReport[]): Observable<any> {
    let result: Observable<any> = 
          this.http.post<InspectionReport[]>(environment.apiUrl + "/inspection/", inspectionReports);
    return result;
  }

}
