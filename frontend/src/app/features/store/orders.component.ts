import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderRecord } from '../../core/models/order.models';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="mt-4 space-y-6 px-4 sm:mt-5 sm:px-6 lg:mt-6 lg:px-8">
      <div class="mx-auto w-full max-w-7xl">
        <div class="vendor-page-shell overflow-hidden">
          <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-2xl">
              <p class="app-page-eyebrow !text-amber-700">Order History</p>
              <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">My orders</h1>
              <p class="app-page-description !mt-3 !max-w-2xl">
                Track order status, review delivery details, and open any order for a full breakdown.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <a routerLink="/cart" class="btn-secondary !px-5 !py-3">Go To Cart</a>
              <a routerLink="/" class="btn-primary !px-5 !py-3">Continue Shopping</a>
            </div>
          </div>
          </div>

        <div *ngIf="successMessage" class="mx-4 mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 sm:mx-5 lg:mx-6">
          {{ successMessage }}
        </div>

        <div class="border-t border-slate-200 bg-[#fffdfa] p-4 sm:p-5 lg:p-6">
        <div class="rounded-[1.75rem] border border-[#eadcc9] bg-white p-5 shadow-[0_20px_60px_rgba(111,78,55,0.06)] sm:p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">Search Orders</p>
              <h2 class="mt-2 text-2xl font-medium tracking-tight text-slate-900">Find an order fast</h2>
              <p class="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                Search by order number, item name, city, pincode, or status.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-[#e7dac9] bg-[#fff7ed] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#6f4e37]">
                {{ filteredOrders.length }} visible
              </span>
              <span class="rounded-full border border-[#e7dac9] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                {{ orders.length }} total
              </span>
              <button
                *ngIf="searchTerm"
                type="button"
                class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                (click)="clearSearch()"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="mt-5 flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-[#fffaf5] px-4 py-3 shadow-inner focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100">
            <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-slate-400">
              <path fill="currentColor" d="M10 4a6 6 0 104.472 10.007l4.26 4.261 1.414-1.414-4.26-4.26A6 6 0 0010 4Zm0 2a4 4 0 110 8 4 4 0 010-8Z" />
            </svg>
            <input
              id="order-search"
              [(ngModel)]="searchTerm"
              name="orderSearch"
              type="search"
              placeholder="Search by order ID, status, item name, city, or pincode"
              class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <p class="mt-3 text-sm font-medium text-slate-500">
            Showing {{ filteredOrders.length }} of {{ orders.length }} order{{ orders.length === 1 ? '' : 's' }}.
          </p>
        </div>
        </div>

        <div *ngIf="isLoading" class="px-4 pb-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">Loading your orders...</div>

        <div *ngIf="!isLoading && orders.length === 0" class="px-4 pb-10 sm:px-5 lg:px-6">
        <div class="rounded-[2rem] border border-dashed border-[#e7dac9] bg-white px-8 py-16 text-center">
          <h2 class="text-2xl font-medium text-slate-900">No orders yet</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">Your completed checkouts will appear here.</p>
          <a routerLink="/" class="btn-primary mt-6 inline-flex !px-6 !py-3">Start Shopping</a>
        </div>
        </div>

        <div *ngIf="!isLoading && orders.length > 0 && filteredOrders.length === 0" class="px-4 pb-10 sm:px-5 lg:px-6">
        <div class="rounded-[2rem] border border-dashed border-[#e7dac9] bg-white px-8 py-16 text-center shadow-[0_16px_40px_rgba(111,78,55,0.04)]">
          <h2 class="text-2xl font-medium text-slate-900">No matching orders</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">
            Try a different order number, item name, city, or status.
          </p>
          <button type="button" class="btn-primary mt-6 inline-flex !px-6 !py-3" (click)="clearSearch()">Clear search</button>
        </div>
        </div>

        <div *ngIf="filteredOrders.length" class="grid gap-5 px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
          <article
            *ngFor="let order of filteredOrders; trackBy: trackByOrder"
            class="rounded-[2rem] border border-[#e7dac9] bg-white p-6 shadow-[0_18px_50px_rgba(111,78,55,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(111,78,55,0.09)]"
          >
            <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <p class="text-lg font-medium text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                  <span class="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]" [ngClass]="statusClass(order.orderStatus)">
                    {{ order.orderStatus || 'Processing' }}
                  </span>
                </div>

                <div class="mt-4 grid gap-4 sm:grid-cols-3">
                  <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                    <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Placed on</p>
                    <p class="mt-2 text-sm font-medium text-slate-900">{{ formatDate(order.createdAt) }}</p>
                  </div>
                  <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                    <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Items</p>
                    <p class="mt-2 text-sm font-medium text-slate-900">{{ itemCount(order) }} item{{ itemCount(order) === 1 ? '' : 's' }}</p>
                  </div>
                  <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                    <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Delivery</p>
                    <p class="mt-2 text-sm font-medium text-slate-900">{{ order.shippingAddress?.city || 'Shipping address' }}</p>
                  </div>
                </div>

                <div class="mt-4 rounded-[1.4rem] border border-[#f1e4d4] bg-[#fffaf5] px-4 py-4">
                  <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Items in this order</p>
                  <p class="mt-2 text-sm font-semibold leading-7 text-slate-700">{{ orderItemPreview(order) }}</p>
                </div>
              </div>

              <div class="flex min-w-[240px] flex-col gap-4 xl:items-end">
                <div class="text-right">
                  <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Total</p>
                  <p class="mt-2 text-3xl font-medium tracking-tight text-slate-900">{{ formatCurrency(displayOrderTotal(order)) }}</p>
                </div>

                <div class="flex flex-wrap gap-3 xl:justify-end">
                  <a [routerLink]="['/track-order', order._id]" class="btn-primary !px-5 !py-3">Track</a>
                  <a [routerLink]="['/orders', order._id]" class="btn-secondary !px-5 !py-3">View Details</a>
                  <button
                    *ngIf="canCancel(order)"
                    type="button"
                    class="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                    (click)="cancelOrder(order)"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
        </div>
      </div>
    </section>
  `
})
export class OrdersComponent implements OnInit {
  orders: OrderRecord[] = [];
  isLoading = false;
  successMessage = '';
  searchTerm = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get filteredOrders(): OrderRecord[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.orders;
    }

    return this.orders.filter((order) => this.matchesSearch(order, term));
  }

  loadOrders(): void {
    this.isLoading = true;

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.isLoading = false;
        this.orders = orders;
      },
      error: () => {
        this.isLoading = false;
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

    this.successMessage = '';

    this.orderService.cancelOrder(order._id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Order cancelled successfully.';
        this.loadOrders();
      },
      error: () => {}
    });
  }

  canCancel(order: OrderRecord): boolean {
    return order.orderStatus === 'Processing';
  }

  itemCount(order: OrderRecord): number {
    return (order.orderItems || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  displayOrderTotal(order: OrderRecord): number {
    return Number(order.itemsPrice || 0) + Number(order.shippingPrice || 0);
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

  clearSearch(): void {
    this.searchTerm = '';
  }

  private matchesSearch(order: OrderRecord, term: string): boolean {
    const haystacks = [
      order._id,
      this.shortOrderId(order._id),
      order.orderStatus,
      order.createdAt,
      order.updatedAt,
      order.paidAt,
      order.deliveredAt,
      order.shippingAddress?.address,
      order.shippingAddress?.city,
      order.shippingAddress?.pincode,
      order.shippingAddress?.phone,
      ...(order.orderItems || []).flatMap((item) => [
        item.name,
        item.sku,
        item.vendor,
        item.product,
        item.variantId,
        item.orderItemStatus
      ])
    ];

    return haystacks.some((value) => String(value || '').toLowerCase().includes(term));
  }
}

