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
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  public selectedPlayground: Playground = new Playground();
  private static playgroundTokenName: string = environment.playgroundToken;
  private http: HttpClient;
  private dbPromise: Promise<IDBPDatabase>;

  constructor(http: HttpClient) {
    this.http = http;
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB('PlaygroundDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('playgrounds')) {
          db.createObjectStore('playgrounds');
        }
      }
    });
  }

  public async activateSelectedPlaygroundFromLocalStorage() {
    const db = await this.dbPromise;
    const stored = await db.get('playgrounds', PlaygroundService.playgroundTokenName);
    if (stored) {
      this.selectedPlayground = stored;
    }
  }

  public async clearSelectedPlayground() {
    this.selectedPlayground = new Playground();
    const db = await this.dbPromise;
    await db.delete('playgrounds', PlaygroundService.playgroundTokenName);
  }

  public localStoreSelectedPlayground(): void {
    this.dbPromise.then(async db => {
      if (this.selectedPlayground !== null) {
        const storagePlayground = await db.get('playgrounds', PlaygroundService.playgroundTokenName);
        if (!storagePlayground || storagePlayground.id === this.selectedPlayground.id) {
          await db.put('playgrounds', this.selectedPlayground, PlaygroundService.playgroundTokenName);
        }
      }
    }).catch(err => {
      console.error('Fehler beim Speichern in IndexedDB:', err);
    });
  }

  getPlaygroundsNames(inspectionType: string): Observable<Playground[]> {
    let result: Observable<Playground[]> = this.http.get(environment.apiUrl +
      "/playground/onlynames?inspectiontype=" + inspectionType) as Observable<Playground[]>;
    return result;
  }

  getPlaygroundById(id: number, inspectionType: string): Observable<Playground> {
    let result: Observable<Playground> = this.http.get(environment.apiUrl +
      "/playground/" + id + "&inspectiontype=" + inspectionType) as Observable<Playground>;
    return result;
  }

  getPlaygroundByName(name: string, inspectionType: string,
        withdefects: boolean = false, withinspections: boolean = false): Observable<Playground> {
    let result: Observable<Playground> = this.http.get(environment.apiUrl +
      "/playground/byname?name=" + name + "&inspectiontype=" + inspectionType
          + "&withdefects=" + withdefects + "&withinspections=" + withinspections) as Observable<Playground>;
    return result;
  }

  public getAllOldDefectsOfSelectedPlayground(): Defect[] {
    let result: Defect[] = [];
    for (let playdevice of this.selectedPlayground.playdevices) {
      if (!playdevice.properties.notToBeChecked &&
        !playdevice.properties.cannotBeChecked) {
        for (let defect of playdevice.properties.defects) {
          result.push(defect);
        }
      }
    }
    return result;
  }


}
