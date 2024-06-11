import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  displayedColumns: string[] = ['editAction', 'firstName', 'lastName', 'mailAddress', 'role', 'active'];
  dataSource: User[] = [];

  responseMessage: string = "";

  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(
      usersList => {
        this.dataSource = usersList;
      }, error => {
      });
  }

}
