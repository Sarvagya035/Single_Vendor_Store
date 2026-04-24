import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerUser } from '../../../core/models/customer.models';
import { OrderItemRecord, OrderRecord, OrderStatus } from '../../../core/models/order.models';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-customer-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Customer Orders"
            [title]="customer ? customerLabel() + ' order history' : 'Customer order history'"
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          >
            <button type="button" (click)="goBack()" class="btn-secondary w-full !py-3 sm:w-auto">
              Back to Customer
            </button>
          </app-page-header>
        </div>

        <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">
          Loading customer order history...
        </div>

        <div *ngIf="!isLoading && customer" class="px-4 py-4 sm:px-5 lg:px-6">
          <div class="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-xl font-black text-slate-500">
              <img *ngIf="customer.avatar; else customerInitials" [src]="customer.avatar" alt="" class="h-full w-full object-cover" />
              <ng-template #customerInitials>{{ initials(customer) }}</ng-template>
            </div>

            <div class="min-w-0">
              <h2 class="vendor-panel-title mt-2 truncate">
                {{ customer.username || customer.fullName || customer.email }}
              </h2>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em]">
            <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-amber-800">{{ customerOrders.length }} order{{ customerOrders.length === 1 ? '' : 's' }}</span>
            <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-amber-800">{{ formatCurrency(totalSpent()) }} spent</span>
            <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-amber-800">{{ latestOrderLabel() }}</span>
          </div>
        </div>

        <div class="vendor-grid-3 mt-5">
          <article class="vendor-stat-card !border-amber-100 !bg-amber-50/70">
            <p class="vendor-stat-label !text-amber-700">Total Orders</p>
            <p class="mt-3 text-3xl font-black text-slate-900">{{ customerOrders.length }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-amber-50/70">
            <p class="vendor-stat-label !text-amber-700">Delivered</p>
            <p class="mt-3 text-3xl font-black text-slate-900">{{ countByStatus('Delivered') }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-amber-50/70">
            <p class="vendor-stat-label !text-amber-700">Latest Order</p>
            <p class="mt-3 text-lg font-black text-slate-900">{{ latestOrderLabel() }}</p>
          </article>
        </div>
      </div>

        <div *ngIf="!isLoading && !customer" class="px-4 py-12 text-center sm:px-5 lg:px-6">
          <h2 class="vendor-empty-title">Customer not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            The customer you selected may have been removed or the link is invalid.
          </p>
        </div>

        <div *ngIf="!isLoading && customerOrders.length === 0 && customer" class="border-t border-slate-200 px-4 py-16 text-center sm:px-5 lg:px-6">
          <h2 class="vendor-empty-title">No customer orders yet</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">
            This customer has not placed any orders yet.
          </p>
        </div>

        <div *ngIf="!isLoading && customerOrders.length > 0" class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6">
        <div class="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="vendor-stat-label">Search</p>
            <h2 class="vendor-panel-title mt-2">Find a specific order</h2>
          </div>

          <div class="w-full max-w-2xl">
            <label class="sr-only" for="customer-order-search">Search orders</label>
            <div class="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-slate-400">
                <path fill="currentColor" d="M10 4a6 6 0 104.472 10.007l4.26 4.261 1.414-1.414-4.26-4.26A6 6 0 0010 4Zm0 2a4 4 0 110 8 4 4 0 010-8Z" />
              </svg>
              <input
                id="customer-order-search"
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Search by order number, item name, SKU, or status"
                class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                *ngIf="searchTerm"
                type="button"
                class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-200"
                (click)="searchTerm = ''"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Showing {{ filteredOrders().length }} of {{ customerOrders.length }}
          </span>
          <span *ngIf="searchTerm" class="rounded-full bg-[#fff7ed] px-3 py-1 text-amber-800">
            {{ searchTerm }}
          </span>
        </div>
      </div>

      <div *ngIf="!isLoading && filteredOrders().length === 0 && customerOrders.length > 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
        <h2 class="vendor-empty-title">No matching orders</h2>
        <p class="mt-3 text-sm font-medium text-slate-500">
          Try a different order number, item name, SKU, or status.
        </p>
      </div>

      <div *ngIf="!isLoading && filteredOrders().length > 0" class="grid gap-5">
        <article
          *ngFor="let order of filteredOrders(); trackBy: trackByOrder"
          class="vendor-mobile-card cursor-pointer transition hover:-translate-y-0.5 hover:border-[#e7dac9] hover:shadow-[0_24px_60px_rgba(111,78,55,0.08)]"
          (click)="openOrder(order)"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-lg font-black text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(vendorOrderStatus(order))">
                  {{ vendorOrderStatus(order) }}
                </span>
              </div>

              <div class="mt-4 grid gap-4 md:grid-cols-3">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Items</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ order.orderItems?.length || 0 }} item(s)</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Amount</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ formatCurrency(orderTotal(order)) }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Placed</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>

              <div class="mt-4 grid gap-3">
                <div
                  *ngFor="let item of order.orderItems || []; trackBy: trackByOrderItem"
                  class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4"
                  (click)="$event.stopPropagation()"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <p class="text-sm font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                      <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                      </p>
                    </div>

                    <p class="text-sm font-black text-slate-900">{{ formatCurrency(itemTotal(item)) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-start gap-3 lg:min-w-[220px] lg:items-end">
              <button
                type="button"
                class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-800 transition hover:bg-amber-100"
                (click)="$event.stopPropagation(); openOrder(order)"
              >
                View order
              </button>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Customer order history
              </p>
            </div>
          </div>
        </article>
        </div>
      </div>
    </section>
  `
})
export class VendorCustomerOrdersPageComponent implements OnInit {
  customer: CustomerUser | null = null;
  customerOrders: OrderRecord[] = [];
  isLoading = true;
  searchTerm = '';
  customerId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    const userId = this.route.parent?.snapshot.paramMap.get('userId') || this.route.snapshot.paramMap.get('userId');

    if (!userId) {
      this.isLoading = false;
      this.errorService.showToast('Missing customer id.', 'error');
      return;
    }

    this.customerId = userId;

    forkJoin({
      customers: this.vendorService.getRegisteredCustomers(),
      orders: this.vendorService.getCustomerOrderHistory(userId)
    }).subscribe({
      next: ({ customers, orders }) => {
        this.customer = customers.find((user) => user._id === userId) || null;
        this.customerOrders = Array.isArray(orders)
          ? [...orders].sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt))
          : [];
        this.isLoading = false;
      },
      error: () => {
        this.customer = null;
        this.customerOrders = [];
        this.isLoading = false;
        this.errorService.showToast('Unable to load the customer order history.', 'error');
      }
    });
  }

  goBack(): void {
    if (!this.customer?._id) {
      this.router.navigate(['/vendor/customers']);
      return;
    }

    this.router.navigate(['/vendor/customers', this.customer._id]);
  }

  openOrder(order: OrderRecord): void {
    if (!order._id) {
      return;
    }

    this.router.navigate(['/vendor/customers', this.customerId, 'orders', order._id]);
  }

  customerLabel(): string {
    if (!this.customer) {
      return 'Customer';
    }

    return this.customer.username || this.customer.fullName || this.customer.email || 'Customer';
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

  latestOrderLabel(): string {
    if (!this.customerOrders.length) {
      return 'No orders yet';
    }

    return this.formatDate(this.customerOrders[0]?.createdAt);
  }

  totalSpent(): number {
    return this.customerOrders.reduce((total, order) => total + this.orderTotal(order), 0);
  }

  countByStatus(status: OrderStatus): number {
    return this.customerOrders.reduce(
      (count, order) =>
        count + (order.orderItems || []).filter((item) => (item.orderItemStatus || 'Processing') === status).length,
      0
    );
  }

  vendorOrderStatus(order: OrderRecord): OrderStatus {
    const statuses = (order.orderItems || []).map((item) => item.orderItemStatus || 'Processing');

    if (!statuses.length) {
      return 'Processing';
    }

    if (statuses.every((status) => status === 'Cancelled')) {
      return 'Cancelled';
    }

    if (statuses.every((status) => status === 'Delivered')) {
      return 'Delivered';
    }

    if (statuses.every((status) => status === 'Shipped' || status === 'Delivered')) {
      return 'Shipped';
    }

    return 'Processing';
  }

  orderTotal(order: OrderRecord): number {
    return (order.orderItems || []).reduce((sum, item) => sum + this.itemTotal(item), 0);
  }

  filteredOrders(): OrderRecord[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.customerOrders;
    }

    return this.customerOrders.filter((order) => this.orderMatchesSearch(order, term));
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-[#f5e6d3] text-[#6f4e37]';
      case 'Shipped':
        return 'bg-[#fff7ed] text-[#6f4e37]';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-[#fff7ed] text-[#6f4e37]';
    }
  }

  trackByOrder(index: number, order: OrderRecord): string {
    return order._id || String(index);
  }

  trackByOrderItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
  }

  private orderMatchesSearch(order: OrderRecord, term: string): boolean {
    const orderId = String(order._id || '').toLowerCase();
    const status = String(this.vendorOrderStatus(order) || '').toLowerCase();
    const orderTotal = String(this.orderTotal(order));

    if (orderId.includes(term) || status.includes(term) || orderTotal.includes(term)) {
      return true;
    }

    return (order.orderItems || []).some((item) => {
      const name = String(item.name || '').toLowerCase();
      const sku = String(item.sku || '').toLowerCase();
      const variant = String(item.variantId || '').toLowerCase();
      const product = String(item.product || '').toLowerCase();
      return [name, sku, variant, product].some((value) => value.includes(term));
    });
  }

  private toTimestamp(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }
}
