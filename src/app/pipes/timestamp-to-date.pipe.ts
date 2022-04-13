import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'timestampToDate',
})
export class TimestampToDatePipe implements PipeTransform {
  transform(value: firebase.firestore.FieldValue): Date {
    //@ts-ignore
    const date = new Date(value.seconds * 1000);
    return date;
  }
}
