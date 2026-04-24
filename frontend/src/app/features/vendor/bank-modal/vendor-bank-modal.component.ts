import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorBankDetailsForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-bank-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#2f1b14]/45 px-4 py-4 sm:items-center">
      <div class="glass-card my-auto w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto p-5 shadow-2xl sm:p-8">
        <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="vendor-stat-label !text-amber-700">Bank Details</p>
            <h3 class="vendor-panel-title">Update Payout Information</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary w-full !px-4 !py-2 text-xs sm:w-auto">
            Close
          </button>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="submit.emit()">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2 md:col-span-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                [ngModel]="form.accountHolderName"
                (ngModelChange)="updateField('accountHolderName', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Name as registered with the bank"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                [ngModel]="form.accountNumber"
                (ngModelChange)="updateField('accountNumber', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Primary payout account"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                [ngModel]="form.ifscCode"
                (ngModelChange)="updateField('ifscCode', normalizeIfsc($event))"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold uppercase text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="e.g. SBIN0000123"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bank Name</label>
              <input
                type="text"
                name="bankName"
                [ngModel]="form.bankName"
                (ngModelChange)="updateField('bankName', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Bank issuing payouts"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">UPI ID</label>
              <input
                type="text"
                name="upiId"
                [ngModel]="form.upiId"
                (ngModelChange)="updateField('upiId', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Optional"
              >
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" [disabled]="isSaving" class="btn-primary !px-8 !py-4">
              {{ isSaving ? 'Saving Bank Details...' : 'Update Bank Details' }}
            </button>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Primary payout fields are required
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VendorBankModalComponent {
  @Input() open = false;
  @Input({ required: true }) form!: VendorBankDetailsForm;
  @Input() isSaving = false;
  @Output() formChange = new EventEmitter<VendorBankDetailsForm>();
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  updateField(field: keyof VendorBankDetailsForm, value: string) {
    this.formChange.emit({ ...this.form, [field]: value });
  }

  normalizeIfsc(value: string): string {
    return String(value || '').toUpperCase();
  }
}

