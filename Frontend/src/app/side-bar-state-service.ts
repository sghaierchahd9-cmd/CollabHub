import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideBarStateService {
  isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  close() {
    this.isOpen.set(false);
  }
}
