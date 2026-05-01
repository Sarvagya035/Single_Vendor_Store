import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-customer-merchant-program',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card overflow-hidden border-t-4 border-t-emerald-500">
      <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-6 sm:px-8">
        <h3 class="text-lg text-xs font-black uppercase tracking-widest text-slate-900">Store Account</h3>
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>

      <div class="space-y-6 p-6 sm:p-8">
        <div class="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-6 shadow-sm">
          <p class="text-sm leading-7 text-slate-600">
            This account is managed centrally by the store owner. Customers can update personal details and view their orders here.
          </p>
        </div>
      </div>
    </div>
  `
})
export class CustomerMerchantProgramComponent {
  @Input() storeOwnerProfile: null = null;
}
