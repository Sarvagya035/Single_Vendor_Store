import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorRecord } from '../../../core/models/admin.models';

@Component({
  selector: 'app-vendor-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open && vendor" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div class="app-card max-h-[90vh] w-full max-w-5xl overflow-hidden shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-8 py-6">
          <div class="min-w-0">
            <h3 class="mt-2 truncate text-3xl font-black tracking-tight text-slate-900">{{ vendor.shopName || 'Vendor Application' }}</h3>
          </div>

          <button type="button" (click)="close.emit()" class="btn-secondary !px-4 !py-2 text-xs">
            Close
          </button>
        </div>

        <div class="max-h-[calc(90vh-96px)] overflow-y-auto px-8 py-7">
          <div class="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside class="space-y-5">
              <div class="app-card-soft p-6">
                <div class="flex flex-col items-center text-center">
                  <img
                    *ngIf="vendor.vendorLogo"
                    [src]="vendor.vendorLogo"
                    alt="Vendor logo"
                    class="h-28 w-28 rounded-[1.75rem] border-4 border-white object-cover shadow-xl"
                  >
                  <div
                    *ngIf="!vendor.vendorLogo"
                    class="flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-indigo-600 text-4xl font-black text-white shadow-xl shadow-indigo-100"
                  >
                    {{ vendor.shopName?.charAt(0)?.toUpperCase() || 'V' }}
                  </div>

                  <h4 class="mt-5 text-2xl font-black tracking-tight text-slate-900">{{ vendor.shopName || 'Unnamed Store' }}</h4>
                  <span class="mt-3 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em]"
                    [ngClass]="showDecisionActions ? 'bg-amber-100 text-amber-700' : vendor.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'">
                    {{ vendor.verificationStatus || 'pending' }}
                  </span>
                </div>
              </div>

              <div class="app-card-soft p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Applied On</p>
                <p class="mt-3 text-sm font-bold text-slate-900">{{ vendor.createdAt | date:'medium' }}</p>
              </div>

              <div *ngIf="vendor.adminRemarks" class="app-card-soft border-rose-100 bg-rose-50/80 p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Previous Remarks</p>
                <p class="mt-3 text-sm font-semibold leading-relaxed text-rose-700">{{ vendor.adminRemarks }}</p>
              </div>
            </aside>

            <section class="space-y-6">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="app-card-soft p-5">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">GST Number</p>
                  <p class="mt-3 break-words text-base font-black text-slate-900">{{ vendor.gstNumber || 'N/A' }}</p>
                </div>

                <div class="app-card-soft p-5">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Store Address</p>
                  <p class="mt-3 text-sm font-bold leading-relaxed text-slate-900">{{ vendor.vendorAddress || 'N/A' }}</p>
                </div>
              </div>

              <div class="app-card-soft p-6">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Store Description</p>
                <p class="mt-4 text-sm font-semibold leading-7 text-slate-700">
                  {{ vendor.vendorDescription || 'No description submitted.' }}
                </p>
              </div>

              <div class="app-card-soft p-6">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bank Details</p>
                    <p class="mt-2 text-sm font-medium text-slate-500">Review the payout details submitted by the applicant.</p>
                  </div>
                </div>

                <div class="mt-5 grid gap-4 md:grid-cols-2">
                  <div class="app-card-soft p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Holder</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ vendor.bankDetails?.accountHolderName || 'N/A' }}</p>
                  </div>

                  <div class="app-card-soft p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Number</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ vendor.bankDetails?.accountNumber || 'N/A' }}</p>
                  </div>

                  <div class="app-card-soft p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">IFSC Code</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ vendor.bankDetails?.ifscCode || 'N/A' }}</p>
                  </div>

                  <div class="app-card-soft p-4">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bank Name</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ vendor.bankDetails?.bankName || 'N/A' }}</p>
                  </div>

                  <div class="app-card-soft p-4 md:col-span-2">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">UPI ID</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ vendor.bankDetails?.upiId || 'Not provided' }}</p>
                  </div>
                </div>
              </div>

              <div *ngIf="error" class="app-card-soft border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {{ error }}
              </div>

              <div *ngIf="showDecisionActions" class="app-card-soft p-6">
                <div class="flex flex-col gap-5">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admin Decision</p>
                    <p class="mt-2 text-sm font-medium text-slate-500">
                      Approve after confirming the submitted business and bank information, or reject with remarks.
                    </p>
                  </div>

                  <div class="space-y-2">
                    <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Rejection Remarks</label>
                    <textarea
                      rows="4"
                      [ngModel]="remarks"
                      (ngModelChange)="remarksChange.emit($event)"
                      class="block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white"
                      placeholder="Required only if you reject the application"
                    ></textarea>
                  </div>

                  <div class="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      class="btn-primary !w-full !justify-center"
                      [disabled]="processing"
                      (click)="approve.emit(vendor)"
                    >
                      {{ processing ? 'Processing...' : 'Approve Vendor' }}
                    </button>
                    <button
                      type="button"
                      class="btn-secondary !w-full !justify-center !border-rose-100 !text-rose-600 hover:!bg-rose-50"
                      [disabled]="processing"
                      (click)="reject.emit(vendor)"
                    >
                      {{ processing ? 'Processing...' : 'Reject Vendor' }}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorReviewModalComponent {
  @Input() open = false;
  @Input() vendor: VendorRecord | null = null;
  @Input() remarks = '';
  @Input() error = '';
  @Input() processing = false;
  @Input() showDecisionActions = true;
  @Output() close = new EventEmitter<void>();
  @Output() remarksChange = new EventEmitter<string>();
  @Output() approve = new EventEmitter<VendorRecord>();
  @Output() reject = new EventEmitter<VendorRecord>();
}
