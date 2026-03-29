import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationState {
  visible: boolean;
  title: string;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationSubject = new BehaviorSubject<NotificationState>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly notification$ = this.notificationSubject.asObservable();

  show(title: string, message: string, type: NotificationType = 'info'): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.notificationSubject.next({
      visible: true,
      title,
      message,
      type
    });

    this.hideTimer = setTimeout(() => {
      this.hide();
    }, 3000);
  }

  success(message: string, title = 'Success'): void {
    this.show(title, message, 'success');
  }

  error(message: string, title = 'Something went wrong'): void {
    this.show(title, message, 'error');
  }

  info(message: string, title = 'Notice'): void {
    this.show(title, message, 'info');
  }

  hide(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.notificationSubject.next({
      visible: false,
      title: '',
      message: '',
      type: 'info'
    });
  }
}
