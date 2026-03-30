import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomerUser } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-personal-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card overflow-hidden">
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-6 sm:px-8">
        <h3 class="text-lg text-xs font-black uppercase tracking-widest text-slate-900">Personal Details</h3>
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
      </div>

      <div class="p-6 sm:p-8">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <span class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Full Name</span>
            <p class="mt-3 text-lg font-black text-slate-900">{{ user?.username || 'Undisclosed' }}</p>
          </div>
          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <span class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Status</span>
            <p class="mt-3 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Verified Member
            </p>
          </div>

          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <span class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Email Address</span>
            <p class="mt-3 break-all text-base font-black text-slate-900">{{ user?.email || 'No email linked' }}</p>
          </div>

          <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <span class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Phone Number</span>
            <p class="mt-3 text-base font-black text-slate-900">{{ user?.phone || 'No phone linked' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerPersonalDetailsComponent {
  @Input() user: CustomerUser | null = null;
}
