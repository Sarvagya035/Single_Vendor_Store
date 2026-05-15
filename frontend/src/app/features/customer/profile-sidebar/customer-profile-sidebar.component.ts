import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerUser, CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <article class="overflow-hidden rounded-2xl border border-[#ead8c2] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8f1_100%)] p-4 shadow-[0_14px_30px_rgba(47,27,20,0.06)] sm:p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3e7] text-[#a5642a] shadow-sm">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm-7.5 5.25a7.5 7.5 0 1 1 15 0" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7a5f]">Profile Actions</p>
            <h3 class="mt-1 text-[15px] font-semibold tracking-tight text-slate-900">Quick account controls</h3>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-3 border-t border-[#eee2d4] pt-4">
          <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-[18px] bg-[#7b5b4d] shadow-[0_8px_20px_rgba(111,78,55,0.1)] sm:h-14 sm:w-14">
            <img
              *ngIf="isValidUrl(user?.avatar)"
              [src]="user?.avatar"
              alt="Avatar"
              class="h-full w-full object-cover"
            >
            <div
              *ngIf="!isValidUrl(user?.avatar)"
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6f4e37] via-[#99695a] to-[#f1b38e] text-lg font-medium text-white"
            >
              {{ user?.username?.charAt(0)?.toUpperCase() || '?' }}
            </div>
          </div>

          <div class="min-w-0">
            <h4 class="truncate text-[1.05rem] font-semibold tracking-tight text-slate-900 sm:text-[1.15rem]">
              {{ user?.username || 'Customer' }}
            </h4>
            <p class="mt-1 inline-flex rounded-full bg-[#fff3e7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a5642a]">
              {{ roles }}
            </p>
            <p class="mt-1.5 text-sm text-slate-500">Member since {{ memberSince }}</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-2">
          <button type="button" class="btn-primary !h-10 !w-full !rounded-xl !px-4 !py-0 text-sm font-semibold" (click)="editProfile.emit()">
            Edit Profile
          </button>
          <button type="button" class="btn-secondary !h-10 !w-full !rounded-xl !px-4 !py-0 text-sm font-semibold" (click)="changePassword.emit()">
            Change Password
          </button>
        </div>
      </article>

      <article class="rounded-2xl border border-[#ead8c2] bg-white/95 p-4 shadow-[0_14px_30px_rgba(47,27,20,0.055)] sm:p-5">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7a5f]">Account Status</p>
            <h3 class="mt-1 text-[15px] font-semibold text-slate-900">Active and ready</h3>
          </div>
        </div>

        <p class="mt-3 text-sm leading-6 text-[#7a6556]">
          Your customer account is active and ready for orders, addresses, and profile updates.
        </p>

        <div class="mt-4 space-y-2.5 border-t border-[#eee2d4] pt-4 text-sm text-slate-900">
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

      <article class="rounded-2xl border border-[#ead8c2] bg-white/95 p-4 shadow-[0_14px_30px_rgba(47,27,20,0.055)] sm:p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m3 6V7m3 10v-3m4 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2Z" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7a5f]">Account Metrics</p>
            <h3 class="mt-1 text-[15px] font-semibold text-slate-900">Snapshot</h3>
          </div>
        </div>

        <div class="mt-4 grid gap-3">
          <div class="rounded-2xl border border-[#eee2d4] bg-[#fffaf4] px-4 py-3.5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Member Since</p>
            <p class="mt-1.5 text-[15px] text-slate-900">{{ memberSince }}</p>
          </div>
          <div class="rounded-2xl border border-[#eee2d4] bg-[#fffaf4] px-4 py-3.5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary Role</p>
            <p class="mt-1.5 text-[15px] text-slate-900">{{ roles }}</p>
          </div>
          <div class="rounded-2xl border border-[#eee2d4] bg-[#fffaf4] px-4 py-3.5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Store Link</p>
            <p class="mt-1.5 text-[15px]" [class.text-emerald-600]="hasStoreAccess" [class.text-slate-900]="!hasStoreAccess">
              {{ storeLinkLabel() }}
            </p>
          </div>
          <div *ngIf="hasStoreAccess && vendorProfile?.shopName" class="rounded-2xl border border-[#eee2d4] bg-[#fffaf4] px-4 py-3.5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Store Name</p>
            <p class="mt-1.5 text-[15px] text-slate-900">{{ vendorProfile?.shopName }}</p>
          </div>
        </div>
      </article>
    </div>
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

