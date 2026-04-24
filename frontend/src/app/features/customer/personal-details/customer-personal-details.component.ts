import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomerUser } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-personal-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="overflow-hidden rounded-[1.75rem] border border-[#e7dac9] bg-white shadow-[0_18px_40px_rgba(47,27,20,0.06)]">
      <div class="border-b border-[#eee2d4] app-card-body">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6ede5] text-2xl font-medium text-[#7b5b4d]">
            {{ user?.username?.charAt(0)?.toUpperCase() || 'C' }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-[1.45rem] font-medium tracking-tight text-slate-900">{{ user?.username || 'Customer account' }}</h2>
              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L9.25 10.69 7.78 9.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clip-rule="evenodd" />
                </svg>
                Active
              </span>
            </div>

            <p class="mt-2 max-w-2xl text-sm leading-7 text-[#7a6556]">
              Keep your profile accurate so orders, delivery updates, and account recovery stay seamless.
            </p>
          </div>
        </div>
      </div>

      <div class="app-card-body">
        <section>
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 text-[#7b5b4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0" />
            </svg>
            <h3 class="text-lg font-medium text-slate-900">Personal Information</h3>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-[#fffaf5] px-4 py-4">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Full Name</p>
              <p class="mt-2 text-[15px] text-slate-900">{{ user?.username || user?.fullName || 'Undisclosed' }}</p>
            </article>
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-[#fffaf5] px-4 py-4">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Primary Role</p>
              <p class="mt-2 text-[15px] text-slate-900">{{ roles }}</p>
            </article>
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-[#fffaf5] px-4 py-4">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Email Address</p>
              <p class="mt-2 break-all text-[15px] text-slate-900">{{ user?.email || 'No email linked' }}</p>
            </article>
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-[#fffaf5] px-4 py-4">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Phone Number</p>
              <p class="mt-2 text-[15px] text-slate-900">{{ user?.phone || 'No phone linked' }}</p>
            </article>
          </div>
        </section>

        <section class="mt-6 border-t border-[#f3e8dc] pt-6">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 text-[#7b5b4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h10M4 17h7" />
            </svg>
            <h3 class="text-lg font-medium text-slate-900">Account Summary</h3>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-white px-4 py-4 shadow-sm">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Member Since</p>
              <p class="mt-2 text-[15px] text-slate-900">{{ memberSince }}</p>
            </article>
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-white px-4 py-4 shadow-sm">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Profile Status</p>
              <p class="mt-2 text-[15px] text-emerald-600">Verified member</p>
            </article>
            <article class="rounded-[1.2rem] border border-[#eee2d4] bg-white px-4 py-4 shadow-sm md:col-span-1">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Store Access</p>
              <p class="mt-2 text-[15px] text-slate-900">
                {{ isStoreLinked ? 'Connected to store tools' : 'Customer only' }}
              </p>
            </article>
          </div>
        </section>
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

