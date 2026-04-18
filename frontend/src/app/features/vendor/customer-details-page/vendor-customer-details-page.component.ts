import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerUser, CustomerWishlist, CustomerWishlistProduct } from '../../../core/models/customer.models';
import { OrderRecord } from '../../../core/models/order.models';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-customer-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell">
        <div class="border-b border-slate-200 px-6 py-6 lg:px-8">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="app-page-eyebrow">Customer Details</p>
              <h1 class="app-page-title">Customer Profile</h1>
              <p class="app-page-description">
                View account details, order history, and wishlist items in one place.
              </p>
            </div>

            <button type="button" (click)="goBack()" class="btn-secondary !px-6 !py-3">
              Back to Customers
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="vendor-page-shell px-6 py-10 text-sm font-semibold text-slate-500 lg:px-8">
        Loading customer details...
      </div>

      <div *ngIf="!isLoading && customer" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section class="vendor-page-shell p-6 lg:p-8">
            <div class="flex items-center gap-4">
              <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-2xl font-black text-slate-500">
                <img *ngIf="customer.avatar; else initialsBlock" [src]="customer.avatar" alt="" class="h-full w-full object-cover" />
                <ng-template #initialsBlock>{{ initials(customer) }}</ng-template>
              </div>

              <div class="min-w-0">
                <p class="vendor-stat-label">Selected Customer</p>
                <h2 class="vendor-panel-title mt-2 truncate">
                  {{ customer.username || customer.fullName || customer.email }}
                </h2>
                <p class="mt-2 truncate text-sm font-medium text-slate-500">
                  {{ customer.email || 'No email provided' }}
                </p>
              </div>
            </div>

            <dl class="mt-8 space-y-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Email</dt>
                <dd class="mt-2 break-words text-sm font-bold text-slate-900">{{ customer.email || 'Not provided' }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</dt>
                <dd class="mt-2 break-words text-sm font-bold text-slate-900">{{ customer.phone || 'Not provided' }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Role</dt>
                <dd class="mt-2 text-sm font-bold text-slate-900">{{ formatRole(customer.role) }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Joined</dt>
                <dd class="mt-2 text-sm font-bold text-slate-900">{{ customer.createdAt ? formatDate(customer.createdAt) : 'Unknown' }}</dd>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Customer ID</dt>
                <dd class="mt-2 break-all text-sm font-bold text-slate-900">{{ customer._id || 'Unknown' }}</dd>
              </div>
            </dl>
          </section>

          <section class="vendor-page-shell p-6 lg:p-8">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p class="vendor-stat-label">Activity</p>
                <h2 class="vendor-panel-title mt-2">Customer overview</h2>
              </div>

              <div class="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em]">
                <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-amber-800">{{ customerOrders.length }} orders</span>
                <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-amber-800">{{ customerWishlistItems.length }} wishlist item{{ customerWishlistItems.length === 1 ? '' : 's' }}</span>
              </div>
            </div>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <article class="vendor-stat-card !border-amber-100 !bg-amber-50/70">
                <p class="vendor-stat-label !text-amber-700">Latest Order</p>
                <p class="mt-3 text-lg font-black text-slate-900">{{ latestOrderLabel() }}</p>
              </article>
              <article class="vendor-stat-card !border-amber-100 !bg-amber-50/70">
                <p class="vendor-stat-label !text-amber-700">Wishlist Status</p>
                <p class="mt-3 text-lg font-black text-slate-900">{{ customerWishlistItems.length ? 'Has saved items' : 'No saved items' }}</p>
              </article>
            </div>
          </section>
        </div>

        <section class="vendor-page-shell p-6 lg:p-8">
          <div class="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="vendor-stat-label">Order History</p>
              <h2 class="vendor-panel-title mt-2">Customer orders</h2>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-800">
                {{ customerOrders.length }} order{{ customerOrders.length === 1 ? '' : 's' }}
              </span>
              <button
                type="button"
                class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-800 transition hover:bg-amber-100"
                (click)="viewCustomerOrderHistory()"
              >
                View Order History
              </button>
            </div>
          </div>
          <p class="mt-4 text-sm font-medium leading-7 text-slate-500">
            Open the full order history page to review every purchase, payment state, and item detail for this customer.
          </p>
        </section>

        <section class="vendor-page-shell p-6 lg:p-8">
          <div class="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="vendor-stat-label">Buying Pattern</p>
              <h2 class="vendor-panel-title mt-2">Frequently bought</h2>
            </div>
            <p class="text-sm font-medium text-slate-500">
              Based on {{ customerOrders.length }} order{{ customerOrders.length === 1 ? '' : 's' }}
            </p>
          </div>

          <div *ngIf="!loadingOrders && frequentItems().length === 0" class="py-10 text-center">
            <h3 class="vendor-empty-title">No purchase pattern yet</h3>
            <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
              Once this customer places a few more orders, the most frequently bought products will appear here.
            </p>
          </div>

          <div *ngIf="!loadingOrders && frequentItems().length > 0" class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article
              *ngFor="let item of frequentItems(); trackBy: trackByFrequentItem"
              class="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:border-[#e7dac9] hover:shadow-[0_24px_60px_rgba(111,78,55,0.08)]"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="truncate text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {{ item.brand || 'Most purchased' }}
                  </p>
                  <h3 class="mt-1 line-clamp-2 text-lg font-black text-slate-900">
                    {{ item.name }}
                  </h3>
                </div>

                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-slate-900">
                  {{ item.totalQuantity }} bought
                </span>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Orders</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ item.orderCount }} order{{ item.orderCount === 1 ? '' : 's' }}</p>
                </div>
                <div class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Last Seen</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ formatDate(item.lastPurchasedAt) }}</p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-800">
                  Product history
                </span>
                <button
                  type="button"
                  class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-800 transition hover:bg-amber-100"
                  (click)="openProductById(item.productId)"
                >
                  View product
                </button>
              </div>
            </article>
          </div>
        </section>

        <section class="vendor-page-shell p-6 lg:p-8">
          <div class="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="vendor-stat-label">Wishlist</p>
              <h2 class="vendor-panel-title mt-2">Saved products</h2>
            </div>
            <p class="text-sm font-medium text-slate-500">{{ customerWishlistItems.length }} item{{ customerWishlistItems.length === 1 ? '' : 's' }} saved</p>
          </div>

          <div *ngIf="loadingWishlist" class="py-8 text-sm font-semibold text-slate-500">Loading customer wishlist...</div>

          <div *ngIf="!loadingWishlist && customerWishlistItems.length === 0" class="py-10 text-center">
            <h3 class="vendor-empty-title">Wishlist is empty</h3>
            <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
              This customer has not saved any products yet.
            </p>
          </div>

          <div *ngIf="!loadingWishlist && customerWishlistItems.length > 0" class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article
              *ngFor="let item of customerWishlistItems; trackBy: trackByWishlistItem"
              class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:border-[#e7dac9] hover:shadow-[0_24px_60px_rgba(111,78,55,0.08)]"
            >
              <div class="flex items-center gap-4">
                <div class="h-20 w-20 overflow-hidden rounded-[1.25rem] bg-slate-100">
                  <img [src]="productImage(item)" [alt]="item.productName || 'Wishlist item'" class="h-full w-full object-cover" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{{ item.brand || 'Product' }}</p>
                  <h3 class="mt-1 line-clamp-2 text-base font-black text-slate-900">{{ item.productName || 'Wishlist item' }}</h3>
                  <p class="mt-2 text-sm font-semibold text-slate-500">{{ item.categoryDetails?.name || 'General Category' }}</p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-slate-900">{{ formatCurrency(item.basePrice || 0) }}</span>
                <span
                  class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]"
                  [ngClass]="item.isActive === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'"
                >
                  {{ item.isActive === false ? 'Inactive' : 'Active' }}
                </span>
                <button
                  type="button"
                  class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-800 transition hover:bg-amber-100"
                  (click)="openProduct(item)"
                >
                  View product
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div *ngIf="!isLoading && !customer" class="vendor-page-shell px-6 py-12 text-center lg:px-8">
        <h2 class="vendor-empty-title">Customer not found</h2>
        <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
          The customer you selected may have been removed or the link is invalid.
        </p>
      </div>
    </section>
  `
})
export class VendorCustomerDetailsPageComponent implements OnInit {
  customer: CustomerUser | null = null;
  customerOrders: OrderRecord[] = [];
  customerWishlist: CustomerWishlist | null = null;
  customerWishlistItems: CustomerWishlistProduct[] = [];
  isLoading = true;
  loadingOrders = false;
  loadingWishlist = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');

    if (!userId) {
      this.isLoading = false;
      this.errorService.showToast('Missing customer id.', 'error');
      return;
    }

    this.vendorService.getRegisteredCustomers().subscribe({
      next: (users) => {
        this.customer = users.find((user) => user._id === userId) || null;
        if (!this.customer) {
          this.isLoading = false;
          return;
        }

        this.loadCustomerData(userId);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadCustomerData(customerId: string): void {
    this.loadingOrders = true;
    this.loadingWishlist = true;

    forkJoin({
      orders: this.vendorService.getCustomerOrderHistory(customerId),
      wishlist: this.vendorService.getCustomerWishlist(customerId)
    }).subscribe({
      next: ({ orders, wishlist }) => {
        this.customerOrders = orders || [];
        this.customerWishlist = wishlist || null;
        this.customerWishlistItems = Array.isArray(wishlist?.products) ? wishlist.products : [];
        this.loadingOrders = false;
        this.loadingWishlist = false;
        this.isLoading = false;
      },
      error: () => {
        this.customerOrders = [];
        this.customerWishlist = null;
        this.customerWishlistItems = [];
        this.loadingOrders = false;
        this.loadingWishlist = false;
        this.isLoading = false;
        this.errorService.showToast('Unable to load order history or wishlist.', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/vendor/customers']);
  }

  openProduct(item: CustomerWishlistProduct): void {
    if (!item._id) {
      return;
    }

    this.router.navigate(['/vendor/products', item._id, 'view']);
  }

  openProductById(productId?: string): void {
    if (!productId) {
      return;
    }

    this.router.navigate(['/vendor/products', productId, 'view']);
  }

  viewCustomerOrderHistory(): void {
    if (!this.customer?._id) {
      return;
    }

    this.router.navigate(['/vendor/customers', this.customer._id, 'orders']);
  }

  initials(user: CustomerUser): string {
    const label = String(user.username || user.fullName || user.email || 'Customer').trim();
    return label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'C';
  }

  formatRole(role?: string | string[]): string {
    if (Array.isArray(role)) {
      return role.join(', ') || 'customer';
    }

    return String(role || 'customer');
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Unknown';
    }

    return new Date(value).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  shortId(id?: string): string {
    if (!id) {
      return '--------';
    }

    return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
  }

  shortOrderId(orderId?: string): string {
    if (!orderId) {
      return '--------';
    }

    return orderId.length > 10 ? `${orderId.slice(-8).toUpperCase()}` : orderId.toUpperCase();
  }

  latestOrderLabel(): string {
    if (!this.customerOrders.length) {
      return 'No orders yet';
    }

    return this.formatDate(this.customerOrders[0]?.createdAt);
  }

  frequentItems(): FrequentItemSummary[] {
    const summaryMap = new Map<string, FrequentItemSummary>();

    this.customerOrders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const key = String(item.product || item.name || '').trim();
        if (!key) {
          return;
        }

        const existing = summaryMap.get(key);
        const quantity = Number(item.quantity || 0);
        const currentTimestamp = this.toTimestamp(order.createdAt);

        if (!existing) {
          summaryMap.set(key, {
            productId: item.product || '',
            name: item.name || 'Order item',
            brand: item.sku || '',
            totalQuantity: quantity,
            orderCount: 1,
            lastPurchasedAt: order.createdAt || '',
            lastTimestamp: currentTimestamp
          });
          return;
        }

        existing.totalQuantity += quantity;
        existing.orderCount += 1;

        if (currentTimestamp >= existing.lastTimestamp) {
          existing.lastPurchasedAt = order.createdAt || existing.lastPurchasedAt;
          existing.lastTimestamp = currentTimestamp;
        }
      });
    });

    return Array.from(summaryMap.values())
      .sort((a, b) => {
        if (b.totalQuantity !== a.totalQuantity) {
          return b.totalQuantity - a.totalQuantity;
        }

        return b.lastTimestamp - a.lastTimestamp;
      })
      .slice(0, 6);
  }

  productImage(item: CustomerWishlistProduct): string {
    return item.mainImages?.[0] || 'https://via.placeholder.com/640x640?text=Wishlist';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  orderStatusClass(status?: string): string {
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

  trackByOrder(_: number, order: OrderRecord): string {
    return order._id || '';
  }

  trackByOrderItem(_: number, item: any): string {
    return item._id || item.name || '';
  }

  trackByWishlistItem(_: number, item: CustomerWishlistProduct): string {
    return item._id || item.productName || '';
  }

  trackByFrequentItem(_: number, item: FrequentItemSummary): string {
    return item.productId || item.name;
  }

  private toTimestamp(value?: string): number {
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }
}

interface FrequentItemSummary {
  productId: string;
  name: string;
  brand: string;
  totalQuantity: number;
  orderCount: number;
  lastPurchasedAt: string;
  lastTimestamp: number;
}
