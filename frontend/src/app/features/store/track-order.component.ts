import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  OrderItemRecord,
  OrderRecord,
  ShipmentEventRecord,
  ShipmentRecord
} from '../../core/models/order.models';
import { ErrorService } from '../../core/services/error.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="storefront-section mt-4 space-y-6">
      <div class="storefront-container">
        <div class="vendor-page-shell overflow-hidden">
          <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="app-page-eyebrow !text-amber-700">Track Order</p>
            <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">Shipment tracking</h1>
            <p class="app-page-description !mt-3 !max-w-2xl">
              Follow courier movement and delivery progress for this order.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <a [routerLink]="orderLink" class="btn-secondary w-full justify-center !px-5 !py-3 sm:w-auto">Open Order</a>
            <a routerLink="/orders" class="btn-primary w-full justify-center !px-5 !py-3 sm:w-auto">Back To Orders</a>
          </div>
        </div>
          </div>

        <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">Loading tracking details...</div>

        <div *ngIf="!isLoading && order" class="bg-[#fffdfa] app-card-body">
          <div class="rounded-[2.25rem] border border-[#e7dac9] bg-white app-card-body shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#f1e4d4] pb-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Order</p>
                <h2 class="mt-2 text-2xl font-medium text-slate-900">#{{ shortOrderId(order._id) }}</h2>
                <p class="mt-2 text-sm font-medium text-slate-500">
                  Placed on {{ formatDate(order.createdAt) }} • {{ itemCount(order) }} item{{ itemCount(order) === 1 ? '' : 's' }}
                </p>
              </div>

              <span class="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.18em]" [ngClass]="statusClass(trackingStage)">
                {{ trackingStage }}
              </span>
            </div>

            <div class="mt-6">
              <div class="relative">
                <div class="absolute left-0 right-0 top-6 h-[2px] bg-[#d9e7df]"></div>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
                  <div *ngFor="let step of trackingSteps; trackBy: trackByStep" class="relative z-10 text-center">
                    <div
                      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-medium shadow-sm"
                      [ngClass]="stepCircleClass(step)"
                    >
                      <span *ngIf="step.completed">✓</span>
                      <span *ngIf="!step.completed">{{ step.index + 1 }}</span>
                    </div>
                    <p class="mt-3 text-sm font-medium text-slate-900">{{ step.label }}</p>
                    <p class="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {{ step.time || 'Waiting' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 rounded-[1.75rem] border border-[#d9e7df] bg-[#f8fcf9] app-card-tight">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <span class="text-lg font-medium">✓</span>
                </div>
                <div class="min-w-0">
                  <p class="text-lg font-medium text-emerald-700">{{ bannerTitle }}</p>
                  <p class="mt-2 text-sm font-semibold leading-7 text-slate-700">{{ bannerMessage }}</p>
                  <p *ngIf="bannerDate" class="mt-2 text-sm font-medium text-slate-500">{{ bannerDate }}</p>
                </div>
              </div>
            </div>

            <div class="my-8 border-t border-dashed border-[#d8c7b4]"></div>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Items</p>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ itemCount(order) }} total</p>
              </div>

              <article
                *ngFor="let item of visibleItems; trackBy: trackByItem"
                class="flex flex-col gap-4 rounded-[1.5rem] border border-[#e7dac9] bg-white p-4 sm:flex-row sm:p-5"
              >
                <div class="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#eadfce] bg-[#fffaf4] sm:h-28 sm:w-28">
                  <img
                    *ngIf="item.variantImage; else noImage"
                    [src]="item.variantImage"
                    [alt]="item.name || 'Order item'"
                    class="h-full w-full object-cover"
                  />
                  <ng-template #noImage>
                    <div class="text-center">
                      <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">No image</p>
                    </div>
                  </ng-template>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Ordered on {{ formatDate(order.createdAt) }}
                  </p>
                  <h3 class="mt-2 text-lg font-medium text-slate-900">{{ item.name || 'Order item' }}</h3>
                  <p class="mt-2 text-sm font-semibold text-slate-600">Qty - {{ item.quantity || 0 }}</p>
                  <p class="mt-4 text-xl font-medium text-slate-900">{{ formatCurrency(itemTotal(item)) }}</p>
                </div>
              </article>
            </div>

            <div class="mt-8 grid gap-4 border-t border-[#f1e4d4] pt-6 md:grid-cols-2">
              <div class="rounded-[1.5rem] border border-[#e7dac9] bg-[#fff7ed]/70 p-5">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Shipping Address</p>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-600">
                  {{ order.shippingAddress?.address || 'Address unavailable' }}
                </p>
                <p class="mt-2 text-sm font-semibold text-slate-700">
                  {{ order.shippingAddress?.city || '-' }}, {{ order.shippingAddress?.pincode || '-' }}
                </p>
                <p class="mt-2 text-sm font-semibold text-slate-700">{{ order.shippingAddress?.phone || '-' }}</p>
              </div>

              <div class="rounded-[1.5rem] border border-[#e7dac9] bg-[#2f1b14] p-5 text-white">
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Payment</p>
                <div class="mt-4 space-y-3 text-sm font-medium text-slate-300">
                  <div class="flex items-center justify-between">
                    <span>Status</span>
                    <span>{{ order.paymentInfo?.status || 'Pending' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Courier</span>
                    <span>{{ shipment?.courierName || 'DHL' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Tracking</span>
                    <span>{{ shipment?.trackingNumber || 'Not assigned' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  `
})
export class TrackOrderComponent implements OnInit {
  order: OrderRecord | null = null;
  shipment: ShipmentRecord | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadTracking();
  }

  get orderLink(): string {
    return this.order?._id ? `/orders/${this.order._id}` : '/orders';
  }

  loadTracking(): void {
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
        this.shipment = order?.shipment || null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get visibleItems(): NonNullable<OrderRecord['orderItems']> {
    return this.order?.orderItems || [];
  }

  get trackingStage(): string {
    const stage = this.normalizeShipmentStatus(this.shipment?.shipmentStatus || this.order?.orderStatus);

    switch (stage) {
      case 'Delivered':
        return 'Delivered';
      case 'Out for Delivery':
        return 'Out For Delivery';
      case 'In Transit':
      case 'Picked Up':
      case 'Shipped':
        return 'Shipped';
      default:
        return 'Order Confirmed';
    }
  }

  get bannerTitle(): string {
    switch (this.normalizeShipmentStatus(this.shipment?.shipmentStatus || this.order?.orderStatus)) {
      case 'Delivered':
        return 'Delivered!';
      case 'Out for Delivery':
        return 'Out for delivery!';
      case 'In Transit':
      case 'Picked Up':
      case 'Shipped':
        return 'Shipped!';
      default:
        return 'Order Confirmed';
    }
  }

  get bannerMessage(): string {
    switch (this.normalizeShipmentStatus(this.shipment?.shipmentStatus || this.order?.orderStatus)) {
      case 'Delivered':
        return 'Your order was successfully delivered. We hope you enjoy your new purchase!';
      case 'Out for Delivery':
        return 'Your package is out for delivery and should reach you soon.';
      case 'In Transit':
      case 'Picked Up':
      case 'Shipped':
        return 'Your order has been shipped and is moving through the delivery network.';
      default:
        return 'Your order has been confirmed and is being prepared for shipment.';
    }
  }

  get bannerDate(): string {
    const stage = this.normalizeShipmentStatus(this.shipment?.shipmentStatus || this.order?.orderStatus);

    if (stage === 'Delivered' && this.shipment?.deliveredAt) {
      return this.formatDate(this.shipment.deliveredAt);
    }

    if (this.shipment?.estimatedDeliveryDate) {
      return this.formatDate(this.shipment.estimatedDeliveryDate);
    }

    return this.formatDate(this.order?.createdAt);
  }

  get trackingSteps(): Array<{ index: number; label: string; time: string; completed: boolean; active: boolean }> {
    const currentStage = this.normalizeShipmentStatus(this.shipment?.shipmentStatus || this.order?.orderStatus);
    const stageOrder = ['Order Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = this.resolveTrackingIndex(currentStage);

    return stageOrder.map((label, index) => ({
      index,
      label,
      time: this.getStepTime(label),
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  }

  itemCount(order: OrderRecord): number {
    return (order.orderItems || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  trackByItem(index: number, item: any): string {
    return item.variantId || item.product || String(index);
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

  formatDateTime(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item?.price || 0) * Number(item?.quantity || 0);
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Shipped':
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Order Confirmed':
        return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled':
      case 'Exception':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  }

  trackByEvent(index: number, event: ShipmentEventRecord): string {
    return `${event.status}-${event.eventTime || index}`;
  }

  trackByStep(index: number, step: { index: number; label: string }): string {
    return `${step.label}-${index}`;
  }

  stepCircleClass(step: { completed: boolean; active: boolean }): string {
    if (step.completed) {
      return 'border-emerald-600 bg-emerald-600 text-white';
    }

    if (step.active) {
      return 'border-emerald-600 bg-white text-emerald-600';
    }

    return 'border-[#d9e7df] bg-white text-slate-300';
  }

  private resolveTrackingIndex(status?: string): number {
    switch (this.normalizeShipmentStatus(status)) {
      case 'Delivered':
        return 3;
      case 'Out for Delivery':
        return 2;
      case 'In Transit':
      case 'Picked Up':
      case 'Shipped':
        return 1;
      default:
        return 0;
    }
  }

  private normalizeShipmentStatus(status?: string): string {
    const value = String(status || '').trim().toLowerCase();

    if (value === 'delivered') return 'Delivered';
    if (value === 'out for delivery') return 'Out for Delivery';
    if (value === 'in transit') return 'In Transit';
    if (value === 'picked up') return 'Picked Up';
    if (value === 'shipped') return 'Shipped';
    if (value === 'processing' || value === 'created') return 'Order Confirmed';
    if (value === 'cancelled') return 'Cancelled';
    if (value === 'exception') return 'Exception';

    return 'Order Confirmed';
  }

  private getStepTime(label: string): string {
    switch (label) {
      case 'Order Confirmed':
        return this.formatDateTime(this.order?.paidAt || this.order?.createdAt);
      case 'Shipped':
        return this.findEventTime(['Shipped', 'Picked Up', 'Shipment Created']);
      case 'Out for Delivery':
        return this.findEventTime(['Out for Delivery']);
      case 'Delivered':
        return this.formatDateTime(this.shipment?.deliveredAt || this.order?.deliveredAt);
      default:
        return 'Waiting';
    }
  }

  private findEventTime(candidates: string[]): string {
    const events = this.shipment?.trackingEvents || [];
    const match = events.find((event) =>
      candidates.some((candidate) => this.eventMatches(event, candidate))
    );

    return match?.eventTime ? this.formatDateTime(match.eventTime) : 'Waiting';
  }

  private eventMatches(event: ShipmentEventRecord, candidate: string): boolean {
    const value = `${event.status || ''} ${event.description || ''}`.toLowerCase();
    return value.includes(candidate.toLowerCase());
  }
}
