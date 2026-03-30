import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OrderRecord } from '../../core/models/order.models';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-64px)] bg-slate-50">
      <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Order History</p>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">My orders</h1>
            <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              Track order status, review delivery details, and open any order for a full breakdown.
            </p>
          </div>

          <div class="flex gap-3">
            <a routerLink="/cart" class="btn-secondary !px-5 !py-3">Go To Cart</a>
            <a routerLink="/" class="btn-primary !px-5 !py-3">Continue Shopping</a>
          </div>
        </div>

        <div *ngIf="errorMessage" class="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="mt-10 text-sm font-semibold text-slate-500">Loading your orders...</div>

        <div *ngIf="!isLoading && orders.length === 0" class="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <h2 class="text-2xl font-black text-slate-900">No orders yet</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">Your completed checkouts will appear here.</p>
          <a routerLink="/" class="btn-primary mt-6 inline-flex !px-6 !py-3">Start Shopping</a>
        </div>

        <div *ngIf="orders.length" class="mt-8 grid gap-5">
          <article
            *ngFor="let order of orders; trackBy: trackByOrder"
            class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          >
            <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-3">
                  <p class="text-lg font-black text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                  <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(order.orderStatus)">
                    {{ order.orderStatus || 'Processing' }}
                  </span>
                </div>
                <p class="mt-2 text-sm font-medium text-slate-500">
                  Placed on {{ formatDate(order.createdAt) }} • {{ itemCount(order) }} items
                </p>
                <p class="mt-3 text-sm font-semibold text-slate-700">{{ orderItemPreview(order) }}</p>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <p class="text-2xl font-black text-slate-900">{{ formatCurrency(order.totalAmount || 0) }}</p>
                <div class="flex gap-3">
                  <a [routerLink]="['/orders', order._id]" class="btn-secondary !px-5 !py-3">View Details</a>
                  <button
                    *ngIf="canCancel(order)"
                    type="button"
                    class="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100"
                    (click)="cancelOrder(order)"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders: OrderRecord[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.isLoading = false;
        this.orders = orders;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Unable to load your orders.';
      }
    });
  }

  cancelOrder(order: OrderRecord): void {
    if (!order._id) {
      return;
    }

    const confirmed = window.confirm(`Cancel order #${this.shortOrderId(order._id)}?`);
    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.cancelOrder(order._id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Order cancelled successfully.';
        this.loadOrders();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Unable to cancel this order.';
      }
    });
  }

  canCancel(order: OrderRecord): boolean {
    return order.orderStatus === 'Processing';
  }

  itemCount(order: OrderRecord): number {
    return (order.orderItems || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  orderItemPreview(order: OrderRecord): string {
    const names = (order.orderItems || []).map((item) => item.name).filter(Boolean);
    if (!names.length) {
      return 'Order items will appear here.';
    }

    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ');
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
}
