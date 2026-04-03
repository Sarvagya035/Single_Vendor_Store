import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerUser } from '../../../core/models/customer.models';
import { VendorService } from '../../../core/services/vendor.service';
import { PageShellComponent } from '../../../shared/ui/page-shell.component';

@Component({
  selector: 'app-vendor-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageShellComponent],
  template: `
    <app-page-shell
      eyebrow="Customer directory"
      eyebrowClass="text-indigo-500"
      title="Registered customers"
      description="Browse registered customers and open any profile for full account details."
    >
      <div page-shell-actions class="flex flex-wrap gap-3">
        <label class="relative">
          <span class="sr-only">Search customers</span>
          <input
            type="search"
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilters()"
            placeholder="Search by name, email, or phone"
            class="app-input-soft w-full min-w-[260px] text-sm font-medium"
          />
        </label>
        <button type="button" (click)="reloadCustomers()" class="btn-secondary !px-6 !py-3">
          {{ isLoading ? 'Loading...' : 'Refresh list' }}
        </button>
      </div>

      <div page-shell-content class="space-y-6">
        <div class="grid gap-4 md:grid-cols-3">
          <article class="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-5">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-sky-600">Total Customers</p>
            <p class="mt-3 text-3xl font-black text-slate-900">{{ customers.length }}</p>
          </article>
          <article class="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-5">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Visible Now</p>
            <p class="mt-3 text-3xl font-black text-slate-900">{{ filteredCustomers.length }}</p>
          </article>
          <article class="rounded-[1.5rem] border border-amber-100 bg-amber-50/70 p-5">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600">Newest customer</p>
            <p class="mt-3 text-sm font-black text-slate-900">{{ newestCustomerLabel }}</p>
          </article>
        </div>

        <section class="app-section overflow-hidden">
          <div *ngIf="isLoading" class="px-6 py-10 text-sm font-semibold text-slate-500 lg:px-8">
            Loading customers...
          </div>

          <div *ngIf="!isLoading && filteredCustomers.length === 0" class="px-6 py-12 text-center lg:px-8">
            <h2 class="text-2xl font-black text-slate-900">No customers found</h2>
            <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
              Try a different search term or check back later for new signups.
            </p>
          </div>

          <div *ngIf="!isLoading && filteredCustomers.length > 0" class="divide-y divide-slate-100">
            <button
              type="button"
              *ngFor="let customer of filteredCustomers; trackBy: trackByUserId"
              (click)="openCustomer(customer)"
              class="flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-slate-50/80 lg:px-8"
            >
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex min-w-0 items-center gap-4">
                  <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-lg font-black text-slate-500">
                    <img *ngIf="customer.avatar; else initialsBlock" [src]="customer.avatar" alt="" class="h-full w-full object-cover" />
                    <ng-template #initialsBlock>{{ initials(customer) }}</ng-template>
                  </div>

                  <div class="min-w-0">
                    <p class="truncate text-base font-black text-slate-900">{{ customer.username || customer.fullName || customer.email }}</p>
                    <p class="truncate text-sm font-medium text-slate-500">{{ customer.email || 'No email provided' }}</p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em]">
                  <span class="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{{ formatRole(customer.role) }}</span>
                  <span *ngIf="customer.createdAt" class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Joined {{ formatDate(customer.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="grid gap-3 text-sm font-medium text-slate-500 md:grid-cols-2">
                <p><span class="font-black text-slate-900">Phone:</span> {{ customer.phone || 'Not provided' }}</p>
                <p><span class="font-black text-slate-900">User ID:</span> {{ shortId(customer._id) }}</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </app-page-shell>
  `
})
export class VendorCustomersPageComponent implements OnInit {
  customers: CustomerUser[] = [];
  filteredCustomers: CustomerUser[] = [];
  searchTerm = '';
  isLoading = true;

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reloadCustomers();
  }

  get newestCustomerLabel(): string {
    if (!this.customers.length) {
      return 'No customer accounts yet';
    }

    const latest = this.customers[0];
    return latest?.username || latest?.fullName || latest?.email || 'Latest customer';
  }

  reloadCustomers(): void {
    this.isLoading = true;

    this.vendorService.getRegisteredCustomers()
      .subscribe({
        next: (users) => {
          this.isLoading = false;
          this.customers = users;
          this.applyFilters();
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCustomers = !term
      ? [...this.customers]
      : this.customers.filter((user) =>
          [user.username, user.fullName, user.email, user.phone]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        );
  }

  openCustomer(customer: CustomerUser): void {
    if (!customer._id) {
      return;
    }

    this.router.navigate(['/vendor/customers', customer._id]);
  }

  initials(user: CustomerUser): string {
    const label = String(user.username || user.fullName || user.email || 'Customer').trim();
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'C';
  }

  formatRole(role?: string | string[]): string {
    if (Array.isArray(role)) {
      return role.join(', ') || 'customer';
    }

    return String(role || 'customer');
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Unknown';
    }

    return new Date(value).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  shortId(id?: string): string {
    if (!id) {
      return '--------';
    }

    return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
  }

  trackByUserId(_: number, user: CustomerUser): string {
    return user._id || user.email || `${user.username || 'customer'}`;
  }
}
