import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorRecord } from '../../../core/models/admin.models';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div class="app-card-soft w-full max-w-md p-6 shadow-2xl">
        <p class="text-[11px] font-black uppercase tracking-[0.28em] text-rose-500">Delete Vendor</p>
        <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Remove this vendor profile?</h3>
        <p class="mt-3 text-sm font-medium leading-relaxed text-slate-500">
          Deleting <strong>{{ vendor?.shopName }}</strong> will remove vendor access from the linked user account.
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" (click)="cancel.emit()" class="btn-secondary !px-5 !py-3">Cancel</button>
          <button type="button" (click)="confirm.emit()" [disabled]="processing" class="btn-primary !bg-rose-600 hover:!bg-rose-700 !px-5 !py-3">
            {{ processing ? 'Deleting...' : 'Delete Vendor' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DeleteModalComponent {
  @Input() open = false;
  @Input() vendor: VendorRecord | null = null;
  @Input() processing = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
