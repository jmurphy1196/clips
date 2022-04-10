import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileInputElement') fileInputElement:
    | ElementRef<HTMLInputElement>
    | undefined;
  percentage = 0;
  showPercentage = true;
  alertMessage = '';
  alertColor = '';
  showAlert = false;
  isDragover = false;
  file: File | null = null;
  user: firebase.User | null = null;
  nextStep = false;
  inSubmission = false;
  task?: AngularFireUploadTask;
  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
  ]);

  uploadForm = new FormGroup({
    title: this.title,
  });

  setAlertMessage(msg: string, color: string, show = true) {
    this.alertMessage = msg;
    this.alertColor = color;
    this.showAlert = show;
  }

  constructor(
    private fireStorage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => {
      this.user = user;
    });
    this.ffmpegService.init();
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    if (this.fileInputElement) {
      this.fileInputElement.nativeElement.style.display = 'none';
    }
  }
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    await this.ffmpegService.getScreenshots(this.file);
    this.nextStep = true;
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    console.log(this.file);
  }
  async uploadFile() {
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    try {
      this.uploadForm.disable();
      this.setAlertMessage('Upload in progress...', 'blue');
      this.showPercentage = true;
      this.inSubmission = true;
      this.task = this.fireStorage.upload(clipPath, this.file);
      const clipRef = this.fireStorage.ref(clipPath);
      this.task.percentageChanges().subscribe({
        next: (progress) => {
          this.percentage = (progress as number) / 100;
        },
        complete: () => {
          this.setAlertMessage('Upload complete :D', 'green');
          this.showPercentage = false;
          this.inSubmission = false;
        },
        error: (err) => {
          this.setAlertMessage('Upload failed :(', 'red');
          console.log(err);
          this.inSubmission = false;
          this.showPercentage = false;

          this.uploadForm.enable();
        },
      });
      this.task
        .snapshotChanges()
        .pipe(
          last(),
          switchMap(() => clipRef.getDownloadURL())
        )
        .subscribe({
          next: async (url) => {
            const clip = {
              uid: this.user?.uid as string,
              displayName: this.user?.displayName as string,
              title: this.title.value,
              fileName: `${clipFileName}.mp4`,
              url,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            };
            const clipDocRef = await this.clipService.createClip(clip);
            setTimeout(() => {
              this.router.navigate(['clip', clipDocRef.id]);
            }, 1000);
            this.uploadForm.enable();
          },
        });
    } catch (e) {
      this.setAlertMessage('Upload failed :(', 'red');
      console.log(e);
      this.inSubmission = false;
      this.showPercentage = false;
      this.uploadForm.enable();
    }
  }
}
