import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AdminOrdersResponse, OrderRecord } from '../../../core/models/order.models';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, StatCardComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface p-6 sm:p-8">
        <app-page-header
          eyebrow="Order Administration"
          title="Marketplace orders"
          eyebrowClass="text-amber-500"
          titleClass="text-4xl"
        >
          <button type="button" (click)="loadOrders()" [disabled]="isLoading" class="btn-secondary !py-3">
            {{ isLoading ? 'Refreshing...' : 'Refresh Orders' }}
          </button>
        </app-page-header>

        <p class="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500">
          Monitor total revenue and review every order currently flowing through the marketplace.
        </p>
      </div>

      <div *ngIf="errorMessage" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {{ errorMessage }}
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <app-stat-card label="Total Orders" [value]="summary.orders.length" tone="amber" />
        <app-stat-card label="Paid Revenue" [value]="formatCurrency(summary.totalRevenue)" tone="emerald" />
        <app-stat-card label="Processing" [value]="countByStatus('Processing')" tone="indigo" />
        <app-stat-card label="Delivered" [value]="countByStatus('Delivered')" tone="sky" />
      </div>

      <div *ngIf="isLoading" class="app-card-soft px-6 py-12 text-sm font-semibold text-slate-500">Loading marketplace orders...</div>

      <div *ngIf="!isLoading && summary.orders.length === 0" class="app-card-soft border-dashed px-8 py-16 text-center">
        <h2 class="text-2xl font-black text-slate-900">No orders found</h2>
        <p class="mt-3 text-sm font-medium text-slate-500">Marketplace orders will appear here once customers start checking out.</p>
      </div>

      <div *ngIf="summary.orders.length" class="grid gap-5">
        <article
          *ngFor="let order of summary.orders; trackBy: trackByOrder"
          class="app-card p-6"
        >
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-lg font-black text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(order.orderStatus)">
                  {{ order.orderStatus || 'Processing' }}
                </span>
              </div>

              <div class="mt-4 grid gap-4 md:grid-cols-4">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Customer</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ customerName(order) }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Payment</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ order.paymentInfo?.status || 'Pending' }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">City</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress?.city || 'N/A' }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Items</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ itemCount(order) }}</p>
                </div>
              </div>

              <p class="mt-4 text-sm font-semibold text-slate-600">{{ itemSummary(order) }}</p>

              <div class="mt-5 space-y-3">
                <div
                  *ngFor="let item of order.orderItems || []; trackBy: trackByOrderItem"
                  class="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="min-w-0">
                      <p class="text-sm font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                      <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        SKU: {{ item.sku || 'N/A' }} | Qty: {{ item.quantity || 0 }}
                      </p>
                    </div>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
                        [ngModel]="item.orderItemStatus || 'Processing'"
                        [ngModelOptions]="{ standalone: true }"
                        (ngModelChange)="updateOrderItemStatus(order, item, $event)"
                        [disabled]="isBusy(statusBusyKey(order, item))"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <span
                        class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                        [ngClass]="statusClass(item.orderItemStatus)"
                      >
                        {{ item.orderItemStatus || 'Processing' }}
                      </span>
                    </div>
                  </div>
                  <p *ngIf="messageKey(order, item) && messageType(messageKey(order, item)) === 'success'" class="mt-3 text-sm font-semibold text-emerald-700">
                    {{ messageText(messageKey(order, item)) }}
                  </p>
                  <p *ngIf="messageKey(order, item) && messageType(messageKey(order, item)) === 'error'" class="mt-3 text-sm font-semibold text-rose-700">
                    {{ messageText(messageKey(order, item)) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex min-w-[220px] flex-col items-end gap-3">
              <p class="text-2xl font-black text-slate-900">{{ formatCurrency(order.totalAmount || 0) }}</p>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Created {{ formatDate(order.createdAt) }}
              </p>
              <button
                type="button"
                class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="isBusy(deleteBusyKey(order))"
                (click)="deleteOrder(order)"
              >
                {{ isBusy(deleteBusyKey(order)) ? 'Deleting...' : 'Delete Order' }}
              </button>
              <p *ngIf="deleteMessages[order._id || '']" class="text-right text-sm font-semibold text-rose-700">
                {{ deleteMessages[order._id || ''] }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class AdminOrdersPageComponent implements OnInit {
  summary: AdminOrdersResponse = {
    orders: [],
    totalRevenue: 0
  };
  isLoading = false;
  errorMessage = '';
  deletingUserId: string | null = null;
  busyStates: Record<string, boolean> = {};
  itemMessages: Record<string, { type: 'success' | 'error'; text: string }> = {};
  deleteMessages: Record<string, string> = {};

  constructor(
    private orderService: OrderService,
    private adminService: AdminService,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getAdminOrders().subscribe({
      next: (summary) => {
        this.isLoading = false;
        this.summary = summary;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Unable to load admin orders.';
      }
    });
  }

  isBusy(key: string): boolean {
    return !!this.busyStates[key];
  }

  statusBusyKey(order: OrderRecord, item: any): string {
    return `status-${order._id || 'order'}-${item?._id || item?.variantId || 'item'}`;
  }

  deleteBusyKey(order: OrderRecord): string {
    return `delete-${order._id || 'order'}`;
  }

  messageKey(order: OrderRecord, item: any): string {
    return `${order._id || 'order'}-${item?._id || item?.variantId || 'item'}`;
  }

  messageType(key: string): 'success' | 'error' | '' {
    return this.itemMessages[key]?.type || '';
  }

  messageText(key: string): string {
    return this.itemMessages[key]?.text || '';
  }

  updateOrderItemStatus(order: OrderRecord, item: any, status: string): void {
    const orderId = order._id;
    const orderItemId = item?._id;
    if (!orderId || !orderItemId || !status) {
      return;
    }

    const key = this.messageKey(order, item);
    this.busyStates[this.statusBusyKey(order, item)] = true;
    this.itemMessages[key] = { type: 'success', text: '' };

    this.orderService.updateOrderStatus(orderId, orderItemId, status).subscribe({
      next: (response) => {
        this.busyStates[this.statusBusyKey(order, item)] = false;
        item.orderItemStatus = status;
        if (response?.data) {
          const updatedOrder = response.data as OrderRecord;
          this.summary.orders = this.summary.orders.map((entry) =>
            entry._id === updatedOrder._id ? updatedOrder : entry
          );
        }
        this.itemMessages[key] = {
          type: 'success',
          text: response?.message || 'Order status updated successfully.'
        };
      },
      error: (error) => {
        this.busyStates[this.statusBusyKey(order, item)] = false;
        this.itemMessages[key] = {
          type: 'error',
          text: error.error?.message || 'Unable to update order status.'
        };
      }
    });
  }

  deleteOrder(order: OrderRecord): void {
    const orderId = order._id;
    if (!orderId) {
      return;
    }

    const confirmed = window.confirm('Delete this order? Stock will be restored for paid, non-delivered orders.');
    if (!confirmed) {
      return;
    }

    const key = this.deleteBusyKey(order);
    this.busyStates[key] = true;
    this.deleteMessages[orderId] = '';

    this.orderService.deleteOrderByAdmin(orderId).subscribe({
      next: (response) => {
        this.busyStates[key] = false;
        this.summary.orders = this.summary.orders.filter((entry) => entry._id !== orderId);
        if (response?.message) {
          this.deleteMessages[orderId] = response.message;
        }
      },
      error: (error) => {
        this.busyStates[key] = false;
        this.deleteMessages[orderId] = error.error?.message || 'Unable to delete order.';
      }
    });
  }

  countByStatus(status: string): number {
    return this.summary.orders.filter((order) => order.orderStatus === status).length;
  }

  customerName(order: OrderRecord): string {
    if (order.user && typeof order.user === 'object') {
      return order.user.fullName || order.user.fullname || order.user.username || order.user.email || 'Customer';
    }
    return 'Customer';
  }

  customerId(order: OrderRecord): string {
    if (order.user && typeof order.user === 'object') {
      return order.user._id || '';
    }
    return typeof order.user === 'string' ? order.user : '';
  }

  deleteCustomer(order: OrderRecord): void {
    const userId = this.customerId(order);
    if (!userId || this.deletingUserId) {
      return;
    }

    this.errorMessage = '';
    this.deletingUserId = userId;

    this.adminService.deleteUser(userId).subscribe({
      next: (response) => {
        this.deletingUserId = null;
        this.summary.orders = this.summary.orders.filter((entry) => this.customerId(entry) !== userId);
        this.errorMessage = '';
        if (!response?.success) {
          this.errorMessage = response?.message || 'User delete request completed with warnings.';
          return;
        }

        this.appRefreshService.notify('admin');
      },
      error: (error) => {
        this.deletingUserId = null;
        this.errorMessage = error.error?.message || 'Unable to delete this user.';
      }
    });
  }

  itemCount(order: OrderRecord): number {
    return (order.orderItems || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  itemSummary(order: OrderRecord): string {
    const names = (order.orderItems || []).map((item) => item.name).filter(Boolean);
    if (!names.length) {
      return 'Order items unavailable';
    }

    return names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ');
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
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

  trackByOrderItem(index: number, item: any): string {
    return item._id || item.variantId || String(index);
  }
}
