import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorRecord } from '../../../core/models/admin.models';

@Component({
  selector: 'app-reject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div class="app-card-soft w-full max-w-md p-6 shadow-2xl">
        <p class="text-[11px] font-black uppercase tracking-[0.28em] text-rose-500">Reject Application</p>
        <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Add a rejection reason</h3>
        <p class="mt-3 text-sm font-medium leading-relaxed text-slate-500">
          Rejecting <strong>{{ vendor?.shopName }}</strong>. This note will be saved as the admin remark.
        </p>

        <textarea
          rows="4"
          [ngModel]="remarks"
          (ngModelChange)="remarksChange.emit($event)"
          placeholder="Explain why this vendor was rejected..."
          class="mt-5 block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-900 shadow-inner transition-all focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-100"
        ></textarea>

        <p *ngIf="error" class="mt-2 text-sm font-semibold text-rose-600">{{ error }}</p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" (click)="cancel.emit()" class="btn-secondary !px-5 !py-3">Cancel</button>
          <button type="button" (click)="confirm.emit()" [disabled]="processing" class="btn-primary !bg-rose-600 hover:!bg-rose-700 !px-5 !py-3">
            {{ processing ? 'Rejecting...' : 'Confirm Rejection' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class RejectModalComponent {
  @Input() open = false;
  @Input() vendor: VendorRecord | null = null;
  @Input() remarks = '';
  @Input() error = '';
  @Input() processing = false;
  @Output() remarksChange = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
