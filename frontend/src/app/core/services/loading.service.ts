import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);

  readonly isLoading$ = this.pendingRequestsSubject.asObservable().pipe(
    map((count) => count > 0),
    distinctUntilChanged()
  );

  start(): void {
    this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
  }

  stop(): void {
    this.pendingRequestsSubject.next(Math.max(this.pendingRequestsSubject.value - 1, 0));
  }

  reset(): void {
    this.pendingRequestsSubject.next(0);
  }

  get value(): number {
    return this.pendingRequestsSubject.value;
  }
}
