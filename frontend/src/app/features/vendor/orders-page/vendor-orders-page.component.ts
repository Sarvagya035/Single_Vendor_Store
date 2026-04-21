import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderItemRecord, OrderRecord, OrderStatus } from '../../../core/models/order.models';
import { OrderService } from '../../../core/services/order.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface px-6 py-7 sm:px-8">
        <app-page-header
          eyebrow="Orders"
          title="Manage incoming orders"
        >
          <button type="button" (click)="loadOrders()" [disabled]="isLoading" class="btn-secondary !py-3">
            {{ isLoading ? 'Refreshing...' : 'Refresh Orders' }}
          </button>
        </app-page-header>
      </div>

      <div class="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:px-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="relative w-full max-w-xl">
            <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
            </svg>
            <input
              type="search"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by order number, customer, item, or status"
              class="block w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <div class="inline-flex flex-wrap gap-1 rounded-full bg-[#f6f1eb] p-1">
            <button
              *ngFor="let tab of statusTabs"
              type="button"
              class="rounded-full px-4 py-2 text-sm font-black transition"
              [ngClass]="activeFilter === tab.value
                ? 'bg-white text-[#6f4e37] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                : 'text-slate-700 hover:text-[#6f4e37]'"
              (click)="setFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="successMessage" class="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        {{ successMessage }}
      </div>

      <div *ngIf="isLoading" class="text-sm font-semibold text-slate-500">Loading vendor orders...</div>

      <div *ngIf="!isLoading && filteredOrders.length === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
        <h2 class="vendor-empty-title">
          {{ orders.length ? 'No orders match this filter' : 'No vendor orders yet' }}
        </h2>
        <p class="mt-3 text-sm font-medium text-slate-500">
          {{ orders.length
            ? 'Try a different status tab or clear your search to see more orders.'
            : 'Orders assigned to your products will appear here automatically. Refresh the page after new sales come in.' }}
        </p>

        <div class="mt-6 flex flex-wrap justify-center gap-3" *ngIf="orders.length">
          <button
            type="button"
            (click)="resetFilters()"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-800 transition hover:border-amber-200 hover:bg-[#fff7ed]"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div *ngIf="filteredOrders.length" class="grid gap-4">
        <article
          *ngFor="let order of filteredOrders; trackBy: trackByOrder"
          class="cursor-pointer rounded-[1.6rem] border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#e7dac9] hover:shadow-[0_16px_40px_rgba(111,78,55,0.08)]"
          (click)="openOrder(order)"
        >
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-xl font-black text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                <span class="rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em]" [ngClass]="statusClass(vendorOrderStatus(order))">
                  {{ vendorOrderStatus(order) }}
                </span>
              </div>

              <p class="mt-3 text-sm font-medium text-slate-500">
                Placed on {{ formatDate(order.createdAt) }} • {{ order.orderItems?.length || 0 }} items
              </p>
            </div>

            <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5 lg:justify-end">
              <div class="text-left sm:text-right">
                <p class="text-sm font-medium text-slate-500">Total</p>
                <p class="text-3xl font-black text-[#e67d00]">{{ formatCurrency(vendorOrderTotal(order)) }}</p>
              </div>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 transition hover:border-amber-200 hover:bg-[#fff7ed]"
                (click)="$event.stopPropagation(); openOrder(order)"
              >
                <svg class="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0c-1.8 4.5-6 8-12 8S1.8 16.5 0 12c1.8-4.5 6-8 12-8s10.2 3.5 12 8Z" />
                  <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
                </svg>
                View
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class VendorOrdersPageComponent implements OnInit {
  orders: OrderRecord[] = [];
  statuses: OrderStatus[] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  activeFilter: 'all' | OrderStatus = 'all';
  searchQuery = '';
  statusTabs: Array<{ label: string; value: 'all' | OrderStatus }> = [
    { label: 'All Orders', value: 'all' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];
  isLoading = false;
  successMessage = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get filteredOrders(): OrderRecord[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesStatus = this.activeFilter === 'all' || this.vendorOrderStatus(order) === this.activeFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const orderNumber = this.shortOrderId(order._id).toLowerCase();
      const customer = this.customerName(order).toLowerCase();
      const status = this.vendorOrderStatus(order).toLowerCase();
      const itemText = (order.orderItems || [])
        .flatMap((item) => [item.name, item.sku, item.variantId, item.product])
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
        .join(' ');

      return [orderNumber, customer, status, itemText].some((value) => value.includes(query));
    });
  }

  loadOrders(): void {
    this.isLoading = true;

    this.orderService.getVendorOrders().subscribe({
      next: (orders) => {
        this.isLoading = false;
        this.orders = orders;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: 'all' | OrderStatus): void {
    this.activeFilter = filter;
  }

  resetFilters(): void {
    this.activeFilter = 'all';
    this.searchQuery = '';
  }

  onSearchChange(value: string): void {
    this.searchQuery = value || '';
  }

  updateItemStatus(order: OrderRecord, item: OrderItemRecord, status: OrderStatus): void {
    if (!order._id || !item._id || !status || item.orderItemStatus === status) {
      return;
    }

    this.successMessage = '';

    this.orderService.updateVendorOrderStatus(order._id, item._id, status).subscribe({
      next: (response) => {
        const updatedOrder = response?.data as OrderRecord | undefined;
        this.successMessage = response?.message || `Order item updated to ${status}.`;
        this.orders = this.orders.map((entry) => (entry._id === order._id ? updatedOrder || entry : entry));
      },
      error: () => {
        this.loadOrders();
      }
    });
  }

  openOrder(order: OrderRecord): void {
    if (!order._id) {
      return;
    }

    this.router.navigate(['/vendor/orders', order._id]);
  }

  customerName(order: OrderRecord): string {
    if (order.user && typeof order.user === 'object') {
      return order.user.fullName || order.user.fullname || order.user.username || order.user.email || 'Customer';
    }
    return 'Customer';
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
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

  vendorOrderTotal(order: OrderRecord): number {
    return (order.orderItems || []).reduce((sum, item) => sum + this.itemTotal(item), 0);
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'border-orange-100 bg-orange-50 text-[#e67d00]';
      case 'Shipped':
        return 'border-amber-100 bg-amber-50 text-[#b45309]';
      case 'Cancelled':
        return 'border-rose-100 bg-rose-50 text-rose-700';
      default:
        return 'border-slate-200 bg-white text-slate-800';
    }
  }

  trackByOrder(index: number, order: OrderRecord): string {
    return order._id || String(index);
  }

  trackByOrderItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
  }
}

