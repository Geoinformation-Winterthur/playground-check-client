/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
 import { Component, OnInit } from '@angular/core';
 import { UserService } from 'src/services/user.service';
 
 @Component({
   selector: 'app-welcome',
   templateUrl: './welcome.component.html',
   styleUrls: ['./welcome.component.css']
 })
 /**
  * The WelcomeComponent is the component for the start
  * page of the playground web application.
  */
 export class WelcomeComponent implements OnInit {
 
   userService: UserService;
   appVersion: string = "2024.5";
 
   constructor(userService: UserService) {
     this.userService = userService;
   }
 
   ngOnInit(): void {    
   }
 
 }
 