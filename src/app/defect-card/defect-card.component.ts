import { Component, Input, OnInit } from '@angular/core';
import { Defect } from '../model/defect';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { UserService } from 'src/services/user.service';
import { DefectsComponent } from '../defects/defects.component';
import { ImageHelper } from 'src/helper/image-helper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DefectPicture } from '../model/defect-picture';

@Component({
  selector: 'spk-defect-card',
  templateUrl: './defect-card.component.html',
  styleUrls: ['./defect-card.component.css']
})
export class DefectCardComponent implements OnInit {

  @Input() defect: Defect = new Defect();

  playgroundService: PlaygroundService;
  userService: UserService;

  constructor(playgroundService: PlaygroundService,
    userService: UserService, private defectsComponent: DefectsComponent,
      private domSanitizer: DomSanitizer) {
    this.playgroundService = playgroundService;
    this.userService = userService;
  }

  ngOnInit(): void {
  }

  switchDefectStatus(defect: Defect) {
    if (defect.dateDone) {
      defect.dateDone = undefined;
    } else {
      defect.dateDone = new Date();
    }
    this.playgroundService.localStoreSelectedPlayground();
  }

  removeDefect(defectUuid: string) {
    if (this.defectsComponent.playdevice.properties.defects) {
      this.defectsComponent.playdevice.properties.defects =
      this.defectsComponent.playdevice.properties.defects
          .filter((defect) => defect.uuid !== defectUuid);
    }
  }

  getDefectPictures(afterFixing: boolean) : DefectPicture[] {
    let picturesTemp: DefectPicture[] = [];
    for(let defectPicture of this.defect.pictures){
      if(defectPicture.afterFixing === afterFixing){
        picturesTemp.push(defectPicture);
      }
    }
    return picturesTemp;
  }

  openImage(base64String: string) {
    ImageHelper.openImage(base64String);
  }

  addPhotos(event: Event, afterFixing: boolean){
    let inputElement: HTMLInputElement = event.target as HTMLInputElement;
    let files: FileList = inputElement.files as FileList;
    for(let file of Array.from(files)){
      this._addPhoto(file, afterFixing);
    }
  }

  sanitizeUrl(base64String: string): SafeUrl {
    return ImageHelper.sanitizeUrl(base64String, this.domSanitizer);
  }

  private _addPhoto(file: File, afterFixing: boolean){
    if(file){
      let fileReader: FileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = async () => {
        let pictureBase64String: string = fileReader.result as string;
        let pictureBase64Promise: Promise<string> = ImageHelper.downsizeImage(pictureBase64String, 1200, 800);
        let picture: DefectPicture = new DefectPicture();
        picture.afterFixing = afterFixing;
        let pictureBase64ThumbPromise = ImageHelper.downsizeImage(pictureBase64String, 300, 200);
        let base64StringPictureThumb: string = await pictureBase64ThumbPromise;
        pictureBase64ThumbPromise = ImageHelper.cropImage(base64StringPictureThumb, 1, 1);
        picture.base64StringPicture = await pictureBase64Promise;
        picture.base64StringPictureThumb = await pictureBase64ThumbPromise;
        this.defect.pictures.push(picture);
        this.playgroundService.localStoreSelectedPlayground();
      }
    }
  }

}
