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
        'fixed right-4 top-4 z-[220] w-[min(92vw,28rem)] rounded-2xl border px-5 py-4 text-sm font-bold leading-6 shadow-[0_24px_55px_rgba(15,23,42,0.24)] transition-all sm:right-6 sm:top-6 ' +
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
      <div class="flex items-start gap-3">
        <div
          class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-black uppercase tracking-[0.16em]"
          aria-hidden="true"
        >
          !
        </div>
        <div class="min-w-0">
          <p class="text-[11px] font-black uppercase tracking-[0.22em] opacity-80">
            {{ type }}
          </p>
          <p class="mt-1 font-semibold leading-6">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class ToastBannerComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() type: ToastKind = 'success';
}
