import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  OrderItemRecord,
  OrderRecord,
  ShipmentEventRecord,
  ShipmentRecord
} from '../../../core/models/order.models';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { OrderService } from '../../../core/services/order.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-order-tracking-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Order Tracking"
            title="Vendor shipment tracking"
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          >
            <div class="vendor-page-actions w-full sm:w-auto">
              <a [routerLink]="orderLink" class="btn-secondary w-full !px-5 !py-3 sm:w-auto">Open Order</a>
              <a routerLink="/vendor/orders" class="btn-primary w-full !px-5 !py-3 sm:w-auto">Back To Orders</a>
              <button
                *ngIf="canRefreshShipment()"
                type="button"
                (click)="refreshShipment()"
                class="w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-800 transition hover:bg-amber-100 sm:w-auto"
              >
                Refresh Tracking
              </button>
            </div>
          </app-page-header>
        </div>

        <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">
          Loading vendor tracking details...
        </div>

        <div *ngIf="!isLoading && order" class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <div class="vendor-content">
            <section class="rounded-[1.85rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(47,27,20,0.05)] sm:p-6 lg:p-7">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
                      Shipment Overview
                    </span>
                    <span *ngIf="shipment?.isTestMode" class="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                      Test Mode
                    </span>
                  </div>
                  <h2 class="mt-4 text-[1.9rem] font-black tracking-tight text-slate-900 sm:text-[2.25rem]">
                    Order #{{ shortOrderId(order._id) }}
                  </h2>
                  <p class="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500">
                    Placed on {{ formatDate(order.createdAt) }} with {{ itemCount(order) }} item{{ itemCount(order) === 1 ? '' : 's' }}.
                  </p>
                </div>

                <div class="flex flex-col items-start gap-3 lg:items-end">
                  <span class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(trackingStage)">
                    {{ trackingStage }}
                  </span>
                  <p class="text-sm font-semibold text-slate-500">{{ bannerDate }}</p>
                </div>
              </div>

              <div class="vendor-grid-4 mt-6">
                <article class="rounded-[1.4rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Courier</p>
                  <p class="mt-3 text-lg font-black text-slate-900">{{ shipment?.courierName || 'DHL' }}</p>
                </article>
                <article class="rounded-[1.4rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Tracking Number</p>
                  <p class="mt-3 break-all text-base font-black text-slate-900">{{ shipment?.trackingNumber || 'Not assigned' }}</p>
                </article>
                <article class="rounded-[1.4rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Estimated Delivery</p>
                  <p class="mt-3 text-lg font-black text-slate-900">{{ shipment?.estimatedDeliveryDate ? formatDate(shipment?.estimatedDeliveryDate) : 'Not set' }}</p>
                </article>
                <article class="rounded-[1.4rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Updates</p>
                  <p class="mt-3 text-lg font-black text-slate-900">{{ shipment?.trackingEvents?.length || 0 }}</p>
                </article>
              </div>

              <div class="mt-6 rounded-[1.5rem] border border-[#e7dac9] bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf4_100%)] p-5">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div class="flex items-start gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                      <span class="text-lg font-black">✓</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-lg font-black text-emerald-700">{{ bannerTitle }}</p>
                      <p class="mt-2 text-sm font-semibold leading-7 text-slate-700">{{ bannerMessage }}</p>
                    </div>
                  </div>
                  <p class="text-sm font-semibold text-slate-500">{{ bannerDate }}</p>
                </div>
              </div>

              <div class="mt-6">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Progress Timeline</p>
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{{ trackingSteps.length }} stages</p>
                </div>

                <div class="mt-5 rounded-[1.5rem] border border-slate-200 bg-[#fffaf4] p-4 sm:p-5">
                  <div class="relative">
                    <div class="absolute left-6 right-6 top-6 hidden h-[2px] bg-[#d9e7df] md:block"></div>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div *ngFor="let step of trackingSteps; trackBy: trackByStep" class="relative z-10 rounded-[1.2rem] bg-white p-4 text-center shadow-[0_10px_24px_rgba(47,27,20,0.04)]">
                        <div
                          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-black shadow-sm"
                          [ngClass]="stepCircleClass(step)"
                        >
                          <span *ngIf="step.completed">✓</span>
                          <span *ngIf="!step.completed">{{ step.index + 1 }}</span>
                        </div>
                        <p class="mt-3 text-sm font-black text-slate-900">{{ step.label }}</p>
                        <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {{ step.time || 'Waiting' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div class="vendor-grid-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
              <section class="vendor-content">
                <div class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div class="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <p class="vendor-stat-label">Order Items</p>
                      <h3 class="vendor-panel-title mt-2">Purchased products</h3>
                    </div>
                    <p class="text-sm font-medium text-slate-500">{{ visibleItems.length }} item{{ visibleItems.length === 1 ? '' : 's' }}</p>
                  </div>

                  <div *ngIf="visibleItems.length === 0" class="py-8 text-sm font-semibold text-slate-500">
                    No order items are attached to this shipment yet.
                  </div>

                  <div *ngIf="visibleItems.length" class="mt-5 space-y-4">
                    <article
                      *ngFor="let item of visibleItems; trackBy: trackByItem"
                      class="rounded-[1.45rem] border border-slate-200 bg-[#fffaf4] p-4"
                    >
                      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="min-w-0">
                          <p class="text-base font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                          <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                          </p>
                        </div>

                        <div class="flex flex-wrap items-center gap-2">
                          <span class="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                            {{ formatCurrency(itemTotal(item)) }}
                          </span>
                          <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]" [ngClass]="statusClass(item.orderItemStatus)">
                            {{ item.orderItemStatus || 'Processing' }}
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>

                <div class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <p class="vendor-stat-label">Shipment Notes</p>
                      <h3 class="vendor-panel-title mt-2">Latest tracking events</h3>
                    </div>
                    <p class="text-sm font-medium text-slate-500">{{ shipment?.trackingEvents?.length || 0 }} update{{ (shipment?.trackingEvents?.length || 0) === 1 ? '' : 's' }}</p>
                  </div>

                  <div *ngIf="shipment?.trackingEvents?.length; else noEvents" class="mt-5 space-y-3">
                    <article
                      *ngFor="let event of shipment?.trackingEvents || []; trackBy: trackByEvent"
                      class="rounded-[1.3rem] border border-[#e7dac9] bg-[#fff7ed]/70 p-4"
                    >
                      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div class="min-w-0">
                          <p class="text-sm font-black text-slate-900">{{ event.status }}</p>
                          <p class="mt-1 text-sm font-medium text-slate-600">{{ event.description || 'Tracking update' }}</p>
                          <p *ngIf="event.location" class="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                            {{ event.location }}
                          </p>
                        </div>
                        <p class="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {{ formatDateTime(event.eventTime) }}
                        </p>
                      </div>
                    </article>
                  </div>

                  <ng-template #noEvents>
                    <div class="mt-5 rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-[#fff7ed]/50 p-5">
                      <p class="text-sm font-semibold text-slate-600">No tracking events recorded yet.</p>
                    </div>
                  </ng-template>
                </div>
              </section>

              <aside class="space-y-6">
                <div class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p class="vendor-stat-label">Delivery</p>
                  <h3 class="vendor-panel-title mt-2">Shipping address</h3>
                  <div class="mt-5 space-y-4">
                    <div class="rounded-[1.3rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                      <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Address</p>
                      <p class="mt-2 text-sm font-black leading-7 text-slate-900">
                        {{ order.shippingAddress?.address || 'Address unavailable' }}
                      </p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      <div class="rounded-[1.3rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">City</p>
                        <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress?.city || '-' }}</p>
                      </div>
                      <div class="rounded-[1.3rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Pincode</p>
                        <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress?.pincode || '-' }}</p>
                      </div>
                    </div>
                    <div class="rounded-[1.3rem] border border-[#eadcc9] bg-[#fffaf4] p-4">
                      <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</p>
                      <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress?.phone || '-' }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-[1.75rem] border border-[#2f1b14] bg-[#2f1b14] p-5 text-white shadow-[0_18px_50px_rgba(111,78,55,0.16)] sm:p-6">
                  <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Vendor Summary</p>
                  <div class="mt-5 space-y-3 text-sm font-medium text-slate-300">
                    <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span>Order Status</span>
                      <span class="font-black text-white">{{ order.orderStatus || 'Processing' }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span>Payment</span>
                      <span class="font-black text-white">{{ order.paymentInfo?.status || 'Pending' }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span>Courier</span>
                      <span class="font-black text-white">{{ shipment?.courierName || 'DHL' }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span>Tracking</span>
                      <span class="font-black text-white">{{ shipment?.trackingNumber || 'Not assigned' }}</span>
                    </div>
                  </div>

                  <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span class="text-sm font-bold text-slate-300">Items Total</span>
                    <span class="text-2xl font-black">{{ formatCurrency(orderTotal) }}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class VendorOrderTrackingPageComponent implements OnInit {
  order: OrderRecord | null = null;
  shipment: ShipmentRecord | null = null;
  isLoading = false;
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

    this.loadTracking();
  }

  get orderLink(): string {
    return this.order?._id ? `/vendor/orders/${this.order._id}` : '/vendor/orders';
  }

  get visibleItems(): OrderItemRecord[] {
    return this.order?.orderItems || [];
  }

  get orderTotal(): number {
    return this.visibleItems.reduce((sum, item) => sum + this.itemTotal(item), 0);
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
        return 'This order has been delivered and the shipment record is complete.';
      case 'Out for Delivery':
        return 'The courier is on the final stretch and the package should arrive soon.';
      case 'In Transit':
      case 'Picked Up':
      case 'Shipped':
        return 'The shipment is moving through the delivery network and is being tracked actively.';
      default:
        return 'The order has been confirmed and the shipment record is ready for updates.';
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

  refreshShipment(): void {
    if (!this.order?._id) {
      return;
    }

    this.orderService.syncShipmentStatus(this.order._id).subscribe({
      next: (shipment) => {
        this.shipment = shipment;
        if (this.order) {
          this.order = {
            ...this.order,
            shipment
          };
        }
      },
      error: () => {}
    });
  }

  canRefreshShipment(): boolean {
    return this.currentRoles.includes('admin') || this.currentRoles.includes('Admin');
  }

  itemCount(order: OrderRecord): number {
    return (order.orderItems || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

  trackByItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
  }

  trackByEvent(index: number, event: ShipmentEventRecord): string {
    return `${event.status}-${event.eventTime || index}`;
  }

  trackByStep(index: number, step: { index: number; label: string }): string {
    return `${step.label}-${index}`;
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

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Shipped':
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Order Confirmed':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
      case 'Exception':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
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
