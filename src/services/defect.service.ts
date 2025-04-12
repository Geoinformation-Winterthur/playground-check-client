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

  getDefect(tid : number): Observable<any> {
    let result: Observable<any> = 
          this.http.get<Defect>(environment.apiUrl + "/defect/?tid=" + tid);
    return result;
  }

  postDefect(defect : Defect): Observable<any> {
    let result: Observable<any> = 
          this.http.post<Defect>(environment.apiUrl + "/defect/", defect);
    return result;
  }
}
