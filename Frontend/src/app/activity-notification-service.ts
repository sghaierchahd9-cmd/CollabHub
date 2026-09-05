import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityNotificationService {
   private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  notifierActivite() {
    this.refreshSubject.next();
  }
}
