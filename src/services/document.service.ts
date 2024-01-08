/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getDocument(fid: number, type: string): Observable<any> {
    let head: HttpHeaders = new HttpHeaders();
    head = head.set("Accept", "application/pdf");
    let result: Observable<any> = this.http.get(environment.apiUrl +
      "/document/" + fid + "?type=abnahme", 
      {headers: head, responseType: "blob"}) as Observable<any>;
    return result;
  }

}
