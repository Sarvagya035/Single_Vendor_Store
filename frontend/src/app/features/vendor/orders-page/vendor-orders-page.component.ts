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
      <div class="rounded-[2rem] border border-white/70 bg-white/80 px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8">
        <app-page-header
          title="Manage incoming orders"
          eyebrowClass="text-emerald-500"
          titleClass="text-4xl"
        >
          <button type="button" (click)="loadOrders()" [disabled]="isLoading" class="btn-secondary !py-3">
            {{ isLoading ? 'Refreshing...' : 'Refresh Orders' }}
          </button>
        </app-page-header>

      </div>

      <div *ngIf="successMessage" class="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        {{ successMessage }}
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <article class="glass-card p-5">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Processing</p>
          <p class="mt-3 text-3xl font-black text-slate-900">{{ countByStatus('Processing') }}</p>
        </article>
        <article class="glass-card p-5">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Shipped</p>
          <p class="mt-3 text-3xl font-black text-slate-900">{{ countByStatus('Shipped') }}</p>
        </article>
        <article class="glass-card p-5">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Delivered</p>
          <p class="mt-3 text-3xl font-black text-slate-900">{{ countByStatus('Delivered') }}</p>
        </article>
      </div>

      <div *ngIf="isLoading" class="text-sm font-semibold text-slate-500">Loading vendor orders...</div>

      <div *ngIf="!isLoading && orders.length === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
        <h2 class="text-2xl font-black text-slate-900">No vendor orders yet</h2>
        <p class="mt-3 text-sm font-medium text-slate-500">
          Orders assigned to your products will appear here automatically.
        </p>
      </div>

      <div *ngIf="orders.length" class="grid gap-5">
        <article
          *ngFor="let order of orders; trackBy: trackByOrder"
          class="cursor-pointer rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]"
          (click)="openOrder(order)"
        >
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-lg font-black text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(vendorOrderStatus(order))">
                  {{ vendorOrderStatus(order) }}
                </span>
              </div>

              <div class="mt-4 grid gap-4 md:grid-cols-3">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Customer</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ customerName(order) }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Items</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ order.orderItems?.length || 0 }} vendor item(s)</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Destination</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress?.city || 'N/A' }}</p>
                </div>
              </div>

              <div class="mt-4 grid gap-3">
                <article
                  *ngFor="let item of order.orderItems || []; trackBy: trackByOrderItem"
                  class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4"
                  (click)="$event.stopPropagation()"
                >
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="min-w-0">
                      <p class="text-sm font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                      <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                      </p>
                    </div>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <p class="text-sm font-black text-slate-900">{{ formatCurrency(itemTotal(item)) }}</p>
                      <select
                        class="min-w-[180px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        [ngModel]="item.orderItemStatus || 'Processing'"
                        (ngModelChange)="updateItemStatus(order, item, $event)"
                        (click)="$event.stopPropagation()"
                      >
                        <option *ngFor="let status of statuses" [ngValue]="status">{{ status }}</option>
                      </select>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div class="flex min-w-[240px] flex-col gap-3">
              <p class="text-right text-2xl font-black text-slate-900">{{ formatCurrency(vendorOrderTotal(order)) }}</p>
              <p class="text-right text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Vendor item total
              </p>
              <p class="text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Created {{ formatDate(order.createdAt) }}
              </p>
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
  isLoading = false;
  successMessage = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
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

  countByStatus(status: OrderStatus): number {
    return this.orders.reduce(
      (count, order) =>
        count + (order.orderItems || []).filter((item) => (item.orderItemStatus || 'Processing') === status).length,
      0
    );
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
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Shipped':
        return 'bg-sky-100 text-sky-700';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  trackByOrder(index: number, order: OrderRecord): string {
    return order._id || String(index);
  }

  trackByOrderItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
  }
}
