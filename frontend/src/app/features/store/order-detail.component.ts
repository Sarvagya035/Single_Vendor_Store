import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderItemRecord, OrderRecord, OrderStatus } from '../../core/models/order.models';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-64px)] bg-slate-50">
      <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Order Details</p>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">Order #{{ shortOrderId(order?._id) }}</h1>
            <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
              Review items, shipping details, and payment status for this order.
            </p>
          </div>

          <div class="flex gap-3">
            <a [routerLink]="backLink" class="btn-secondary !px-5 !py-3">Back To Orders</a>
            <button
              *ngIf="canCancel()"
              type="button"
              class="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100"
              (click)="cancelOrder()"
            >
              Cancel Order
            </button>
          </div>
        </div>

        <div *ngIf="successMessage" class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="mt-10 text-sm font-semibold text-slate-500">Loading order details...</div>

        <div *ngIf="!isLoading && order" class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section class="space-y-6">
            <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Status</p>
                  <h2 class="mt-2 text-2xl font-black text-slate-900">Order progress</h2>
                </div>
                <span class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(displayStatus)">
                  {{ displayStatus }}
                </span>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-2">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Placed On</p>
                  <p class="mt-3 text-base font-black text-slate-900">{{ formatDate(order.createdAt) }}</p>
                </div>

                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Payment</p>
                  <p class="mt-3 text-base font-black text-slate-900">{{ isVendorView() ? 'Handled by marketplace' : (order.paymentInfo?.status || 'Pending') }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div class="border-b border-slate-100 pb-4">
                <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Items</p>
                <h2 class="mt-2 text-2xl font-black text-slate-900">Purchased products</h2>
              </div>

              <div class="mt-5 space-y-4">
                <article
                  *ngFor="let item of visibleItems; trackBy: trackByItem"
                  class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-lg font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                      <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-base font-black text-slate-900">{{ formatCurrency(itemTotal(item)) }}</p>
                      <p class="mt-2 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(item.orderItemStatus)">
                        {{ item.orderItemStatus || 'Processing' }}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <aside class="space-y-6">
            <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Delivery</p>
              <h2 class="mt-2 text-2xl font-black text-slate-900">Shipping address</h2>
              <p class="mt-4 text-sm font-medium leading-7 text-slate-600">
                {{ order.shippingAddress?.address || 'Address unavailable' }}
              </p>
              <p class="mt-2 text-sm font-semibold text-slate-700">
                {{ order.shippingAddress?.city || '-' }}, {{ order.shippingAddress?.pincode || '-' }}
              </p>
              <p class="mt-2 text-sm font-semibold text-slate-700">{{ order.shippingAddress?.phone || '-' }}</p>
            </div>

            <div class="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
              <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                {{ isVendorView() ? 'Vendor Summary' : 'Bill Summary' }}
              </p>
              <div class="mt-6 space-y-3 text-sm font-medium text-slate-300">
                <div class="flex items-center justify-between">
                  <span>{{ isVendorView() ? 'Visible Items' : 'Items' }}</span>
                  <span>{{ formatCurrency(displayItemsPrice) }}</span>
                </div>
                <div *ngIf="!isVendorView()" class="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{{ formatCurrency(order.shippingPrice || 0) }}</span>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span class="text-sm font-bold text-slate-300">{{ isVendorView() ? 'Vendor Total' : 'Total' }}</span>
                <span class="text-2xl font-black">{{ formatCurrency(displayTotal) }}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order: OrderRecord | null = null;
  isLoading = false;
  successMessage = '';
  currentRoles: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentRoles = this.normalizeRoles(user?.role);
    });

    if (!this.currentRoles.length) {
      this.authService.getCurrentUser().subscribe({
        error: () => {
          this.currentRoles = [];
        }
      });
    }

    this.loadOrder();
  }

  get backLink(): string {
    return this.isVendorView() ? '/vendor/orders' : '/orders';
  }

  get visibleItems(): OrderItemRecord[] {
    return this.order?.orderItems || [];
  }

  get displayStatus(): OrderStatus {
    if (!this.isVendorView()) {
      return this.order?.orderStatus || 'Processing';
    }

    const statuses = this.visibleItems.map((item) => item.orderItemStatus || 'Processing');

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

  get displayItemsPrice(): number {
    if (!this.isVendorView()) {
      return this.order?.itemsPrice || 0;
    }

    return this.visibleItems.reduce((sum, item) => sum + this.itemTotal(item), 0);
  }

  get displayTotal(): number {
    return this.displayItemsPrice + (this.isVendorView() ? 0 : (this.order?.shippingPrice || 0));
  }

  loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      this.errorService.showToast('Order id is missing.', 'error');
      return;
    }

    this.isLoading = true;

    this.orderService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.order = order;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  cancelOrder(): void {
    if (!this.order?._id) {
      return;
    }

    const confirmed = window.confirm(`Cancel order #${this.shortOrderId(this.order._id)}?`);
    if (!confirmed) {
      return;
    }

    this.orderService.cancelOrder(this.order._id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Order cancelled successfully.';
        this.loadOrder();
      },
      error: () => {}
    });
  }

  canCancel(): boolean {
    return !this.isVendorView() && this.order?.orderStatus === 'Processing';
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

  trackByItem(index: number, item: any): string {
    return item.variantId || item.product || String(index);
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

  isVendorView(): boolean {
    return this.currentRoles.includes('vendor');
  }

  private normalizeRoles(role: unknown): string[] {
    if (Array.isArray(role)) {
      return role.map((value) => String(value));
    }

    if (typeof role === 'string' && role.trim()) {
      return [role];
    }

    return [];
  }
}
