import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VendorDashboardView } from '../../../core/models/vendor.models';

type VendorSidebarIcon = 'dashboard' | 'trend' | 'box' | 'categories' | 'customers' | 'orders' | 'shipments';

interface VendorSidebarItem {
  label: string;
  link: string;
  view: VendorDashboardView | 'shipments';
  icon: VendorSidebarIcon;
  count?: number;
  showCount?: boolean;
  activeClasses: string;
  inactiveClasses: string;
}

@Component({
  selector: 'app-vendor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block lg:sticky lg:top-24 lg:self-start'
  },
  template: `
    <aside>
      <div class="glass-card flex flex-col p-3 lg:min-h-[calc(100vh-7rem)]">
        <nav class="mt-3 space-y-2.5">
          @for (item of sidebarItems; track item.view) {
            @if (item.view !== 'shipments' || showShipments) {
              <a
                [routerLink]="item.link"
                class="block w-full rounded-xl border px-3 py-2.5 text-left transition-all"
                [ngClass]="activeView === item.view ? item.activeClasses : item.inactiveClasses"
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
                    [ngClass]="activeView === item.view ? 'border-[#d9c4ad] bg-[#6f4e37] text-white' : 'border-[#ead9bf] bg-[#f7eedc] text-[#6f4e37]'"
                    aria-hidden="true"
                  >
                    @switch (item.icon) {
                      @case ('dashboard') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <rect x="3" y="3" width="7" height="7" rx="1.4" />
                          <rect x="14" y="3" width="7" height="7" rx="1.4" />
                          <rect x="3" y="14" width="7" height="7" rx="1.4" />
                          <rect x="14" y="14" width="7" height="7" rx="1.4" />
                        </svg>
                      }
                      @case ('trend') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <path d="M4 16l6-6 4 4 6-6" />
                          <path d="M14 8h6v6" />
                        </svg>
                      }
                      @case ('box') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <path d="M20 8.5l-8 4-8-4" />
                          <path d="M4 8.5l8-4 8 4v7l-8 4-8-4z" />
                          <path d="M12 12.5v8" />
                        </svg>
                      }
                      @case ('categories') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <rect x="4" y="4" width="5" height="5" rx="1.2" />
                          <rect x="15" y="4" width="5" height="5" rx="1.2" />
                          <rect x="10" y="15" width="5" height="5" rx="1.2" />
                          <path d="M6.5 9v3.2c0 1.3 1 2.3 2.3 2.3H12" />
                          <path d="M17.5 9v3.2c0 1.3-1 2.3-2.3 2.3H12" />
                        </svg>
                      }
                      @case ('customers') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <path d="M16 19c0-2.8-2.2-5-5-5H7c-2.8 0-5 2.2-5 5" />
                          <path d="M11 14c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z" />
                          <path d="M17 10c1.7 0 3 1.3 3 3" />
                          <path d="M18 19c0-1.3.6-2.5 1.6-3.2" />
                        </svg>
                      }
                      @case ('orders') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <path d="M3 5h3l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h7.8a1.5 1.5 0 0 0 1.5-1.1L22 8H7" />
                          <circle cx="10" cy="19" r="1.5" />
                          <circle cx="18" cy="19" r="1.5" />
                        </svg>
                      }
                      @case ('shipments') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                          <path d="M3 7h11v8H3z" />
                          <path d="M14 10h3l3 3v2h-6z" />
                          <circle cx="7" cy="18" r="1.5" />
                          <circle cx="17" cy="18" r="1.5" />
                        </svg>
                      }
                    }
                  </span>

                  <div class="min-w-0 flex-1">
                    <p class="text-[0.92rem] font-medium tracking-[-0.01em]">{{ item.label }}</p>
                  </div>

                  @if (item.showCount !== false && item.count !== undefined) {
                    <span
                      class="rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm"
                      [ngClass]="activeView === item.view ? 'bg-[#f6b24c] text-[#5d3618]' : 'bg-[#f6b24c] text-[#5d3618]'"
                    >
                      {{ item.count }}
                    </span>
                  }
                </div>
              </a>
            }
          }
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
  @Input() shipmentCount = 0;
  @Input() showShipments = false;

  get sidebarItems(): VendorSidebarItem[] {
    return [
      {
        label: 'Dashboard',
        link: '/vendor/dashboard',
        view: 'dashboard',
        icon: 'dashboard',
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      },
      {
        label: 'Best Sellers',
        link: '/vendor/best-selling-products',
        view: 'best-selling-products',
        icon: 'trend',
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      },
      {
        label: 'Products',
        link: '/vendor/products',
        view: 'products',
        icon: 'box',
        count: this.productCount,
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      },
      {
        label: 'Categories',
        link: '/vendor/categories',
        view: 'categories',
        icon: 'categories',
        count: this.categoryCount,
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      },
      {
        label: 'Customers',
        link: '/vendor/customers',
        view: 'customers',
        icon: 'customers',
        count: this.customerCount,
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      },
      {
        label: 'Orders',
        link: '/vendor/orders',
        view: 'orders',
        icon: 'orders',
        count: this.orderCount,
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      },
      {
        label: 'Shipments',
        link: '/vendor/shipments',
        view: 'shipments',
        icon: 'shipments',
        count: this.shipmentCount,
        activeClasses: 'border-[#e9d3bb] bg-[#fdf4dd] text-[#6f4e37] shadow-sm',
        inactiveClasses: 'border-transparent bg-[#fffdf6] text-slate-800 hover:border-[#ead9bf] hover:bg-[#fff8eb]'
      }
    ];
  }
}

