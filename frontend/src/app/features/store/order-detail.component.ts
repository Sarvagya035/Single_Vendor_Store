import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderItemRecord, OrderRecord, OrderStatus } from '../../core/models/order.models';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';

interface OrderTimelineStep {
  key: OrderStatus;
  label: string;
  description: string;
}

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

        <div *ngIf="errorMessage" class="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {{ errorMessage }}
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
                  <p class="mt-3 text-base font-black text-slate-900">{{ order.paymentInfo?.status || 'Pending' }}</p>
                  <p class="mt-2 text-xs font-semibold text-slate-500">{{ trackingSummary }}</p>
                </div>
              </div>

              <div class="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5">
                <div class="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Tracking</p>
                    <h3 class="mt-2 text-xl font-black text-slate-900">Delivery timeline</h3>
                  </div>
                  <p class="text-sm font-medium text-slate-500">
                    {{ trackingDescription }}
                  </p>
                </div>

                <div *ngIf="displayStatus === 'Cancelled'" class="mt-4 rounded-[1.25rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  This order was cancelled. Tracking is paused and inventory has been restored.
                </div>

                <div class="mt-5 grid gap-4 md:grid-cols-4">
                  <article
                    *ngFor="let step of timelineSteps; trackBy: trackByStep"
                    class="rounded-[1.35rem] border p-4"
                    [ngClass]="timelineStepClass(step.key)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-xs font-black uppercase tracking-[0.18em]">{{ step.label }}</p>
                      <span class="h-3 w-3 rounded-full" [ngClass]="timelineDotClass(step.key)"></span>
                    </div>
                    <p class="mt-3 text-sm font-medium leading-6">{{ step.description }}</p>
                    <p class="mt-4 text-xs font-bold uppercase tracking-[0.18em]" [ngClass]="timelineStepTextClass(step.key)">
                      {{ timelineStepState(step.key) }}
                    </p>
                  </article>
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

              <div class="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Need help?</p>
                <h3 class="mt-2 text-lg font-black text-slate-900">Track this order anytime</h3>
                <p class="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Open this order again from your order history to see the current step, item status, and shipping details in one place.
                </p>
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
                Bill Summary
              </p>
              <div class="mt-6 space-y-3 text-sm font-medium text-slate-300">
                <div class="flex items-center justify-between">
                  <span>Items</span>
                  <span>{{ formatCurrency(displayItemsPrice) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{{ formatCurrency(order.taxPrice || 0) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{{ formatCurrency(order.shippingPrice || 0) }}</span>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span class="text-sm font-bold text-slate-300">Total</span>
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
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  get backLink(): string {
    return '/orders';
  }

  get visibleItems(): OrderItemRecord[] {
    return this.order?.orderItems || [];
  }

  get displayStatus(): OrderStatus {
    return this.order?.orderStatus || 'Processing';
  }

  get displayItemsPrice(): number {
    return this.order?.itemsPrice || 0;
  }

  get displayTotal(): number {
    return this.order?.totalAmount || 0;
  }

  get timelineSteps(): OrderTimelineStep[] {
    return [
      {
        key: 'Processing',
        label: 'Processing',
        description: 'Your order has been received and is being prepared for fulfillment.'
      },
      {
        key: 'Shipped',
        label: 'Shipped',
        description: 'The package has left the warehouse and is on the way.'
      },
      {
        key: 'Delivered',
        label: 'Delivered',
        description: 'The order reached the delivery address successfully.'
      },
      {
        key: 'Cancelled',
        label: 'Cancelled',
        description: 'The order was cancelled before completion.'
      }
    ];
  }

  get trackingSummary(): string {
    if (!this.order) {
      return 'Tracking details appear after payment is confirmed.';
    }

    if (this.order.orderStatus === 'Cancelled') {
      return 'This order was cancelled and will not move to shipping.';
    }

    if (this.order.orderStatus === 'Delivered') {
      return this.order.deliveredAt
        ? `Delivered on ${this.formatDate(this.order.deliveredAt)}.`
        : 'Delivered successfully.';
    }

    if (this.order.orderStatus === 'Shipped') {
      return 'Your package is with the carrier and on the way.';
    }

    return this.order.paymentInfo?.status === 'Paid'
      ? 'Payment confirmed. Tracking will update as the order moves forward.'
      : 'Waiting for payment confirmation before tracking begins.';
  }

  get trackingDescription(): string {
    if (!this.order) {
      return 'Progress updates will appear here once the order is loaded.';
    }

    switch (this.order.orderStatus) {
      case 'Delivered':
        return 'Completed journey from placement to delivery.';
      case 'Shipped':
        return 'Your order is moving through the delivery network.';
      case 'Cancelled':
        return 'No further updates are expected for a cancelled order.';
      default:
        return 'Watch your order move from processing to shipping and delivery.';
    }
  }

  loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      this.errorMessage = 'Order id is missing.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.order = order;
        if (!order) {
          this.errorMessage = 'Order not found.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Unable to load order details.';
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
      error: (error) => {
        this.errorMessage = error.error?.message || 'Unable to cancel this order.';
      }
    });
  }

  canCancel(): boolean {
    return this.order?.orderStatus === 'Processing';
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

  timelineStepState(step: OrderStatus): string {
    if (this.displayStatus === 'Cancelled') {
      return step === 'Cancelled' ? 'Cancelled' : 'Paused';
    }

    const orderProgress = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = orderProgress.indexOf(this.displayStatus);
    const stepIndex = orderProgress.indexOf(step);

    if (step === 'Cancelled') {
      return 'Only if cancelled';
    }

    if (currentIndex === -1) {
      return step === 'Processing' ? 'Current' : 'Upcoming';
    }

    if (stepIndex < currentIndex) {
      return 'Completed';
    }

    if (stepIndex === currentIndex) {
      return 'Current';
    }

    return 'Upcoming';
  }

  timelineStepClass(step: OrderStatus): string {
    const state = this.timelineStepState(step);

    if (state === 'Completed') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (state === 'Current') {
      return 'border-sky-200 bg-sky-50 text-sky-700';
    }

    if (state === 'Paused' || step === 'Cancelled') {
      return 'border-rose-200 bg-rose-50 text-rose-700';
    }

    return 'border-slate-200 bg-white text-slate-600';
  }

  timelineStepTextClass(step: OrderStatus): string {
    const state = this.timelineStepState(step);
    if (state === 'Completed') {
      return 'text-emerald-700';
    }
    if (state === 'Current') {
      return 'text-sky-700';
    }
    if (state === 'Paused' || step === 'Cancelled') {
      return 'text-rose-700';
    }
    return 'text-slate-500';
  }

  timelineDotClass(step: OrderStatus): string {
    const state = this.timelineStepState(step);
    if (state === 'Completed') {
      return 'bg-emerald-500';
    }
    if (state === 'Current') {
      return 'bg-sky-500';
    }
    if (state === 'Paused' || step === 'Cancelled') {
      return 'bg-rose-500';
    }
    return 'bg-slate-300';
  }

  trackByItem(index: number, item: any): string {
    return item.variantId || item.product || String(index);
  }

  trackByStep(_: number, step: OrderTimelineStep): string {
    return step.key;
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

}
