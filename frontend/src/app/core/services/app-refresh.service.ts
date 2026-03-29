import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type RefreshScope = 'global' | 'auth' | 'admin' | 'storeOwner' | 'customer';

@Injectable({
  providedIn: 'root'
})
export class AppRefreshService {
  private readonly refreshSubject = new Subject<RefreshScope>();
  readonly refresh$ = this.refreshSubject.asObservable();

  notify(scope: RefreshScope = 'global'): void {
    this.refreshSubject.next(scope);
  }
}
