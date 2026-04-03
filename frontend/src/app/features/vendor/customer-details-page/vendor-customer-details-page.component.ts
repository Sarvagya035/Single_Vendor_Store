import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerUser } from '../../../core/models/customer.models';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageShellComponent } from '../../../shared/ui/page-shell.component';

@Component({
  selector: 'app-vendor-customer-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PageShellComponent],
  template: `
    <app-page-shell
      eyebrow="Customer details"
      eyebrowClass="text-indigo-500"
      title="Customer profile"
      description="View account information and contact details for the selected customer."
    >
      <div page-shell-actions>
        <button type="button" (click)="goBack()" class="btn-secondary !px-6 !py-3">
          Back to Customers
        </button>
      </div>

      <div page-shell-content class="space-y-6">
        <div *ngIf="isLoading" class="app-section px-6 py-10 text-sm font-semibold text-slate-500 lg:px-8">
          Loading customer profile...
        </div>

        <div *ngIf="!isLoading && customer" class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section class="app-section p-6 lg:p-8">
            <div class="flex items-center gap-4">
              <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-2xl font-black text-slate-500">
                <img *ngIf="customer.avatar; else initialsBlock" [src]="customer.avatar" alt="" class="h-full w-full object-cover" />
                <ng-template #initialsBlock>{{ initials(customer) }}</ng-template>
              </div>

              <div class="min-w-0">
                <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Selected Customer</p>
                <h2 class="mt-2 truncate text-3xl font-black tracking-tight text-slate-900">
                  {{ customer.username || customer.fullName || customer.email }}
                </h2>
                <p class="mt-2 truncate text-sm font-medium text-slate-500">
                  {{ customer.email || 'No email provided' }}
                </p>
              </div>
            </div>

            <dl class="mt-8 space-y-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Email</dt>
                <dd class="mt-2 break-words text-sm font-bold text-slate-900">{{ customer.email || 'Not provided' }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</dt>
                <dd class="mt-2 break-words text-sm font-bold text-slate-900">{{ customer.phone || 'Not provided' }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Role</dt>
                <dd class="mt-2 text-sm font-bold text-slate-900">{{ formatRole(customer.role) }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Joined</dt>
                <dd class="mt-2 text-sm font-bold text-slate-900">{{ customer.createdAt ? formatDate(customer.createdAt) : 'Unknown' }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Customer ID</dt>
                <dd class="mt-2 break-all text-sm font-bold text-slate-900">{{ customer._id || 'Unknown' }}</dd>
              </div>
            </dl>
          </section>

          <section class="app-section p-6 lg:p-8">
            <div class="flex min-h-[420px] flex-col justify-between">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Account summary</p>
                <h2 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Overview at a glance</h2>
                <p class="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
                  Use the customer list to open one profile at a time and keep the workspace focused.
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <article class="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-5">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-sky-600">Display Name</p>
                  <p class="mt-3 text-lg font-black text-slate-900">{{ customer.username || customer.fullName || 'Customer' }}</p>
                </article>
                <article class="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-5">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Reference</p>
                  <p class="mt-3 text-lg font-black text-slate-900">{{ shortId(customer._id) }}</p>
                </article>
              </div>
            </div>
          </section>
        </div>

        <div *ngIf="!isLoading && !customer" class="app-section px-6 py-12 text-center lg:px-8">
          <h2 class="text-2xl font-black text-slate-900">Customer not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            The selected customer may have been removed, or the link may be invalid.
          </p>
        </div>
      </div>
    </app-page-shell>
  `
})
export class VendorCustomerDetailsPageComponent implements OnInit {
  customer: CustomerUser | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');

    if (!userId) {
      this.isLoading = false;
      this.errorService.showToast('Missing customer id.', 'error');
      return;
    }

    this.vendorService.getRegisteredCustomers().subscribe({
      next: (users) => {
        this.customer = users.find((user) => user._id === userId) || null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/vendor/customers']);
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
}
