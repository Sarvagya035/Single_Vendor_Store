import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-6">
      <div class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div class="relative">
            <img
              *ngIf="logoPreview || vendor.vendorLogo"
              [src]="logoPreview || vendor.vendorLogo"
              alt="Shop Logo"
              class="h-28 w-28 rounded-[1.6rem] border-4 border-white object-cover shadow-xl sm:h-32 sm:w-32"
            >
            <div
              *ngIf="!logoPreview && !vendor.vendorLogo"
              class="flex h-28 w-28 items-center justify-center rounded-[1.6rem] border-4 border-white bg-amber-700 text-4xl font-black text-white shadow-xl sm:h-32 sm:w-32 sm:text-5xl"
            >
              {{ vendor.shopName?.charAt(0) }}
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <p class="vendor-stat-label">Store Profile</p>
            <h2 class="vendor-panel-title">{{ vendor.shopName }}</h2>
            <div class="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-amber-800">
              {{ vendor.verificationStatus }}
            </div>
          </div>

          <p class="mt-4 text-sm font-medium leading-7 text-slate-500">
            Keep your storefront polished so your vendor identity stays aligned everywhere in the marketplace.
          </p>

          <div class="mt-6 flex w-full flex-col gap-3 sm:flex-row lg:flex-col">
            <button type="button" (click)="editDetails.emit()" class="btn-primary !w-full !justify-center !px-6 !py-3">
              {{ isEditDetailsOpen ? 'Close Details Editor' : 'Edit Details' }}
            </button>
            <button type="button" (click)="editBank.emit()" class="btn-secondary !w-full !justify-center !px-6 !py-3">
              {{ isEditBankOpen ? 'Close Bank Editor' : 'Edit Bank Details' }}
            </button>
            <button type="button" (click)="editLogo.emit()" class="btn-secondary !w-full !justify-center !px-6 !py-3">
              {{ isEditLogoOpen ? 'Close Logo Editor' : 'Change Logo' }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="vendor-stat-card !border-[#e7dac9] !bg-[#fff7ed]/80">
          <p class="vendor-stat-label !text-amber-700">GST</p>
          <p class="mt-3 break-words text-lg font-black text-slate-900">{{ vendor.gstNumber }}</p>
        </div>
        <div class="vendor-stat-card !border-[#e7dac9] !bg-[#fff7ed]/80">
          <p class="vendor-stat-label !text-amber-700">Address</p>
          <p class="mt-3 text-sm font-bold leading-relaxed text-slate-900">{{ vendor.vendorAddress }}</p>
        </div>
        <div class="vendor-stat-card !border-[#e7dac9] !bg-[#fff7ed]/80">
          <p class="vendor-stat-label !text-amber-700">Brand Summary</p>
          <p class="mt-3 text-sm font-bold leading-7 text-slate-900">{{ vendor.vendorDescription }}</p>
        </div>
        <div class="vendor-stat-card !border-[#e7dac9] !bg-[#fff7ed]/80">
          <p class="vendor-stat-label !text-amber-700">Banking</p>
          <div class="mt-3 space-y-2 text-sm font-bold text-slate-900">
            <p>{{ vendor.bankDetails?.bankName || 'Bank details missing' }}</p>
            <p class="text-slate-600">{{ maskedAccountNumber() }}</p>
            <p class="text-slate-500">{{ vendor.bankDetails?.ifscCode || 'Add IFSC code' }}</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class VendorProfileCardComponent {
  @Input({ required: true }) vendor!: VendorProfile;
  @Input() logoPreview: string | null = null;
  @Input() isEditDetailsOpen = false;
  @Input() isEditBankOpen = false;
  @Input() isEditLogoOpen = false;
  @Output() editDetails = new EventEmitter<void>();
  @Output() editBank = new EventEmitter<void>();
  @Output() editLogo = new EventEmitter<void>();

  maskedAccountNumber(): string {
    const accountNumber = String(this.vendor?.bankDetails?.accountNumber || '').trim();
    if (!accountNumber) {
      return 'Add payout account';
    }

    const lastDigits = accountNumber.slice(-4);
    return `Account ending ${lastDigits.padStart(4, '0')}`;
  }
}

