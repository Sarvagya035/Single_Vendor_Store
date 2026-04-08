import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VendorDashboardView } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block lg:sticky lg:top-24 lg:self-start'
  },
  template: `
    <aside>
      <div class="glass-card flex flex-col p-4 lg:min-h-[calc(100vh-7rem)]">

        <nav class="mt-4 space-y-2">
          <a
            routerLink="/vendor/dashboard"
            class="block w-full rounded-xl border px-4 py-3 text-left transition-all"
            [ngClass]="activeView === 'dashboard' ? 'border-[#e7dac9] bg-[#fef6eb] text-[#6f4e37] shadow-sm' : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="mt-1 text-base font-black">Dashboard</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-black" [ngClass]="activeView === 'dashboard' ? 'bg-[#6f4e37] text-white' : 'bg-slate-100 text-slate-700'">
                4
              </span>
            </div>
          </a>

          <a
            routerLink="/vendor/products"
            class="block w-full rounded-xl border px-4 py-3 text-left transition-all"
            [ngClass]="activeView === 'products' ? 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm' : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="mt-1 text-base font-black">Products</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-black" [ngClass]="activeView === 'products' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'">
                {{ productCount }}
              </span>
            </div>
          </a>

          <a
            routerLink="/vendor/categories"
            class="block w-full rounded-xl border px-4 py-3 text-left transition-all"
            [ngClass]="activeView === 'categories' ? 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm' : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="mt-1 text-base font-black">Categories</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-black" [ngClass]="activeView === 'categories' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'">
                {{ categoryCount }}
              </span>
            </div>
          </a>

          <a
            routerLink="/vendor/customers"
            class="block w-full rounded-xl border px-4 py-3 text-left transition-all"
            [ngClass]="activeView === 'customers' ? 'border-[#e7dac9] bg-[#fff7ed] text-[#6f4e37] shadow-sm' : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="mt-1 text-base font-black">Customers</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-black" [ngClass]="activeView === 'customers' ? 'bg-[#6f4e37] text-white' : 'bg-slate-100 text-slate-700'">
                {{ customerCount }}
              </span>
            </div>
          </a>

          <a
            routerLink="/vendor/orders"
            class="block w-full rounded-xl border px-4 py-3 text-left transition-all"
            [ngClass]="activeView === 'orders' ? 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm' : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="mt-1 text-base font-black">Orders</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-black" [ngClass]="activeView === 'orders' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'">
                {{ orderCount }}
              </span>
            </div>
          </a>
        </nav>
      </div>
    </aside>
  `
})
export class VendorSidebarComponent {
  @Input() activeView: VendorDashboardView = 'profile';
  @Input() productCount = 0;
  @Input() categoryCount = 0;
  @Input() customerCount = 0;
  @Input() orderCount = 0;
}

