import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    private authService: AuthService,
    private emailTaken: EmailTaken
  ) {}

  showAlert = false;
  alertMessage = '';
  alertColor = '';
  inSubmission = false;
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
  age = new FormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  //password regex min 8 chars , one letter, one number, one special character
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    ),
  ]);
  confirmPassword = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13),
  ]);
  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.match(this.password, this.confirmPassword)]
  );

  setAlertMessage(msg: string, color: string, show = true) {
    this.alertMessage = msg;
    this.alertColor = color;
    this.showAlert = show;
  }

  handleErrorMessage(e: any) {
    if (e && e.code) {
      if (e.code === 'auth/email-already-in-use') {
        this.setAlertMessage(
          'An account already exists with this email',
          'red'
        );
        return;
      }
    }
    this.setAlertMessage(
      'An unexpected error has occured, please try again later',
      'red'
    );
  }

  async register() {
    this.setAlertMessage('Please Wait! Your account is being created!', 'blue');
    this.inSubmission = true;

    try {
      await this.authService.creatUser(this.registerForm.value);
      this.setAlertMessage('Success! your account has been created', 'green');
    } catch (e: any) {
      console.log(e);
      this.handleErrorMessage(e);
    }
    this.inSubmission = false;
  }
}
