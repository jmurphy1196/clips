import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ModalIds, ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  activeLinkClass = 'text-indigo-400';
  routerLinkOptions = { exact: true };
  constructor(public modal: ModalService, public authService: AuthService) {}

  ngOnInit(): void {}
  openModal($event: Event) {
    $event.preventDefault();
    this.modal.toggleModal(ModalIds.authModal);
  }
}
