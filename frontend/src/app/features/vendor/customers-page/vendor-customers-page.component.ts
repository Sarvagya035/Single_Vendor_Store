import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CustomerUser } from '../../../core/models/customer.models';
import { OrderRecord } from '../../../core/models/order.models';
import { VendorService } from '../../../core/services/vendor.service';

interface VendorCustomerRow {
  user: CustomerUser;
  orderCount: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  lastOrderAt?: string;
  orders: OrderRecord[];
}

@Component({
  selector: 'app-vendor-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell">
        <div class="border-b border-slate-200 px-6 py-6 lg:px-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-3xl">
              <p class="app-page-eyebrow">Customer Directory</p>
              <h1 class="app-page-title">Registered Customers</h1>
              <p class="app-page-description">
                Review customer activity, total spend, order history, frequently bought products, and wishlist items in one place.
              </p>
            </div>

            <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <label class="relative w-full sm:flex-1 lg:w-[260px]">
                <span class="sr-only">Search customers</span>
                <input
                  type="search"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="applyFilters()"
                  placeholder="Search customers"
                  class="w-full min-w-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </label>
              <button
                type="button"
                (click)="reloadCustomers()"
                class="btn-secondary !w-full !justify-center !px-6 !py-3 sm:!w-auto"
              >
                {{ isLoading ? 'Loading...' : 'Refresh Customers' }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-4 px-6 py-6 md:grid-cols-3 lg:px-8">
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Total Customers</p>
            <p class="vendor-stat-value">{{ customerRows.length }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Active Buyers</p>
            <p class="vendor-stat-value">{{ activeCustomerCount }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-600">Latest Signup</p>
            <p class="mt-3 text-sm font-black text-slate-900">{{ newestCustomerLabel }}</p>
          </article>
        </div>
      </div>

      <section class="vendor-page-shell overflow-hidden">
        <div *ngIf="isLoading" class="px-6 py-10 text-sm font-semibold text-slate-500 lg:px-8">
          Loading customer accounts...
        </div>

        <div *ngIf="!isLoading && filteredCustomers.length === 0" class="px-6 py-12 text-center lg:px-8">
          <h2 class="vendor-empty-title">No customers found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            Try a different search term or wait for new customer signups.
          </p>
        </div>

        <div *ngIf="!isLoading && filteredCustomers.length > 0" class="overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="bg-white">
              <tr class="text-left text-sm font-semibold text-slate-500">
                <th class="px-6 py-4 font-semibold lg:px-8">Customer</th>
                <th class="px-6 py-4 font-semibold">Email</th>
                <th class="px-6 py-4 font-semibold">Orders</th>
                <th class="px-6 py-4 font-semibold">Total Spent</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th class="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let customer of filteredCustomers; trackBy: trackByCustomer"
                class="cursor-pointer border-t border-slate-100 bg-white transition hover:bg-[#fffaf4]"
                title="Open customer details"
                (click)="openCustomerDetails(customer)"
              >
                <td class="border-t border-slate-100 px-6 py-5 lg:px-8">
                  <div class="flex items-center gap-4">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff2e5] text-sm font-black text-[#e67d00]">
                      {{ initials(customer.user) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-base font-black text-slate-900">
                        {{ customer.user.fullName || customer.user.username || customer.user.email || 'Customer' }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="border-t border-slate-100 px-6 py-5 text-sm font-medium text-slate-600">
                  {{ customer.user.email || 'No email provided' }}
                </td>

                <td class="border-t border-slate-100 px-6 py-5 text-sm font-black text-slate-900">
                  {{ customer.orderCount }}
                </td>

                <td class="border-t border-slate-100 px-6 py-5 text-lg font-black text-[#e67d00]">
                  {{ formatCurrency(customer.totalSpent) }}
                </td>

                <td class="border-t border-slate-100 px-6 py-5">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em]"
                    [ngClass]="customer.status === 'Active'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'"
                  >
                    {{ customer.status }}
                  </span>
                </td>

                <td class="border-t border-slate-100 px-6 py-5 lg:px-8">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:border-amber-200 hover:bg-[#fff7ed]"
                    title="Open customer details"
                    (click)="openCustomerDetails(customer); $event.stopPropagation()"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0c-1.8 4.5-6 8-12 8S1.8 16.5 0 12c1.8-4.5 6-8 12-8s10.2 3.5 12 8Z" />
                      <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `
})
export class VendorCustomersPageComponent implements OnInit {
  customerRows: VendorCustomerRow[] = [];
  filteredCustomers: VendorCustomerRow[] = [];
  searchTerm = '';
  isLoading = true;

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reloadCustomers();
  }

  get activeCustomerCount(): number {
    return this.customerRows.filter((row) => row.status === 'Active').length;
  }

  get newestCustomerLabel(): string {
    if (!this.customerRows.length) {
      return 'No customer accounts yet';
    }

    const latest = [...this.customerRows].sort((a, b) => this.toTimestamp(b.user.createdAt) - this.toTimestamp(a.user.createdAt))[0];
    return latest.user.fullName || latest.user.username || latest.user.email || 'Latest customer';
  }

  reloadCustomers(): void {
    this.isLoading = true;

    this.vendorService.getRegisteredCustomers().subscribe({
      next: (users) => {
        this.buildRows(users);
      },
      error: () => {
        this.customerRows = [];
        this.filteredCustomers = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCustomers = !term
      ? [...this.customerRows]
      : this.customerRows.filter((row) =>
          [row.user.username, row.user.fullName, row.user.email, row.user.phone, row.status, String(row.orderCount)]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        );
  }

  openCustomerDetails(customer: VendorCustomerRow): void {
    if (!customer.user._id) {
      return;
    }

    this.router.navigate(['/vendor/customers', customer.user._id]);
  }

  initials(user: CustomerUser): string {
    const label = String(user.fullName || user.username || user.email || 'Customer').trim();
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'C';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  trackByCustomer(_: number, row: VendorCustomerRow): string {
    return row.user._id || row.user.email || row.user.username || 'customer';
  }

  private buildRows(users: CustomerUser[]): void {
    if (!users.length) {
      this.customerRows = [];
      this.filteredCustomers = [];
      this.isLoading = false;
      return;
    }

    const orderRequests = users.map((user) =>
      user._id ? this.vendorService.getCustomerOrderHistory(user._id) : of([])
    );

    forkJoin(orderRequests).subscribe({
      next: (orderResults) => {
        this.customerRows = users.map((user, index) => {
          const orders = Array.isArray(orderResults[index]) ? orderResults[index] : [];
          return this.toCustomerRow(user, orders);
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.customerRows = users.map((user) => this.toCustomerRow(user, []));
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  private toCustomerRow(user: CustomerUser, orders: OrderRecord[]): VendorCustomerRow {
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + this.orderTotal(order), 0);
    const latestOrder = [...orders].sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt))[0];

    return {
      user,
      orderCount,
      totalSpent,
      status: orderCount > 0 ? 'Active' : 'Inactive',
      lastOrderAt: latestOrder?.createdAt,
      orders
    };
  }

  private orderTotal(order: OrderRecord): number {
    if (Number.isFinite(Number(order.totalAmount))) {
      return Number(order.totalAmount || 0);
    }

    return (order.orderItems || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }

  private toTimestamp(value?: string): number {
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
