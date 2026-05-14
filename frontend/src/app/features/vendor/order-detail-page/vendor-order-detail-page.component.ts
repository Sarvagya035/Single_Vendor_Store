import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderItemRecord, OrderRecord, OrderStatus, OrderUserSummary } from '../../../core/models/order.models';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { OrderService } from '../../../core/services/order.service';
import { SocketService } from '../../../core/services/socket.service';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { StatCardComponent } from '../../../shared/ui/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, BadgeComponent, StatCardComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Vendor Order"
            [title]="'Order #' + shortOrderId(order?._id)"
            description="Review item totals, shipping details, payment status, and tracking from one clean vendor-friendly layout."
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          >
            <button
              *ngIf="canRefreshShipment()"
              type="button"
              (click)="refreshShipment()"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#7c5646] shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh Tracking
            </button>
            <a
              routerLink="/vendor/orders"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Back To Orders
            </a>
            <a
              *ngIf="order?._id as orderId"
              [routerLink]="trackOrderLink(orderId)"
              class="inline-flex items-center justify-center rounded-full bg-[#8B5E3C] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#754c30]"
            >
              Track Order
            </a>
          </app-page-header>
        </div>

        <div *ngIf="successMessage" class="vendor-section-body rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="vendor-section-body py-10 text-sm font-semibold text-slate-500">
          Loading vendor order details...
        </div>

        <div *ngIf="!isLoading && !order" class="vendor-section-body py-12 text-center">
          <h2 class="vendor-empty-title">Order not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            The order you selected may have been removed or the link is invalid.
          </p>
        </div>

        <ng-container *ngIf="!isLoading && order; else vendorEmptyState">
          <div class="vendor-section-body lg:py-6" *ngIf="order as currentOrder">
            <div class="vendor-grid-3 items-stretch">
              <app-stat-card label="Order Total" [value]="formatCurrency(displayTotal(currentOrder))" cardClass="!border-amber-100 !bg-[#fff7ed]/80" />
              <app-stat-card label="Items" [value]="visibleItems(currentOrder).length.toString()" cardClass="!border-amber-100 !bg-[#fff7ed]/80" />
              <app-stat-card label="Status" [value]="displayStatus(currentOrder)" cardClass="!border-amber-100 !bg-[#fff7ed]/80" />
            </div>

            <div class="vendor-section-body lg:py-6">
              <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
                <div class="min-w-0 space-y-6">
                  <section class="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(47,27,20,0.04)]">
                    <div class="flex items-end justify-between gap-4 border-b border-[#eee2d4] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
                      <div class="min-w-0">
                        <p class="vendor-stat-label">Order Items</p>
                        <h2 class="vendor-panel-title mt-2">Purchased products</h2>
                      </div>
                      <p class="shrink-0 text-sm font-medium text-slate-500">
                        {{ visibleItems(currentOrder).length }} item{{ visibleItems(currentOrder).length === 1 ? '' : 's' }}
                      </p>
                    </div>

                    <div class="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                      <div *ngIf="visibleItems(currentOrder).length === 0" class="py-4 text-sm font-semibold text-slate-500">
                        No order items are attached to this order.
                      </div>

                      <div *ngIf="visibleItems(currentOrder).length" class="space-y-4">
                        <article
                          *ngFor="let item of visibleItems(currentOrder); trackBy: trackByItem"
                          class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] px-4 py-4 shadow-[0_12px_30px_rgba(47,27,20,0.04)] sm:px-5 sm:py-5"
                        >
                          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div class="min-w-0">
                              <p class="text-base font-black text-slate-900 sm:text-lg">{{ item.name || 'Order item' }}</p>
                              <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                              </p>
                            </div>

                            <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                              <span class="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                                {{ formatCurrency(itemTotal(item)) }}
                              </span>
                              <app-badge [tone]="statusTone(item.orderItemStatus)" badgeClass="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]">
                                {{ item.orderItemStatus || 'Processing' }}
                              </app-badge>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>
                  </section>
                </div>

                <aside class="min-w-0 space-y-6">
                  <section *ngIf="customerSummary(currentOrder)" class="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(47,27,20,0.04)]">
                    <div class="border-b border-[#eee2d4] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
                      <p class="vendor-stat-label">Customer</p>
                      <h2 class="vendor-panel-title mt-2">Order placed by</h2>
                    </div>

                    <div class="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                      <div class="rounded-[1.35rem] border border-slate-200 bg-[#fffaf4] p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Customer Name</p>
                        <p class="mt-2 text-sm font-black text-slate-900">
                          {{ customerLabel(currentOrder) }}
                        </p>

                        <p class="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Email</p>
                        <p class="mt-2 text-sm font-semibold text-slate-700">
                          {{ customerEmail(currentOrder) }}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section class="min-w-0 rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(47,27,20,0.04)]">
                    <div class="border-b border-[#eee2d4] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
                      <p class="vendor-stat-label">Delivery</p>
                      <h2 class="vendor-panel-title mt-2">Shipping address</h2>
                      <span
                        class="mt-3 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                        [ngClass]="currentOrder.shippingAddress ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                      >
                        {{ currentOrder.shippingAddress ? 'Address available' : 'No shipping address' }}
                      </span>
                    </div>

                    <div class="space-y-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                      <ng-container *ngIf="currentOrder.shippingAddress; else vendorNoShipping">
                        <div class="rounded-[1.35rem] border border-slate-200 bg-[#fffaf4] p-4">
                          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Address</p>
                          <p class="mt-2 text-sm font-black leading-6 text-slate-900">
                            {{ currentOrder.shippingAddress.address || 'Not provided' }}
                          </p>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div class="rounded-[1.35rem] border border-slate-200 bg-[#fffaf4] p-4">
                            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">City</p>
                            <p class="mt-2 text-sm font-black text-slate-900">{{ currentOrder.shippingAddress.address ? currentOrder.shippingAddress.city || 'Not provided' : 'Not provided' }}</p>
                          </div>
                          <div class="rounded-[1.35rem] border border-slate-200 bg-[#fffaf4] p-4">
                            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Pincode</p>
                            <p class="mt-2 text-sm font-black text-slate-900">{{ currentOrder.shippingAddress.address ? currentOrder.shippingAddress.pincode || 'Not provided' : 'Not provided' }}</p>
                          </div>
                        </div>

                        <div class="rounded-[1.35rem] border border-slate-200 bg-[#fffaf4] p-4">
                          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</p>
                          <p class="mt-2 text-sm font-black text-slate-900">{{ currentOrder.shippingAddress.address ? currentOrder.shippingAddress.phone || 'Not provided' : 'Not provided' }}</p>
                        </div>
                      </ng-container>
                    </div>

                    <ng-template #vendorNoShipping>
                      <div class="px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
                        <div class="rounded-[1.35rem] border border-dashed border-slate-200 bg-[#fffaf4] p-4">
                          <p class="text-sm font-semibold leading-7 text-slate-500">
                            Shipping address has not been attached to this order yet.
                          </p>
                        </div>
                      </div>
                    </ng-template>
                  </section>

                  <section class="rounded-[1.5rem] border border-[#2f1b14] bg-[#2f1b14] px-4 py-4 text-white shadow-[0_18px_50px_rgba(111,78,55,0.16)] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Vendor Summary</p>
                    <div class="mt-4 space-y-2.5 text-sm font-medium text-slate-300">
                      <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                        <span>Customer</span>
                        <span class="font-black text-white">{{ customerLabel(currentOrder) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                        <span>Visible Items</span>
                        <span class="font-black text-white">{{ formatCurrency(displayItemsPrice(currentOrder)) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                        <span>Payment</span>
                        <span class="font-black text-white">{{ currentOrder.paymentInfo?.status || 'Pending' }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-4 rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                        <span>Method</span>
                        <span class="font-black text-white">{{ currentOrder.paymentInfo?.method || 'Payment' }}</span>
                      </div>
                    </div>

                    <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <span class="text-sm font-bold text-slate-300">Vendor Total</span>
                      <span class="text-2xl font-black">{{ formatCurrency(displayTotal(currentOrder)) }}</span>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #vendorEmptyState>
          <ng-container></ng-container>
        </ng-template>
      </div>
    </section>
  `
})
export class VendorOrderDetailPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  order: OrderRecord | null = null;
  shipmentError = false;
  isLoading = false;
  successMessage = '';
  currentRoles: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private errorService: ErrorService,
    private socketService: SocketService
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

    this.socketService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if ((event.name === 'order:new' || event.name === 'order:status-updated') && this.isCurrentOrderEvent(event.payload)) {
          this.loadOrder();
        }
      });
  }

  get backLink(): string {
    return '/vendor/orders';
  }

  trackOrderLink(orderId?: string): string | string[] {
    if (!orderId) {
      return '/vendor/orders';
    }

    return ['/vendor/orders', orderId, 'tracking'];
  }

  visibleItems(order: OrderRecord | null): OrderItemRecord[] {
    return order?.orderItems || [];
  }

  displayStatus(order: OrderRecord | null): OrderStatus {
    const statuses = this.visibleItems(order).map((item) => item.orderItemStatus || 'Processing');

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

  displayItemsPrice(order: OrderRecord | null): number {
    return this.visibleItems(order).reduce((sum, item) => sum + this.itemTotal(item), 0);
  }

  displayTotal(order: OrderRecord | null): number {
    return this.displayItemsPrice(order);
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
        this.order = null;
      }
    });
  }

  refreshShipment(): void {
    if (!this.order?._id) {
      return;
    }

    this.orderService.syncShipmentStatus(this.order._id).subscribe({
      next: (shipment) => {
        if (this.order) {
          this.order = {
            ...this.order,
            shipment
          };
        }

        this.successMessage = 'Tracking updated successfully.';
      },
      error: () => {}
    });
  }

  canRefreshShipment(): boolean {
    return this.currentRoles.includes('admin') || this.currentRoles.includes('Admin');
  }

  customerSummary(order: OrderRecord | null): OrderUserSummary | null {
    const user = order?.user;

    if (!user || typeof user !== 'object') {
      return null;
    }

    return user;
  }

  customerLabel(order: OrderRecord | null): string {
    const user = this.customerSummary(order);

    if (!user) {
      return 'Customer';
    }

    return user.fullName || user.fullname || user.username || user.email || 'Customer';
  }

  customerEmail(order: OrderRecord | null): string {
    const user = this.customerSummary(order);
    return user?.email || 'No email available';
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  statusTone(status?: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
        return 'warning';
      case 'Cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  trackByItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
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

  private isCurrentOrderEvent(payload: unknown): boolean {
    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (!orderId || !payload || typeof payload !== 'object') {
      return false;
    }

    return String((payload as Record<string, unknown>)['orderId'] || '') === orderId;
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }
}
