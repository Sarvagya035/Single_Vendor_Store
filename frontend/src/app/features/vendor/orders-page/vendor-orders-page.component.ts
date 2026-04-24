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
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Order Management"
            title="Vendor Orders"
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          >
            <button type="button" (click)="loadOrders()" [disabled]="isLoading" class="btn-secondary w-full !px-5 !py-2.5 sm:w-auto">
              {{ isLoading ? 'Refreshing...' : 'Refresh Orders' }}
            </button>
          </app-page-header>
        </div>

        <div class="vendor-grid-4 px-4 py-4 sm:px-5 lg:px-6">
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Total Orders</p>
            <p class="vendor-stat-value">{{ totalOrdersCount }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Processing</p>
            <p class="vendor-stat-value">{{ processingOrdersCount }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-600">Shipped</p>
            <p class="vendor-stat-value">{{ shippedOrdersCount }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Delivered</p>
            <p class="vendor-stat-value">{{ deliveredOrdersCount }}</p>
          </article>
        </div>

        <div class="border-b border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
          <div class="relative w-full max-w-none lg:max-w-2xl">
            <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a5f44]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
            </svg>
            <input
              type="search"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by order number, customer, or items..."
              class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-12 py-3.5 text-sm font-medium text-slate-900 shadow-[0_10px_30px_rgba(47,27,20,0.04)] outline-none transition placeholder:text-slate-400 focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 px-4 py-4 sm:px-5 lg:px-6">
          <button
            *ngFor="let tab of statusTabs"
            type="button"
            class="rounded-full px-4 py-2 text-sm font-black transition"
            [ngClass]="activeFilter === tab.value
              ? 'bg-[#7c5646] text-white shadow-[0_10px_24px_rgba(124,86,70,0.18)]'
              : 'bg-[#f5ede5] text-slate-800 hover:bg-[#efe1d5] hover:text-[#7c5646]'"
            (click)="setFilter(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div *ngIf="successMessage" class="border-t border-slate-200 px-4 py-3 text-sm font-semibold text-amber-800 sm:px-5 lg:px-6">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="border-t border-slate-200 px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">
          Loading vendor orders...
        </div>

        <div *ngIf="!isLoading && filteredOrders.length === 0" class="border-t border-slate-200 px-4 py-12 text-center sm:px-5 lg:px-6">
          <h2 class="vendor-empty-title">
            {{ orders.length ? 'No orders match this filter' : 'No vendor orders yet' }}
          </h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
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

        <div *ngIf="filteredOrders.length" class="space-y-4 border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6">
          <article
            *ngFor="let order of filteredOrders; trackBy: trackByOrder"
            class="vendor-mobile-card cursor-pointer transition hover:border-[#e7dac9] hover:shadow-[0_16px_40px_rgba(111,78,55,0.08)] sm:px-5 sm:py-5"
            (click)="openOrder(order)"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex items-start gap-3">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f2ebe7] text-[#7c5646]">
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M7 4.5 12 2l5 2.5v5L12 12 7 9.5z" />
                      <path d="M7 9.5 12 12l5-2.5" />
                      <path d="M12 12v8" />
                      <path d="M7 4.5v5L12 12" />
                      <path d="M17 4.5v5L12 12" />
                    </svg>
                  </div>

                  <div class="min-w-0">
                    <p class="text-lg font-black text-slate-900 sm:text-xl">ORD-{{ shortOrderId(order._id) }}</p>
                    <p class="mt-1 text-sm font-medium text-[#9c5f39]">{{ customerName(order) }}</p>
                  </div>
                </div>

                <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Products</p>
                    <p class="mt-2 text-sm font-medium text-slate-900">{{ orderProductsText(order) }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Placed On</p>
                    <p class="mt-2 text-sm font-medium text-slate-900">{{ formatDateTime(order.createdAt) }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Total Amount</p>
                    <p class="mt-2 text-2xl font-black text-slate-900">{{ formatCurrency(vendorOrderTotal(order)) }}</p>
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black" [ngClass]="statusClass(vendorOrderStatus(order))">
                  <span class="h-2.5 w-2.5 rounded-full" [ngClass]="statusDotClass(vendorOrderStatus(order))"></span>
                  {{ vendorOrderStatus(order) }}
                </span>

                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full bg-[#7c5646] px-4 py-2.5 text-sm font-black text-white shadow-[0_10px_24px_rgba(124,86,70,0.18)] transition hover:bg-[#6e4b3d]"
                  (click)="$event.stopPropagation(); openOrder(order)"
                >
                  View Details
                </button>
              </div>
            </div>
          </article>
        </div>
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

  get totalOrdersCount(): number {
    return this.orders.length;
  }

  get processingOrdersCount(): number {
    return this.orders.filter((order) => this.vendorOrderStatus(order) === 'Processing').length;
  }

  get shippedOrdersCount(): number {
    return this.orders.filter((order) => this.vendorOrderStatus(order) === 'Shipped').length;
  }

  get deliveredOrdersCount(): number {
    return this.orders.filter((order) => this.vendorOrderStatus(order) === 'Delivered').length;
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

  orderProductsText(order: OrderRecord): string {
    const names = (order.orderItems || [])
      .map((item) => item.name || item.product || item.sku || item.variantId)
      .filter(Boolean)
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (!names.length) {
      return 'No products listed';
    }

    return names.join(', ');
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

  formatDateTime(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
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
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'Shipped':
        return 'border-sky-200 bg-sky-50 text-sky-600';
      case 'Cancelled':
        return 'border-rose-100 bg-rose-50 text-rose-700';
      default:
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }
  }

  statusDotClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500';
      case 'Shipped':
        return 'bg-sky-500';
      case 'Cancelled':
        return 'bg-rose-500';
      default:
        return 'bg-amber-500';
    }
  }

  trackByOrder(index: number, order: OrderRecord): string {
    return order._id || String(index);
  }

  trackByOrderItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
  }
}

