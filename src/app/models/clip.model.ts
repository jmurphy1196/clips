import firebase from 'firebase/compat/app';
export default interface IClip {
  uid: string;
  displayName: string;
  title: string;
  fileName: string;
  url: string;
  screenshotURL: string;
  screenshotFilename: string;
  timestamp: firebase.firestore.FieldValue;
  docId?: string;
}
