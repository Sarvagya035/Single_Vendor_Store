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
      [class]="toastClasses()"
    >
      <div class="flex items-center gap-2 sm:items-center sm:gap-3">
        <div [class]="iconWrapClasses()" aria-hidden="true">
          <svg *ngIf="type === 'success'" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 10.5l3 3 7-7.5" />
          </svg>
          <svg *ngIf="type === 'error'" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 6l8 8M14 6l-8 8" />
          </svg>
          <svg *ngIf="type === 'warning'" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M10 6v5m0 3.5h.01M9.3 3.9 2.9 15a1.5 1.5 0 0 0 1.3 2.25h11.6A1.5 1.5 0 0 0 17.1 15L10.7 3.9a.8.8 0 0 0-1.4 0Z" />
          </svg>
          <svg *ngIf="type === 'info'" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M10 14v-4m0-3h.01M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
          </svg>
        </div>

        <p class="min-w-0 flex-1 whitespace-normal break-words !text-white text-[13px] leading-relaxed sm:text-sm sm:leading-6 lg:text-sm lg:leading-relaxed font-medium">
          {{ message }}
        </p>
      </div>
    </div>
  `
})
export class ToastBannerComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() type: ToastKind = 'success';

  toastClasses(): string {
    const tone =
      this.type === 'success'
        ? 'border-[#8b5e3c] bg-[#6B3F26] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]'
        : this.type === 'warning'
          ? 'border-[#f5e6d3] bg-[#d4a017] text-slate-900'
          : this.type === 'info'
            ? 'border-[#e7dac9] bg-[#f5e6d3] text-[#2f1b14]'
            : 'border-rose-200 bg-rose-600 text-white';

    return [
      'fixed bottom-5 left-4 right-4 z-[9999] w-[calc(100%-2rem)] max-w-none -translate-x-0 rounded-2xl border px-3 py-2.5 text-[13px] font-medium leading-relaxed tracking-wide shadow-[0_16px_36px_rgba(15,23,42,0.18)] transition-all',
      'pb-[calc(0.6rem+env(safe-area-inset-bottom))] sm:left-1/2 sm:right-auto sm:bottom-6 sm:w-[min(92vw,24rem)] sm:max-w-sm sm:-translate-x-1/2 sm:px-4 sm:py-3 sm:text-sm sm:leading-5 md:bottom-6 md:max-w-sm',
      'lg:left-auto lg:right-6 lg:top-[130px] lg:bottom-auto lg:w-auto lg:min-w-[280px] lg:max-w-[420px] lg:translate-x-0 lg:px-4 lg:py-3 lg:text-sm lg:leading-relaxed lg:shadow-[0_20px_45px_rgba(15,23,42,0.28)]',
      tone
    ].join(' ');
  }

  iconWrapClasses(): string {
    const base = 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full';

    if (this.type === 'success') {
      return `${base} bg-white/20 text-white`;
    }

    if (this.type === 'warning') {
      return `${base} bg-white/40 text-slate-900`;
    }

    if (this.type === 'info') {
      return `${base} bg-white/60 text-[#6f4e37]`;
    }

    return `${base} bg-white/15 text-white`;
  }
}
