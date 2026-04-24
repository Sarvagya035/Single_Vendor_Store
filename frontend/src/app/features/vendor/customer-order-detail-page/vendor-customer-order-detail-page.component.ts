import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerUser } from '../../../core/models/customer.models';
import { OrderItemRecord, OrderRecord, OrderStatus } from '../../../core/models/order.models';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-customer-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header
            eyebrow="Customer Order"
            [title]="customer ? customerLabel() + ' order detail' : 'Customer order detail'"
            description="Inspect the full order in the context of this customer."
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          >
            <button type="button" (click)="goBack()" class="btn-secondary w-full !py-3 sm:w-auto">
              Back to Order History
            </button>
          </app-page-header>
        </div>

        <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">
          Loading customer order detail...
        </div>

        <div *ngIf="!isLoading && !customer" class="px-4 py-12 text-center sm:px-5 lg:px-6">
          <h2 class="vendor-empty-title">Customer not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            The customer you selected may have been removed or the link is invalid.
          </p>
        </div>

        <div *ngIf="!isLoading && customer && !order" class="px-4 py-12 text-center sm:px-5 lg:px-6">
          <h2 class="vendor-empty-title">Order not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            This order does not belong to the selected customer or may no longer be available.
          </p>
        </div>

        <div *ngIf="!isLoading && customer && order" class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <div class="space-y-6">
            <section class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-3">
                    <p class="text-lg font-black text-slate-900">Order #{{ shortOrderId(order._id) }}</p>
                    <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(vendorOrderStatus(order))">
                      {{ vendorOrderStatus(order) }}
                    </span>
                  </div>

                  <div class="mt-4 grid gap-4 md:grid-cols-3">
                    <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Customer</p>
                      <p class="mt-2 text-sm font-black text-slate-900">{{ customerLabel() }}</p>
                    </div>
                    <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Items</p>
                      <p class="mt-2 text-sm font-black text-slate-900">{{ order.orderItems?.length || 0 }} item(s)</p>
                    </div>
                    <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Placed</p>
                      <p class="mt-2 text-sm font-black text-slate-900">{{ formatDate(order.createdAt) }}</p>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-start gap-3 lg:min-w-[220px] lg:items-end">
                  <p class="text-2xl font-black text-slate-900">{{ formatCurrency(orderTotal(order)) }}</p>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Order total</p>
                </div>
              </div>
            </section>

            <section class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
              <div class="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="vendor-stat-label">Order Items</p>
                  <h2 class="vendor-panel-title mt-2">What this customer bought</h2>
                </div>
                <p class="text-sm font-medium text-slate-500">
                  {{ order.orderItems?.length || 0 }} item{{ (order.orderItems?.length || 0) === 1 ? '' : 's' }}
                </p>
              </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <article
                  *ngFor="let item of order.orderItems || []; trackBy: trackByOrderItem"
                  class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <p class="text-sm font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                      <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                      </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                        {{ formatCurrency(itemTotal(item)) }}
                      </span>
                      <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]" [ngClass]="orderItemStatusClass(item.orderItemStatus)">
                        {{ item.orderItemStatus || 'Processing' }}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  `
})
export class VendorCustomerOrderDetailPageComponent implements OnInit {
  customer: CustomerUser | null = null;
  order: OrderRecord | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    const userId = this.route.parent?.snapshot.paramMap.get('userId') || this.route.snapshot.paramMap.get('userId');
    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (!userId || !orderId) {
      this.isLoading = false;
      this.errorService.showToast('Missing customer order details.', 'error');
      return;
    }

    forkJoin({
      customers: this.vendorService.getRegisteredCustomers(),
      orders: this.vendorService.getCustomerOrderHistory(userId)
    }).subscribe({
      next: ({ customers, orders }) => {
        this.customer = customers.find((user) => user._id === userId) || null;
        this.order = (orders || []).find((entry) => entry._id === orderId) || null;
        this.isLoading = false;
      },
      error: () => {
        this.customer = null;
        this.order = null;
        this.isLoading = false;
        this.errorService.showToast('Unable to load the customer order detail.', 'error');
      }
    });
  }

  goBack(): void {
    if (!this.customer?._id) {
      this.router.navigate(['/vendor/customers']);
      return;
    }

    this.router.navigate(['/vendor/customers', this.customer._id, 'orders']);
  }

  customerLabel(): string {
    if (!this.customer) {
      return 'Customer';
    }

    return this.customer.username || this.customer.fullName || this.customer.email || 'Customer';
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
  }

  orderTotal(order: OrderRecord): number {
    return (order.orderItems || []).reduce((sum, item) => sum + this.itemTotal(item), 0);
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
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

  vendorOrderStatus(order: OrderRecord): OrderStatus {
    const statuses = (order.orderItems || []).map((item) => item.orderItemStatus || 'Processing');

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

  orderItemStatusClass(status?: string): string {
    switch (String(status || 'Processing')) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Shipped':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  trackByOrderItem(index: number, item: OrderItemRecord): string {
    return item._id || item.variantId || item.product || String(index);
  }
}
