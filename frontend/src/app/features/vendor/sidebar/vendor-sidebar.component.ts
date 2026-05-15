import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VendorDashboardView } from '../../../core/models/vendor.models';

type VendorSidebarIcon = 'dashboard' | 'trend' | 'box' | 'categories' | 'customers' | 'orders' | 'shipments' | 'inquiry';

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
    class: 'block h-full min-w-0'
  },
  template: `
    <nav class="flex h-full flex-col bg-[#fbf1e3] px-4 pt-4 pb-6">
      @for (group of sidebarGroups; track group.title) {
        <div class="mt-4 first:mt-0">
          <div class="mb-2 flex items-center gap-2 px-1">
            <span class="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#a07a5a]">{{ group.title }}</span>
            <span class="h-[1px] flex-1 bg-[#ead8c2]"></span>
          </div>

          <div class="space-y-1.5">
            @for (item of group.items; track item.view) {
              @if ((item.view !== 'shipments' || showShipments) && (item.view !== 'bulk-inquiries' || showBulkInquiries)) {
                <a
                  [routerLink]="item.link"
                  class="flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left transition-all duration-200"
                  [ngClass]="activeView === item.view ? item.activeClasses : item.inactiveClasses"
                  (click)="closeMobile.emit()"
                >
                  <span class="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                      [ngClass]="activeView === item.view ? 'bg-white/15 text-white' : 'bg-[#f5e9da] text-[#7a4b2f]'"
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
                        @case ('inquiry') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                            <path d="M4 5h16v11H7l-3 3z" />
                            <path d="M8 9h8" />
                            <path d="M8 12h5" />
                          </svg>
                        }
                      }
                    </span>

                    <span
                      class="min-w-0 truncate text-[14px] leading-none tracking-[0.2px]"
                      [ngClass]="activeView === item.view ? 'font-semibold text-white' : 'font-semibold text-slate-700'"
                    >
                      {{ item.label }}
                    </span>
                  </span>

                  @if (item.showCount !== false && item.count !== undefined) {
                    <span
                      class="flex h-7 min-w-[32px] shrink-0 items-center justify-center rounded-full px-2 text-[12px] font-semibold"
                      [ngClass]="activeView === item.view ? 'bg-white text-[#7a4b2f]' : 'bg-[#f4e8d8] text-[#7a4b2f]'"
                    >
                      {{ item.count }}
                    </span>
                  }
                </a>
              }
            }
          </div>
        </div>
      }
    </nav>
  `
})
export class VendorSidebarComponent {
  @Input() activeView: VendorDashboardView = 'profile';
  @Input() productCount = 0;
  @Input() categoryCount = 0;
  @Input() customerCount = 0;
  @Input() orderCount = 0;
  @Input() shipmentCount = 0;
  @Input() bulkInquiryCount = 0;
  @Input() showShipments = false;
  @Input() showBulkInquiries = false;
  @Output() closeMobile = new EventEmitter<void>();

  get sidebarGroups(): Array<{ title: string; items: VendorSidebarItem[] }> {
    return [
      {
        title: 'Core',
        items: [
          {
            label: 'Dashboard',
            link: '/vendor/dashboard',
            view: 'dashboard',
            icon: 'dashboard',
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          },
          {
            label: 'Best Sellers',
            link: '/vendor/best-selling-products',
            view: 'best-selling-products',
            icon: 'trend',
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          },
          {
            label: 'Products',
            link: '/vendor/products',
            view: 'products',
            icon: 'box',
            count: this.productCount,
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          },
          {
            label: 'Categories',
            link: '/vendor/categories',
            view: 'categories',
            icon: 'categories',
            count: this.categoryCount,
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          },
          {
            label: 'Customers',
            link: '/vendor/customers',
            view: 'customers',
            icon: 'customers',
            count: this.customerCount,
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          },
          {
            label: 'Orders',
            link: '/vendor/orders',
            view: 'orders',
            icon: 'orders',
            count: this.orderCount,
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          }
        ]
      },
      {
        title: 'Manage',
        items: [
          {
            label: 'Bulk Inquiries',
            link: '/vendor/bulk-inquiries',
            view: 'bulk-inquiries',
            icon: 'inquiry',
            count: this.bulkInquiryCount,
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          },
          {
            label: 'Shipments',
            link: '/vendor/shipments',
            view: 'shipments',
            icon: 'shipments',
            count: this.shipmentCount,
            activeClasses: 'bg-[#7a4b2f] text-white shadow-[0_4px_12px_rgba(122,75,47,0.25)]',
            inactiveClasses: 'bg-transparent text-slate-700 hover:bg-[#f3e4d0]'
          }
        ]
      }
    ];
  }
}
