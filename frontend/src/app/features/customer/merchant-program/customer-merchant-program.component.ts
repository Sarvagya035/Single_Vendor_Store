import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-merchant-program',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="glass-card overflow-hidden border-t-4 border-t-amber-500">
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-6 sm:px-8">
        <h3 class="text-lg text-xs font-black uppercase tracking-widest text-slate-900">Merchant Program</h3>
        <span class="h-1.5 w-1.5 rounded-full" [ngClass]="vendorProfile ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'"></span>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <div *ngIf="!vendorProfile">
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-6 shadow-sm">
            <p class="text-sm leading-7 text-slate-600">
              Ready to grow your business? Register as a vendor to start listing your products on our marketplace.
            </p>
          </div>
          <p class="mb-6"></p>
          <a routerLink="/vendor/register" class="btn-primary !w-full !justify-center !py-3.5">Apply Now</a>
        </div>

        <div *ngIf="vendorProfile?.verificationStatus === 'pending'" class="rounded-[1.75rem] border border-amber-100 bg-amber-50/70 p-6">
          <div class="flex flex-col items-center gap-4 py-2 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">⏳</div>
            <div>
              <p class="font-bold text-slate-900">Application Under Review</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">Our administrators are currently reviewing your request for <strong>{{ vendorProfile?.shopName }}</strong>.</p>
            </div>
            <div class="w-full rounded-2xl border border-white/80 bg-white/70 p-4 text-left">
              <p class="text-[10px] font-black uppercase text-slate-400">Application ID</p>
              <p class="mt-2 break-all font-mono text-xs text-slate-600">{{ vendorProfile?._id }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="vendorProfile?.verificationStatus === 'rejected'" class="rounded-[1.75rem] border border-rose-100 bg-rose-50/70 p-6">
          <div class="flex flex-col items-center gap-4 py-2 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">✗</div>
            <div>
              <p class="font-bold text-rose-600">Application Declined</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">Unfortunately, your vendor application was not approved at this time.</p>
            </div>
            <a routerLink="/vendor/register" class="btn-secondary !w-full !justify-center !py-3.5 !text-slate-900">Update & Re-apply</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerMerchantProgramComponent {
  @Input() vendorProfile: CustomerVendorProfile | null = null;
}
