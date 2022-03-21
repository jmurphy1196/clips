import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  register(id: string) {
    this.modals.push({
      id,
      visible: false,
    });
  }
  removeModal(id: string) {
    const modalIndex = this.modals.findIndex((m) => m.id === id);
    if (modalIndex) {
      this.modals.splice(modalIndex, 1);
    }
  }

  isModalOpen(id: string): boolean {
    const modal = this.modals.find((m) => m.id === id);
    if (modal) {
      return modal.visible;
    }
    return false;
  }

  toggleModal(id: string) {
    const modal = this.modals.find((m) => m.id === id);
    if (modal) {
      modal.visible = !modal.visible;
    }
  }
}
