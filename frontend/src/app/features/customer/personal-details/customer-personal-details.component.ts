import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomerUser } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-personal-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="overflow-hidden rounded-[28px] border border-[#ead8c2] bg-white/95 shadow-[0_16px_38px_rgba(47,27,20,0.07)]">
      <div class="bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,244,0.96)_100%)] p-4 sm:p-5 lg:p-6">
        <div class="flex flex-col gap-4 border-b border-[#eee2d4] pb-4 sm:flex-row sm:items-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(180deg,#f7efe6_0%,#eee0d0_100%)] text-xl font-semibold text-[#7b5b4d] shadow-[0_8px_18px_rgba(111,78,55,0.08)] sm:h-16 sm:w-16 sm:text-[1.6rem]">
            {{ user?.username?.charAt(0)?.toUpperCase() || 'C' }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2 class="truncate text-[1.3rem] font-semibold tracking-tight text-slate-900 sm:text-[1.55rem]">
                {{ user?.username || 'Customer account' }}
              </h2>
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
                </svg>
                Active
              </span>
            </div>

            <p class="mt-2 max-w-2xl text-sm leading-6 text-[#7a6556] sm:text-[15px]">
              Keep your profile accurate so orders, delivery updates, and account recovery stay seamless.
            </p>
          </div>
        </div>

        <div class="mt-5 space-y-5">
          <section>
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[#7b5b4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0" />
              </svg>
              <h3 class="text-base font-semibold text-slate-900 sm:text-lg">Personal Information</h3>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <article class="rounded-2xl border border-[#ead8c2] bg-[#fffaf4] px-4 py-3.5 shadow-[0_6px_16px_rgba(47,27,20,0.035)]">
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Full Name</p>
                <p class="mt-1.5 break-words text-[15px] text-slate-900">{{ user?.username || user?.fullName || 'Undisclosed' }}</p>
              </article>
              <article class="rounded-2xl border border-[#ead8c2] bg-[#fffaf4] px-4 py-3.5 shadow-[0_6px_16px_rgba(47,27,20,0.035)]">
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary Role</p>
                <p class="mt-1.5 break-words text-[15px] text-slate-900">{{ roles }}</p>
              </article>
              <article class="rounded-2xl border border-[#ead8c2] bg-[#fffaf4] px-4 py-3.5 shadow-[0_6px_16px_rgba(47,27,20,0.035)]">
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Email Address</p>
                <p class="mt-1.5 break-all text-[15px] text-slate-900">{{ user?.email || 'No email linked' }}</p>
              </article>
              <article class="rounded-2xl border border-[#ead8c2] bg-[#fffaf4] px-4 py-3.5 shadow-[0_6px_16px_rgba(47,27,20,0.035)]">
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Phone Number</p>
                <p class="mt-1.5 break-words text-[15px] text-slate-900">{{ user?.phone || 'No phone linked' }}</p>
              </article>
            </div>
          </section>

          <section class="border-t border-[#f3e8dc] pt-5">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[#7b5b4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h10M4 17h7" />
              </svg>
              <h3 class="text-base font-semibold text-slate-900 sm:text-lg">Account Summary</h3>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <article class="flex h-full flex-col rounded-2xl border border-[#ead8c2] bg-white px-4 py-3.5 shadow-[0_8px_18px_rgba(47,27,20,0.045)]">
                <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff3e7] text-[#b56d2a]">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M5 11h14M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Member Since</p>
                <p class="mt-1.5 text-[15px] text-slate-900">{{ memberSince }}</p>
              </article>
              <article class="flex h-full flex-col rounded-2xl border border-[#ead8c2] bg-white px-4 py-3.5 shadow-[0_8px_18px_rgba(47,27,20,0.045)]">
                <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Profile Status</p>
                <p class="mt-1.5 text-[15px] text-emerald-600">Verified member</p>
              </article>
              <article class="flex h-full flex-col rounded-2xl border border-[#ead8c2] bg-white px-4 py-3.5 shadow-[0_8px_18px_rgba(47,27,20,0.045)]">
                <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6m3 6V7m3 10v-3m4 7H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2Z" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Store Access</p>
                <p class="mt-1.5 text-[15px] text-slate-900">
                  {{ isStoreLinked ? 'Connected to store tools' : 'Customer only' }}
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </article>
  `
})
export class CustomerPersonalDetailsComponent {
  @Input() user: CustomerUser | null = null;
  @Input() roles = 'customer';
  @Input() memberSince = 'Recently joined';
  @Input() isStoreLinked = false;
}

