import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorRecord, VendorTab } from '../../../core/models/admin.models';

@Component({
  selector: 'app-vendor-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-card overflow-hidden">
      <div class="grid gap-6 p-7 xl:grid-cols-[minmax(0,1fr)_210px]">
        <button
          type="button"
          class="grid gap-6 text-left transition md:grid-cols-[96px_minmax(0,1fr)] md:items-start"
          [ngClass]="mode === 'pending' ? 'rounded-[1.75rem] hover:bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-indigo-200' : 'rounded-[1.75rem] hover:bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-200'"
          (click)="review.emit(vendor)"
        >
          <div class="relative shrink-0">
            <img
              *ngIf="vendor.vendorLogo"
              [src]="vendor.vendorLogo"
              alt="Vendor logo"
              class="h-24 w-24 rounded-[1.5rem] border-4 border-white object-cover shadow-xl"
            >
            <div
              *ngIf="!vendor.vendorLogo"
              class="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border-4 border-white text-4xl font-black text-white shadow-xl"
              [ngClass]="avatarClass"
            >
              {{ vendor.shopName?.charAt(0)?.toUpperCase() || 'V' }}
            </div>
            <div *ngIf="mode === 'pending'" class="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-100 bg-white text-base shadow-sm">
              🏢
            </div>
          </div>

          <div class="min-w-0 space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <h3 class="text-2xl font-black tracking-tight text-slate-900">{{ vendor.shopName }}</h3>
              <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]" [ngClass]="badgeClass">
                {{ badgeText }}
              </span>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">GST Number</p>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ vendor.gstNumber || 'N/A' }}</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Address</p>
                <p class="mt-2 text-sm font-bold leading-relaxed text-slate-900">{{ vendor.vendorAddress || 'N/A' }}</p>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{{ dateLabel }}</p>
                <p class="mt-2 text-sm font-bold text-slate-900">{{ vendor.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>

            <div *ngIf="mode === 'vendors' && vendorTab === 'rejected' && vendor.adminRemarks" class="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Admin Remarks</p>
              <p class="mt-2 text-sm font-semibold leading-relaxed text-rose-700">{{ vendor.adminRemarks }}</p>
            </div>
          </div>
        </button>

        <div class="flex flex-col justify-center gap-3 border-t border-slate-100 pt-6 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0">
          <ng-container *ngIf="mode === 'pending'; else deleteAction">
            <button type="button" (click)="review.emit(vendor)" [disabled]="vendor._processing" class="btn-primary !w-full">
              Review Application
            </button>
            <button
              type="button"
              (click)="reject.emit(vendor)"
              [disabled]="vendor._processing"
              class="btn-secondary !w-full !border-rose-100 !text-rose-600 hover:!bg-rose-50"
            >
              Reject Vendor
            </button>
          </ng-container>

          <ng-template #deleteAction>
            <button type="button" (click)="review.emit(vendor)" [disabled]="vendor._processing" class="btn-secondary !w-full">
              View Details
            </button>
            <button
              type="button"
              (click)="delete.emit(vendor)"
              [disabled]="vendor._processing"
              class="btn-secondary !w-full !border-rose-100 !text-rose-600 hover:!bg-rose-50"
            >
              {{ vendor._processing ? 'Removing...' : 'Delete Vendor' }}
            </button>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class VendorCardComponent {
  @Input({ required: true }) vendor!: VendorRecord;
  @Input({ required: true }) mode!: 'pending' | 'vendors';
  @Input() vendorTab: VendorTab = 'active';
  @Output() review = new EventEmitter<VendorRecord>();
  @Output() approve = new EventEmitter<VendorRecord>();
  @Output() reject = new EventEmitter<VendorRecord>();
  @Output() delete = new EventEmitter<VendorRecord>();

  get badgeText(): string {
    if (this.mode === 'pending') {
      return 'In Review';
    }

    return this.vendorTab === 'active' ? 'Approved' : 'Rejected';
  }

  get badgeClass(): string {
    if (this.mode === 'pending') {
      return 'bg-amber-100 text-amber-700';
    }

    return this.vendorTab === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
  }

  get avatarClass(): string {
    if (this.mode === 'pending') {
      return 'bg-indigo-600 shadow-indigo-100';
    }

    return this.vendorTab === 'active' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100';
  }

  get dateLabel(): string {
    return this.mode === 'pending' ? 'Applied On' : 'Created';
  }
}
