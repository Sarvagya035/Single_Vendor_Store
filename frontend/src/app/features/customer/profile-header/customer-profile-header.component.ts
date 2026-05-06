import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-profile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="store-section p-4 sm:p-5 lg:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0">
          <p class="app-page-eyebrow text-amber-700">Profile Overview</p>
          <h2 class="app-page-title !mt-2 !text-[1.7rem] sm:!text-[1.9rem]">Your account at a glance</h2>
          <p class="app-page-description">
            Review your details, security settings, and connected store access from one organized place.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 lg:justify-end">
          <div class="inline-flex items-center rounded-full border border-[#eadfce] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-600 shadow-sm">
            {{ isAdmin || isVendor ? 'Store Account' : 'Customer Account' }}
          </div>

          <a *ngIf="isAdmin || isVendor" routerLink="/vendor/dashboard" class="btn-secondary border-amber-100 bg-[#fff7ed]/70 text-amber-800">
            Store Dashboard
          </a>
          <div *ngIf="vendorProfile?.verificationStatus === 'pending'" class="flex items-center gap-2 rounded-xl border border-amber-100 bg-[#fff7ed]/70 px-4 py-3 text-xs font-medium text-amber-700">
            Review Pending
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerProfileHeaderComponent {
  @Input() isAdmin = false;
  @Input() isVendor = false;
  @Input() vendorProfile: CustomerVendorProfile | null = null;
}

