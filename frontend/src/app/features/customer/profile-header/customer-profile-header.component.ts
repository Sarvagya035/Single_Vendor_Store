import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-profile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-10 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8">
      <div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div class="min-w-0">
          <p class="text-[11px] font-black uppercase tracking-[0.26em] text-amber-600">Account Center</p>
          <h1 class="mt-3 text-4xl font-extrabold leading-none tracking-tight text-slate-900">My Profile</h1>
          <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
            Review your account details, role access, and marketplace status from one organized place.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 lg:justify-end">
          <div class="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
            {{ isAdmin || isVendor ? 'Store Account' : 'Customer Account' }}
          </div>

          <a *ngIf="isAdmin || isVendor" routerLink="/vendor/dashboard" class="btn-secondary !py-3 border-amber-100 bg-amber-50/70 text-amber-800">
            Store Dashboard
          </a>
          <div *ngIf="vendorProfile?.verificationStatus === 'pending'" class="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs font-bold text-amber-700">
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
  @Output() logout = new EventEmitter<void>();
}

