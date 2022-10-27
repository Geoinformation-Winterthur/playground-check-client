/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { Component, OnInit } from '@angular/core';
 import { PlaygroundService } from 'src/services/playgrounds.service';
 
 @Component({
   selector: 'app-choose-device',
   templateUrl: './choose-device.component.html',
   styleUrls: ['./choose-device.component.css']
 })
 export class ChooseDeviceComponent implements OnInit {
 
   playgroundService: PlaygroundService;
 
   constructor(playgroundService: PlaygroundService) {
     this.playgroundService = playgroundService;
    }
 
   ngOnInit(): void {
   }
 
 }
 