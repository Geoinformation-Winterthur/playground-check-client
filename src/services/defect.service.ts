import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Defect } from 'src/app/model/defect';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DefectService {

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  postDefects(defects : Defect[]): Observable<any> {
    let result: Observable<any> = 
          this.http.post<Defect[]>(environment.apiUrl + "/defect/", defects);
    return result;
  }

  insertDefects(defects : Defect[]): Observable<any> {
    let result: Observable<any> = 
          this.http.put<Defect[]>(environment.apiUrl + "/defect/", defects);
    return result;
  }
}
