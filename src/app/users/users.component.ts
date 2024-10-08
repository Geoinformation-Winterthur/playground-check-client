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
  dataSourceOrig: User[] = [];
  dataSource: User[] = [];

  showInactiveUsers: boolean = false;
  onlyShowNewUsers: boolean = false;

  responseMessage: string = "";

  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(
      usersList => {
        this.dataSourceOrig = usersList;
        this.updateUsersList();
      }, error => {
      });
  }

  updateUsersList() {
    this.dataSource = [];
    for (let user of this.dataSourceOrig) {
      if (this.showInactiveUsers) {
        if (this.onlyShowNewUsers) {
          if (user.isNew) this.dataSource.push(user);
        } else {
          this.dataSource.push(user);
        }
      } else {
        if (user.active) this.dataSource.push(user);
      }
    }

  }

}
