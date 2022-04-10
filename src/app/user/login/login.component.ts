import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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
  inSubmission = false;

  credentials = {
    email: '',
    password: '',
  };

  constructor(private authService: AngularFireAuth) {}

  ngOnInit(): void {}

  setAlertMessage(msg: string, color: string, show = true) {
    this.alertMessage = msg;
    this.alertColor = color;
    this.showAlert = show;
  }

  async login() {
    const { email, password } = this.credentials;
    this.inSubmission = true;
    this.setAlertMessage('Please wait while we log you in', 'blue');
    try {
      await this.authService.signInWithEmailAndPassword(email, password);
      this.setAlertMessage('Login success!', 'green');
    } catch (e) {
      this.setAlertMessage(
        'Oop! An unexpected error has occured... please try again later',
        'red'
      );
    }
    this.inSubmission = false;
  }
}
