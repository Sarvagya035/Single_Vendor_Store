import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="glass-card overflow-hidden">
      <div class="grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:items-start">
        <div class="rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div class="flex flex-col items-center text-center xl:items-start xl:text-left">
            <div class="relative">
              <img
                *ngIf="logoPreview || vendor.vendorLogo"
                [src]="logoPreview || vendor.vendorLogo"
                alt="Shop Logo"
                class="h-32 w-32 rounded-[1.75rem] border-4 border-white object-cover shadow-2xl sm:h-36 sm:w-36"
              >
              <div
                *ngIf="!logoPreview && !vendor.vendorLogo"
                class="flex h-32 w-32 items-center justify-center rounded-[1.75rem] border-4 border-white bg-emerald-600 text-5xl font-black text-white shadow-2xl shadow-emerald-200 sm:h-36 sm:w-36 sm:text-6xl"
              >
                {{ vendor.shopName?.charAt(0) }}
              </div>
              <div class="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-2xl shadow-lg">
                🛍️
              </div>
            </div>

            <div class="mt-6 w-full space-y-3">
              <div class="space-y-3">
                <h2 class="text-3xl font-black tracking-tight text-slate-900">{{ vendor.shopName }}</h2>
                <div class="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">
                  {{ vendor.verificationStatus }}
                </div>
              </div>

              <p class="text-sm font-medium leading-7 text-slate-500">
                Keep your storefront polished so your vendor identity stays aligned everywhere in the marketplace.
              </p>
            </div>

            <div class="mt-6 grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button type="button" (click)="editDetails.emit()" class="btn-primary !w-full !justify-center !px-6 !py-3">
                {{ isEditDetailsOpen ? 'Close Details Editor' : 'Edit Details' }}
              </button>
              <button type="button" (click)="editBank.emit()" class="btn-secondary !w-full !justify-center !px-6 !py-3">
                {{ isEditBankOpen ? 'Close Bank Editor' : 'Edit Bank Details' }}
              </button>
              <button type="button" (click)="editLogo.emit()" class="btn-secondary !w-full !justify-center !px-6 !py-3 sm:col-span-2 xl:col-span-1">
                {{ isEditLogoOpen ? 'Close Logo Editor' : 'Change Logo' }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">GST</p>
            <p class="mt-3 break-words text-lg font-black text-slate-900">{{ vendor.gstNumber }}</p>
          </div>
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Address</p>
            <p class="mt-3 text-sm font-bold leading-relaxed text-slate-900">{{ vendor.vendorAddress }}</p>
          </div>
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Brand Summary</p>
            <p class="mt-3 text-sm font-bold leading-7 text-slate-900">{{ vendor.vendorDescription }}</p>
          </div>
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Banking</p>
            <div class="mt-3 space-y-2 text-sm font-bold text-slate-900">
              <p>{{ vendor.bankDetails?.bankName || 'Bank details missing' }}</p>
              <p class="text-slate-600">{{ maskedAccountNumber() }}</p>
              <p class="text-slate-500">{{ vendor.bankDetails?.ifscCode || 'Add IFSC code' }}</p>
            </div>
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
