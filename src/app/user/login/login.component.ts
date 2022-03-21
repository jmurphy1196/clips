import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  showAlert = false;
  alertColor = 'blue';
  alertMessage = 'Please wait while we log you in :D ';

  credentials = {
    email: '',
    password: '',
  };

  constructor() {}

  ngOnInit(): void {}
  login(loginForm: NgForm) {
    this.showAlert = true;
    this.alertMessage = 'Please wait while we log you in :D';
    this.alertColor = 'blue';
    console.log(loginForm.valid);
  }
}
