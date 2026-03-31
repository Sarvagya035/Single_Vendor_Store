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
        'fixed bottom-6 right-6 z-[90] max-w-sm rounded-2xl border px-5 py-4 text-sm font-bold shadow-2xl transition-all ' +
        (type === 'success'
          ? 'border-emerald-200 bg-emerald-600 text-white'
          : type === 'warning'
            ? 'border-amber-200 bg-amber-500 text-white'
            : type === 'info'
              ? 'border-sky-200 bg-sky-600 text-white'
              : 'border-rose-200 bg-rose-600 text-white')
      "
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
