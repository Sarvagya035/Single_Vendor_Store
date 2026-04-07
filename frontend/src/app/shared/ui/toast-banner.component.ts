import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ToastKind } from '../../core/services/error.service';

@Component({
  selector: 'app-toast-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      [class]="
        'fixed right-6 top-16 z-[220] w-[min(92vw,28rem)] rounded-2xl border px-5 py-4 text-sm font-bold leading-6 shadow-[0_20px_45px_rgba(15,23,42,0.28)] transition-all ' +
        (type === 'success'
          ? 'border-emerald-200 bg-emerald-600 text-white'
          : type === 'warning'
            ? 'border-amber-200 bg-amber-500 text-white'
            : type === 'info'
              ? 'border-sky-200 bg-sky-600 text-white'
              : 'border-rose-200 bg-rose-600 text-white')
      "
      style="word-break: break-word;"
    >
      {{ message }}
    </div>
  `
})
export class ToastBannerComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() type: ToastKind = 'success';
}
