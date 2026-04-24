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
        'fixed left-1/2 top-16 z-[220] w-[calc(100vw-1.5rem)] max-w-[28rem] -translate-x-1/2 rounded-2xl border px-5 py-4 text-sm font-bold leading-6 shadow-[0_20px_45px_rgba(15,23,42,0.28)] transition-all md:left-auto md:right-6 md:translate-x-0 md:w-[min(92vw,28rem)] ' +
        (type === 'success'
          ? 'border-[#8b5e3c] bg-[#6f4e37] text-white'
          : type === 'warning'
            ? 'border-[#f5e6d3] bg-[#d4a017] text-slate-900'
            : type === 'info'
              ? 'border-[#e7dac9] bg-[#f5e6d3] text-[#2f1b14]'
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
