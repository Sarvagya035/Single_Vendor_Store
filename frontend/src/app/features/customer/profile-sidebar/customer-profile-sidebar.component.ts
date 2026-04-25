import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerUser, CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="rounded-[1.5rem] border border-[#e7dac9] bg-white app-card-tight shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
      <div class="flex items-center gap-4">
        <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#7b5b4d] sm:h-[4.75rem] sm:w-[4.75rem]">
          <img
            *ngIf="isValidUrl(user?.avatar)"
            [src]="user?.avatar"
            alt="Avatar"
            class="h-full w-full object-cover"
          >
          <div
            *ngIf="!isValidUrl(user?.avatar)"
            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6f4e37] via-[#99695a] to-[#f1b38e] text-2xl font-medium text-white"
          >
            {{ user?.username?.charAt(0)?.toUpperCase() || '?' }}
          </div>
        </div>

        <div class="min-w-0">
          <h3 class="truncate text-[1.2rem] font-medium tracking-tight text-slate-900 sm:text-[1.45rem]">{{ user?.username || 'Customer' }}</h3>
          <p class="mt-1 text-[11px] uppercase tracking-[0.22em] text-amber-700">{{ roles }}</p>
          <p class="mt-2 text-sm text-slate-500">Member since {{ memberSince }}</p>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <button type="button" class="btn-primary !w-full !justify-center !rounded-[1rem] !py-3.5" (click)="editProfile.emit()">
          Edit Profile
        </button>
        <button type="button" class="btn-secondary !w-full !justify-center !rounded-[1rem] !py-3.5" (click)="changePassword.emit()">
          Change Password
        </button>
      </div>
    </article>

    <article class="rounded-[1.5rem] border border-[#e7dac9] bg-white app-card-tight shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
        </svg>
      </div>

      <h3 class="mt-4 text-base font-medium text-slate-900 sm:text-lg">Account Status</h3>
      <p class="mt-2 text-sm leading-7 text-[#7a6556]">
        Your customer account is active and ready for orders, addresses, and profile updates.
      </p>

      <div class="mt-4 space-y-3 text-sm text-slate-900">
        <div class="flex items-center gap-3">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42-.003L3.295 9.15a1 1 0 1 1 1.41-1.42l4.085 4.052 6.494-6.486a1 1 0 0 1 1.42-.006Z" clip-rule="evenodd" />
            </svg>
          </span>
          Profile details available
        </div>
        <div class="flex items-center gap-3">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42-.003L3.295 9.15a1 1 0 1 1 1.41-1.42l4.085 4.052 6.494-6.486a1 1 0 0 1 1.42-.006Z" clip-rule="evenodd" />
            </svg>
          </span>
          Password controls enabled
        </div>
        <div class="flex items-center gap-3" *ngIf="hasStoreAccess">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42-.003L3.295 9.15a1 1 0 1 1 1.41-1.42l4.085 4.052 6.494-6.486a1 1 0 0 1 1.42-.006Z" clip-rule="evenodd" />
            </svg>
          </span>
          Store access linked
        </div>
      </div>
    </article>

    <article class="rounded-[1.5rem] border border-[#e7dac9] bg-white app-card-tight shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 sm:h-11 sm:w-11">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m3 6V7m3 10v-3m4 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2Z" />
        </svg>
      </div>

      <h3 class="mt-4 text-base font-medium text-slate-900 sm:text-lg">Account Metrics</h3>

      <div class="mt-4 space-y-4">
        <div>
          <p class="text-xs font-medium text-slate-500">Member Since</p>
          <p class="mt-1 text-sm text-slate-900">{{ memberSince }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-slate-500">Primary Role</p>
          <p class="mt-1 text-sm text-slate-900">{{ roles }}</p>
        </div>
        <div>
          <p class="text-xs font-medium text-slate-500">Store Link</p>
          <p class="mt-1 text-sm" [class.text-emerald-600]="hasStoreAccess" [class.text-slate-900]="!hasStoreAccess">
            {{ storeLinkLabel() }}
          </p>
        </div>
        <div *ngIf="hasStoreAccess && vendorProfile?.shopName">
          <p class="text-xs font-medium text-slate-500">Store Name</p>
          <p class="mt-1 text-sm text-slate-900">{{ vendorProfile?.shopName }}</p>
        </div>
      </div>
    </article>
  `
})
export class CustomerProfileSidebarComponent {
  @Input() user: CustomerUser | null = null;
  @Input() roles = 'customer';
  @Input() memberSince = 'Recently joined';
  @Input() hasStoreAccess = false;
  @Input() vendorProfile: CustomerVendorProfile | null = null;
  @Output() editProfile = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();

  isValidUrl(url: string | undefined | null): boolean {
    return typeof url === 'string' && url.startsWith('http');
  }

  storeLinkLabel(): string {
    if (!this.hasStoreAccess) {
      return 'Customer only';
    }

    if (String(this.vendorProfile?.verificationStatus || '').toLowerCase() === 'pending') {
      return 'Pending verification';
    }

    return 'Connected';
  }
}

