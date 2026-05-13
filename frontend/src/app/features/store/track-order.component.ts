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
import { BadgeComponent as AppBadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent as AppButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent as AppCardComponent } from '../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, RouterModule, AppBadgeComponent, AppButtonComponent, AppCardComponent, PageHeaderComponent],
  template: `
    <section class="storefront-section overflow-x-hidden">
      <div class="store-page store-page-stack">
          <app-card cardClass="p-6 sm:p-8">
            <app-page-header
              eyebrow="Track Order"
              title="Shipment tracking"
              description="Follow courier movement and delivery progress for this order."
            >
              <app-button [routerLink]="orderLink" variant="secondary" type="button" buttonClass="w-full justify-center sm:w-auto">Open Order</app-button>
              <app-button routerLink="/orders" variant="primary" type="button" buttonClass="w-full justify-center sm:w-auto">Back To Orders</app-button>
            </app-page-header>
          </app-card>

          <div *ngIf="isLoading" class="text-sm font-semibold text-slate-500">
            Loading tracking details...
          </div>

          <div *ngIf="!isLoading && order">
            <div class="store-page-stack">
              <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#f1e4d4] pb-4">
                <div class="min-w-0">
                  <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Order</p>
                  <h2 class="mt-2 break-all text-2xl font-medium text-slate-900">#{{ shortOrderId(order._id) }}</h2>
                  <p class="mt-2 text-sm font-medium text-slate-500">
                    Placed on {{ formatDate(order.createdAt) }} • {{ itemCount(order) }} item{{ itemCount(order) === 1 ? '' : 's' }}
                  </p>
                </div>

                <app-badge [tone]="statusTone(trackingStage)" badgeClass="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.18em]">
                  {{ trackingStage }}
                </app-badge>
              </div>

              <div class="mt-6">
                <div class="store-page-stack md:hidden">
                  <div *ngFor="let step of trackingSteps; let last = last; trackBy: trackByStep" class="flex items-start gap-3">
                    <div class="flex flex-col items-center">
                      <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 text-sm font-medium shadow-sm"
                        [ngClass]="stepCircleClass(step)"
                      >
                        <span *ngIf="step.completed">✓</span>
                        <span *ngIf="!step.completed">{{ step.index + 1 }}</span>
                      </div>
                      <div *ngIf="!last" class="mt-2 h-full min-h-6 w-px bg-[#d9e7df]"></div>
                    </div>
                    <div class="min-w-0 flex-1 pt-1">
                      <p class="text-sm font-medium text-slate-900">{{ step.label }}</p>
                      <p class="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {{ step.time || 'Waiting' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="relative hidden md:block">
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

              <app-card cardClass="rounded-[1.75rem] border border-[#d9e7df] bg-[#f8fcf9] p-5">
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
              </app-card>

              <div class="my-8 border-t border-dashed border-[#d8c7b4]"></div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Items</p>
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ itemCount(order) }} total</p>
                </div>

                <article
                  *ngFor="let item of visibleItems; trackBy: trackByItem"
                  class="flex flex-col gap-4 app-card bg-white p-4 sm:flex-row sm:p-5"
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

              <div class="store-page-grid border-t border-[#f1e4d4] pt-6 md:grid-cols-2">
                <app-card cardClass="bg-[#fff7ed]/70 p-5">
                  <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Shipping Address</p>
                  <p class="mt-3 text-sm font-medium leading-7 text-slate-600">
                    {{ order.shippingAddress?.address || 'Address unavailable' }}
                  </p>
                  <p class="mt-2 text-sm font-semibold text-slate-700">
                    {{ order.shippingAddress?.city || '-' }}, {{ order.shippingAddress?.pincode || '-' }}
                  </p>
                  <p class="mt-2 text-sm font-semibold text-slate-700">{{ order.shippingAddress?.phone || '-' }}</p>
                </app-card>

                <app-card cardClass="rounded-[1.5rem] border border-[#2f1b14] bg-[#2f1b14] p-5 text-white">
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
                </app-card>
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

  statusTone(status?: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Order Confirmed':
        return 'neutral';
      case 'Cancelled':
      case 'Exception':
        return 'danger';
      default:
        return 'warning';
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
