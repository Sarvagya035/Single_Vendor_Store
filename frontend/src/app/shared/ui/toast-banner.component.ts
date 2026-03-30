import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toast-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      [class]="
        'fixed bottom-6 right-6 z-[70] rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl transition-all ' +
        (type === 'success' ? 'bg-emerald-600' : 'bg-rose-600')
      "
    >
      {{ message }}
    </div>
  `
})
export class ToastBannerComponent {
  @Input() visible = false;
  @Input() message = '';
  @Input() type: 'success' | 'error' = 'success';
}
