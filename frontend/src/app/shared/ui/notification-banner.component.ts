import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="notification$ | async as notification">
      <div
        *ngIf="notification.visible"
        [class]="bannerClasses(notification.type)"
        role="status"
        aria-live="polite"
      >
      <div class="flex items-start gap-3">
        <div [class]="iconWrapClasses(notification.type)">
          <span class="text-base font-black">{{ iconFor(notification.type) }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-black text-slate-900">{{ notification.title }}</p>
          <p class="mt-1 text-sm font-medium leading-relaxed text-slate-600">{{ notification.message }}</p>
        </div>

        <button
          type="button"
          class="ml-2 rounded-full px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          (click)="dismiss()"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
      </div>
    </ng-container>
  `
})
export class NotificationBannerComponent {
  notification$;

  constructor(private notificationService: NotificationService) {
    this.notification$ = this.notificationService.notification$;
  }

  dismiss(): void {
    this.notificationService.hide();
  }

  bannerClasses(type: 'success' | 'error' | 'info'): string {
    const base = 'fixed bottom-6 right-6 z-[80] w-[min(92vw,420px)] rounded-[1.75rem] border p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur';
    const variant = {
      success: 'border-emerald-200 bg-emerald-50/95',
      error: 'border-rose-200 bg-rose-50/95',
      info: 'border-sky-200 bg-sky-50/95'
    }[type];
    return `${base} ${variant}`;
  }

  iconWrapClasses(type: 'success' | 'error' | 'info'): string {
    const variant = {
      success: 'flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white',
      error: 'flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white',
      info: 'flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white'
    }[type];
    return variant;
  }

  iconFor(type: 'success' | 'error' | 'info'): string {
    return {
      success: '✓',
      error: '!',
      info: 'i'
    }[type];
  }
}
