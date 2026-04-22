import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.95fr)] lg:p-6">
      <article class="overflow-hidden rounded-[1.75rem] border border-[#e7dac9] bg-white shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
        <div class="p-5 sm:p-6">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div class="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[1rem] bg-[#7b5b4d] sm:h-20 sm:w-20">
                <img
                  *ngIf="logoPreview || vendor.vendorLogo"
                  [src]="logoPreview || vendor.vendorLogo"
                  alt="Shop Logo"
                  class="h-full w-full object-cover"
                >
                <div
                  *ngIf="!logoPreview && !vendor.vendorLogo"
                  class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6f4e37] via-[#99695a] to-[#f1b38e] text-3xl font-black text-white"
                >
                  {{ vendor.shopName?.charAt(0) || 'S' }}
                </div>
              </div>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-[1.6rem] font-semibold tracking-tight text-slate-900">{{ vendor.shopName || 'Your store' }}</h2>
                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
                    </svg>
                    {{ vendorBadge() }}
                  </span>
                </div>

                <p class="mt-2 max-w-3xl text-sm leading-7 text-[#7a6556]">
                  {{ vendor.vendorDescription || 'Add a concise store description to tell customers what makes your brand special.' }}
                </p>

                <button
                  type="button"
                  (click)="editLogo.emit()"
                  class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f6f1ec] px-4 py-2 text-sm font-medium text-[#5f4638] transition hover:bg-[#eee6df]"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
                  </svg>
                  {{ isEditLogoOpen ? 'Close Logo Editor' : 'Change Logo' }}
                </button>
              </div>
            </div>

            <button
              type="button"
              (click)="editDetails.emit()"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7b5b4d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#694b3e]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 2.651 2.651M7.5 16.5 4 20l3.5-3.5m0 0L17.25 6.75a1.875 1.875 0 1 0-2.652-2.652L4.848 13.848A4.5 4.5 0 0 0 3.75 16.5v3.75h3.75A4.5 4.5 0 0 0 12 19.152Z" />
              </svg>
              {{ isEditDetailsOpen ? 'Close Details' : 'Edit Details' }}
            </button>
          </div>
        </div>

        <div class="border-t border-[#eee2d4] px-5 py-5 sm:px-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[#7b5b4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 12 3l9 4.5M4.5 10.5h15v9h-15zM8.25 10.5V21m7.5-10.5V21" />
              </svg>
              <h3 class="text-xl font-medium text-slate-900">Store Information</h3>
            </div>
          </div>

          <div class="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <p class="text-xs font-medium text-slate-500">Shop Name</p>
              <p class="mt-1 text-sm text-slate-900">{{ vendor.shopName || 'Not provided' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500">GST Number</p>
              <p class="mt-1 break-words text-sm text-slate-900">{{ vendor.gstNumber || 'Not added yet' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs font-medium text-slate-500">Address</p>
              <p class="mt-1 text-sm leading-7 text-slate-900">{{ vendor.vendorAddress || 'Add your business address.' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs font-medium text-slate-500">Description</p>
              <p class="mt-1 text-sm leading-7 text-slate-900">
                {{ vendor.vendorDescription || 'Add a fuller description so customers understand your products and sourcing.' }}
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-[#eee2d4] px-5 py-5 sm:px-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[#7b5b4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18" />
              </svg>
              <h3 class="text-xl font-medium text-slate-900">Banking Information</h3>
            </div>

            <button
              type="button"
              (click)="editBank.emit()"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7b5b4d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#694b3e]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 2.651 2.651M7.5 16.5 4 20l3.5-3.5m0 0L17.25 6.75a1.875 1.875 0 1 0-2.652-2.652L4.848 13.848A4.5 4.5 0 0 0 3.75 16.5v3.75h3.75A4.5 4.5 0 0 0 12 19.152Z" />
              </svg>
              {{ isEditBankOpen ? 'Close Bank Details' : 'Edit Bank Details' }}
            </button>
          </div>

          <div class="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <p class="text-xs font-medium text-slate-500">Account Holder</p>
              <p class="mt-1 text-sm text-slate-900">{{ vendor.bankDetails?.accountHolderName || 'Not added' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500">Account Number</p>
              <p class="mt-1 text-sm text-slate-900">{{ maskedAccountNumber() }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500">IFSC Code</p>
              <p class="mt-1 text-sm text-slate-900">{{ vendor.bankDetails?.ifscCode || 'Not added' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500">Bank Name</p>
              <p class="mt-1 text-sm text-slate-900">{{ vendor.bankDetails?.bankName || 'Not added' }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs font-medium text-slate-500">UPI ID</p>
              <p class="mt-1 text-sm text-slate-900">{{ vendor.bankDetails?.upiId || 'Not added' }}</p>
            </div>
          </div>
        </div>
      </article>

      <aside class="space-y-5">
        <article class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5 shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
            </svg>
          </div>

          <h3 class="mt-4 text-xl font-medium text-slate-900">Verification Status</h3>
          <p class="mt-2 text-sm leading-7 text-[#7a6556]">
            Your vendor profile is {{ vendorBadge().toLowerCase() }} and active.
          </p>

          <div class="mt-4 space-y-3">
            <div *ngFor="let item of verificationChecks" class="flex items-center gap-3 text-sm text-slate-900">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42-.003L3.295 9.15a1 1 0 0 1 1.41-1.42l4.085 4.052 6.494-6.486a1 1 0 0 1 1.42-.006Z" clip-rule="evenodd" />
                </svg>
              </span>
              {{ item.label }}
            </div>
          </div>
        </article>

        <article class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5 shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m3 6V7m3 10v-3m4 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2Z" />
            </svg>
          </div>

          <h3 class="mt-4 text-xl font-medium text-slate-900">Business Metrics</h3>

          <div class="mt-4 space-y-4">
            <div>
              <p class="text-xs font-medium text-slate-500">Member Since</p>
              <p class="mt-1 text-sm text-slate-900">{{ memberSince() }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500">Total Products</p>
              <p class="mt-1 text-sm text-slate-900">{{ isMetricsLoading ? 'Loading...' : totalProducts + ' Products' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500">Total Revenue</p>
              <p class="mt-1 text-sm font-medium text-emerald-600">{{ isMetricsLoading ? 'Loading...' : formatCurrency(totalRevenue) }}</p>
            </div>
          </div>
        </article>
      </aside>
    </section>
  `
})
export class VendorProfileCardComponent {
  @Input({ required: true }) vendor!: VendorProfile;
  @Input() logoPreview: string | null = null;
  @Input() totalProducts = 0;
  @Input() totalRevenue = 0;
  @Input() isMetricsLoading = false;
  @Input() isEditDetailsOpen = false;
  @Input() isEditBankOpen = false;
  @Input() isEditLogoOpen = false;
  @Output() editDetails = new EventEmitter<void>();
  @Output() editBank = new EventEmitter<void>();
  @Output() editLogo = new EventEmitter<void>();

  readonly verificationChecks = [
    { label: 'Email Verified', complete: true },
    { label: 'GST Verified', complete: true },
    { label: 'Bank Account Verified', complete: true }
  ];

  maskedAccountNumber(): string {
    const accountNumber = String(this.vendor?.bankDetails?.accountNumber || '').trim();
    if (!accountNumber) {
      return 'Not added';
    }

    const lastDigits = accountNumber.slice(-4);
    return `****${lastDigits.padStart(4, '0')}`;
  }

  vendorBadge(): string {
    const status = String(this.vendor?.verificationStatus || '').trim();
    return status ? this.toTitleCase(status) : 'Verified';
  }

  memberSince(): string {
    if (!this.vendor?.createdAt) {
      return 'Recently joined';
    }

    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(this.vendor.createdAt));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  private toTitleCase(value: string): string {
    return value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
}
