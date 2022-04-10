import { ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static match(
    control1: AbstractControl,
    control2: AbstractControl
  ): ValidatorFn {
    return function (): ValidationErrors | null {
      const error =
        control1.value === control2.value ? null : { doesNotMatch: true };
      control2.setErrors(error);

      return error;
    };
  }
}
