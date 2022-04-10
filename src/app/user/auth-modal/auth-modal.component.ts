import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalIds, ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
})
export class AuthModalComponent implements OnInit, OnDestroy {
  modalId = '';
  constructor(public modal: ModalService) {
    this.modalId = ModalIds.authModal;
  }

  ngOnInit(): void {
    this.modal.register(this.modalId);
  }
  ngOnDestroy(): void {
    this.modal.removeModal(this.modalId);
  }
}
