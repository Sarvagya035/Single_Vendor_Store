import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomerUser } from '../../../core/models/customer.models';
import { OrderRecord } from '../../../core/models/order.models';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

interface VendorCustomerRow {
  user: CustomerUser;
  orderCount: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  joinedAt: string;
  avatarClass: string;
}

@Component({
  selector: 'app-vendor-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header
            eyebrow="Customer Directory"
            title="Registered Customers"
            titleClass="!text-[1.9rem] sm:!text-[2.2rem]"
          >
            <button
              type="button"
              (click)="reloadCustomers()"
              class="btn-secondary !px-5 !py-2.5"
            >
              {{ isLoading ? 'Refreshing...' : 'Refresh Customers' }}
            </button>
          </app-page-header>
        </div>

        <div class="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-3 lg:px-6">
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

        <div class="border-b border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
          <div class="relative">
            <svg
              class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a5f44]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
            </svg>
            <input
              type="search"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="Search customers by name, email..."
              class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-12 py-3.5 text-sm font-medium text-slate-900 shadow-[0_10px_30px_rgba(47,27,20,0.04)] outline-none transition placeholder:text-slate-400 focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>

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
            <thead class="bg-[#fffaf5]">
              <tr class="text-left text-sm font-semibold text-slate-500">
                <th class="px-6 py-5 font-semibold lg:px-8">Customer</th>
                <th class="px-6 py-5 font-semibold">Email</th>
                <th class="px-6 py-5 font-semibold">Orders</th>
                <th class="px-6 py-5 font-semibold">Total Spent</th>
                <th class="px-6 py-5 font-semibold">Status</th>
                <th class="px-6 py-5 font-semibold">Joined</th>
                <th class="px-6 py-5 font-semibold text-right lg:px-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let customer of filteredCustomers; trackBy: trackByCustomer"
                class="border-t border-slate-200 bg-white transition hover:bg-[#fffaf4]"
              >
                <td class="border-t border-slate-200 px-6 py-5 lg:px-8">
                  <div class="flex items-center gap-4">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black uppercase text-white"
                      [ngClass]="customer.avatarClass"
                    >
                      {{ initials(customer.user) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-base font-black text-slate-900">
                        {{ customer.user.fullName || customer.user.username || customer.user.email || 'Customer' }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="border-t border-slate-200 px-6 py-5 text-sm font-medium text-[#9c5f39]">
                  {{ customer.user.email || 'No email provided' }}
                </td>

                <td class="border-t border-slate-200 px-6 py-5">
                  <div class="inline-flex items-center gap-2 text-sm font-black text-slate-900">
                    <svg
                      class="h-4 w-4 text-[#8a5f44]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M7 3h10l2 4v13H5V7l2-4Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M9 3v4h6V3" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M9 12h6" />
                    </svg>
                    {{ customer.orderCount }}
                  </div>
                </td>

                <td class="border-t border-slate-200 px-6 py-5 text-sm font-black text-slate-900">
                  {{ formatCurrency(customer.totalSpent) }}
                </td>

                <td class="border-t border-slate-200 px-6 py-5">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-black"
                    [ngClass]="customer.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-[#f2ebe7] text-[#8c6c5d]'"
                  >
                    {{ customer.status }}
                  </span>
                </td>

                <td class="border-t border-slate-200 px-6 py-5 text-sm font-medium text-[#9c5f39]">
                  {{ customer.joinedAt }}
                </td>

                <td class="border-t border-slate-200 px-6 py-5 text-right lg:px-8">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-[#7c5646] px-4 py-2.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(124,86,70,0.18)] transition hover:bg-[#6e4b3d]"
                    title="Open customer details"
                    (click)="openCustomerDetails(customer); $event.stopPropagation()"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0c-1.8 4.5-6 8-12 8S1.8 16.5 0 12c1.8-4.5 6-8 12-8s10.2 3.5 12 8Z" />
                      <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
                    </svg>
                    View Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class VendorCustomersPageComponent implements OnInit {
  customerRows: VendorCustomerRow[] = [];
  filteredCustomers: VendorCustomerRow[] = [];
  searchTerm = '';
  isLoading = true;

  private readonly avatarPalette = [
    'bg-emerald-500',
    'bg-[#7c5646]',
    'bg-[#2f8df4]',
    'bg-[#ffb74d]',
    'bg-[#8b5e3c]',
    'bg-[#4e7c64]'
  ];

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
      user._id
        ? this.vendorService.getCustomerOrderHistory(user._id).pipe(catchError(() => of([])))
        : of([])
    );

    forkJoin(orderRequests).subscribe({
      next: (orderResults) => {
        this.customerRows = users.map((user, index) => {
          const orders = Array.isArray(orderResults[index]) ? orderResults[index] : [];
          return this.toCustomerRow(user, orders, index);
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.customerRows = users.map((user, index) => this.toCustomerRow(user, [], index));
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  private toCustomerRow(user: CustomerUser, orders: OrderRecord[], index: number): VendorCustomerRow {
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + this.orderTotal(order), 0);
    const joinedAt = user.createdAt ? this.formatJoinedDate(user.createdAt) : 'Unknown';

    return {
      user,
      orderCount,
      totalSpent,
      status: orderCount > 0 ? 'Active' : 'Inactive',
      joinedAt,
      avatarClass: this.avatarPalette[index % this.avatarPalette.length]
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

  private formatJoinedDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Unknown';
    }

    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }
}
