import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderRecord } from '../../core/models/order.models';
import { OrderService } from '../../core/services/order.service';
import { SocketService } from '../../core/services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BadgeComponent as AppBadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent as AppButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent as AppCardComponent } from '../../shared/ui/card/card.component';
import { EmptyStateComponent as AppEmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppBadgeComponent, AppButtonComponent, AppCardComponent, AppEmptyStateComponent, PageHeaderComponent],
  template: `
    <section class="storefront-section">
      <div class="store-page store-page-stack">
        <app-card cardClass="p-6 sm:p-8">
          <app-page-header eyebrow="Order History" title="My Orders" eyebrowClass="text-amber-700">
            <app-button routerLink="/cart" variant="secondary" type="button" buttonClass="w-full justify-center sm:w-auto">Go To Cart</app-button>
            <app-button routerLink="/" variant="primary" type="button" buttonClass="w-full justify-center sm:w-auto">Continue Shopping</app-button>
          </app-page-header>
        </app-card>

        <div *ngIf="successMessage" class="rounded-[1.5rem] border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {{ successMessage }}
        </div>

        <app-card cardClass="p-6 sm:p-8">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">Search Orders</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <app-badge tone="warning" badgeClass="rounded-full border border-[#e7dac9] bg-[#fff7ed] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#6f4e37]">
                {{ filteredOrders.length }} visible
              </app-badge>
              <app-badge tone="neutral" badgeClass="rounded-full border border-[#e7dac9] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                {{ orders.length }} total
              </app-badge>
              <app-button
                *ngIf="searchTerm"
                type="button"
                variant="secondary"
                buttonClass="!px-4 !py-2.5"
                (click)="clearSearch()"
              >
                Clear
              </app-button>
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
        </app-card>

        <div *ngIf="isLoading" class="text-sm font-semibold text-slate-500">Loading your orders...</div>

        <div *ngIf="!isLoading && orders.length === 0">
          <app-empty-state title="No orders yet" description="Your completed checkouts will appear here.">
            <app-button routerLink="/" variant="primary" type="button">Start Shopping</app-button>
          </app-empty-state>
        </div>

        <div *ngIf="!isLoading && orders.length > 0 && filteredOrders.length === 0">
          <app-empty-state title="No matching orders" description="Try a different order number, item name, city, or status.">
            <app-button type="button" variant="primary" (click)="clearSearch()">Clear search</app-button>
          </app-empty-state>
        </div>

        <div *ngIf="filteredOrders.length" class="store-page-grid">
          <article
            *ngFor="let order of filteredOrders; trackBy: trackByOrder"
            class="app-card app-panel-body transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(111,78,55,0.09)]"
          >
            <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
              <p class="break-all text-lg font-medium text-slate-900 sm:break-normal sm:text-xl">Order #{{ shortOrderId(order._id) }}</p>
              <app-badge [tone]="statusTone(order.orderStatus)" badgeClass="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]">
                    {{ order.orderStatus || 'Processing' }}
              </app-badge>
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

              <div class="flex flex-col gap-4 xl:min-w-[240px] xl:items-end">
                <div class="text-right">
                  <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Total</p>
                  <p class="mt-2 text-3xl font-medium tracking-tight text-slate-900">{{ formatCurrency(displayOrderTotal(order)) }}</p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row xl:justify-end">
                  <app-button [routerLink]="['/track-order', order._id]" variant="primary" type="button" buttonClass="w-full justify-center sm:w-auto">Track</app-button>
                  <app-button [routerLink]="['/orders', order._id]" variant="secondary" type="button" buttonClass="w-full justify-center sm:w-auto">View Details</app-button>
                  <app-button
                    *ngIf="canCancel(order)"
                    type="button"
                    variant="secondary"
                    buttonClass="w-full justify-center text-rose-600 hover:text-rose-700 sm:w-auto"
                    (click)="cancelOrder(order)"
                  >
                    Cancel Order
                  </app-button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `
})
export class OrdersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  orders: OrderRecord[] = [];
  isLoading = false;
  successMessage = '';
  searchTerm = '';

  constructor(
    private orderService: OrderService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadOrders();

    this.socketService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.name === 'order:new' || event.name === 'order:status-updated') {
          this.loadOrders();
        }
      });
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

  statusTone(status?: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
        return 'neutral';
      case 'Cancelled':
        return 'danger';
      default:
        return 'warning';
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

