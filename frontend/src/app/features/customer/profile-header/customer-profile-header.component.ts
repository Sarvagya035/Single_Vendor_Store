import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-profile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="border-b border-[#eee2d4] bg-[linear-gradient(180deg,#fffaf5_0%,#fffdf9_100%)] px-4 py-5 sm:px-5 lg:px-6">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div class="min-w-0">
          <p class="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-700">Profile Overview</p>
          <h2 class="mt-2 text-[1.65rem] font-medium tracking-tight text-slate-900">Your account at a glance</h2>
          <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Review your details, security settings, and connected store access from one organized place.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 lg:justify-end">
          <div class="inline-flex items-center rounded-full border border-[#eadfce] bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-600 shadow-sm">
            {{ isAdmin || isVendor ? 'Store Account' : 'Customer Account' }}
          </div>

          <a *ngIf="isAdmin || isVendor" routerLink="/vendor/dashboard" class="btn-secondary !py-3 border-amber-100 bg-[#fff7ed]/70 text-amber-800">
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

