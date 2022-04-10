import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalIds, ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  showAlert = false;
  inSubmission = false;
  alertMessage = '';
  alertColor = 'blue';
  modalId = '';
  clipId = new FormControl('');
  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
  ]);
  editForm = new FormGroup({
    title: this.title,
    clipId: this.clipId,
  });
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  constructor(
    public modalService: ModalService,
    private clipService: ClipService
  ) {
    this.modalId = ModalIds.editClipModal;
  }
  setAlertMessage(msg: string, color: string, show = true) {
    this.alertMessage = msg;
    this.alertColor = color;
    this.showAlert = show;
  }

  ngOnDestroy(): void {
    this.modalService.removeModal(this.modalId);
  }

  ngOnInit(): void {
    this.modalService.register(this.modalId);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) return;
    this.clipId.setValue(this.activeClip.docId);
    this.title.setValue(this.activeClip.title);
    this.setAlertMessage('', 'blue', false);
  }
  async submit() {
    if (!this.activeClip) return;
    this.setAlertMessage('Please wait while your clip is updated!', 'blue');
    this.inSubmission = true;
    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value);
      this.setAlertMessage('Your clips has been updated!', 'green');
    } catch (err) {
      console.log(err);
      this.setAlertMessage('Oops! An error has occured', 'red');
    }
    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);
    this.inSubmission = false;
  }
}
