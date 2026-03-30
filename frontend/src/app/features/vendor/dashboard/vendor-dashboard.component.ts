import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VendorAnalyticsPayload, VendorProductRecord, VendorSoldOrderRecord } from '../../../core/models/vendor.models';
import { VendorService } from '../../../core/services/vendor.service';

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  tone: 'cyan' | 'emerald' | 'amber' | 'rose';
}

interface DashboardOrder {
  id: string;
  item: string;
  itemCount: number;
  total: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

interface DashboardProduct {
  name: string;
  units: number;
  value: string;
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="space-y-6">
      <div class="glass-card overflow-hidden">
        <div class="border-b border-slate-200 px-6 py-6 lg:px-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Vendor Overview</h1>
            </div>

            <div class="flex flex-wrap gap-3">
              <a routerLink="/vendor/products/add" class="btn-primary !px-6 !py-3">+ Add Product</a>
              <a routerLink="/vendor/products" class="btn-secondary !px-6 !py-3">Manage Products</a>
            </div>
          </div>
        </div>

        <div class="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
          <article *ngFor="let metric of metrics" class="rounded-[1.75rem] border p-5"
            [ngClass]="metricCardClass(metric.tone)">
            <p class="text-[11px] font-black uppercase tracking-[0.18em]">{{ metric.label }}</p>
            <p class="mt-4 text-3xl font-black tracking-tight text-slate-900">{{ metric.value }}</p>
            <p class="mt-3 text-sm font-bold">{{ metric.change }}</p>
          </article>
        </div>
      </div>

      <div *ngIf="errorMessage" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {{ errorMessage }}
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <section class="glass-card overflow-hidden">
          <div class="border-b border-slate-200 px-6 py-5">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Recent Orders</p>
            <h2 class="mt-2 text-2xl font-black text-slate-900">Fulfillment Snapshot</h2>
          </div>

          <div *ngIf="isLoading" class="px-6 py-8 text-sm font-semibold text-slate-500">
            Loading live order activity...
          </div>

          <div *ngIf="!isLoading && recentOrders.length === 0" class="px-6 py-10 text-sm font-semibold text-slate-500">
            Orders for your store will appear here once customers start checking out.
          </div>

          <div *ngIf="recentOrders.length" class="divide-y divide-slate-100">
            <article *ngFor="let order of recentOrders" class="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-sm font-black text-slate-900">{{ order.id }} • {{ order.itemCount }} item(s)</p>
                <p class="mt-1 text-sm font-medium text-slate-500">{{ order.item }}</p>
              </div>
              <div class="flex items-center gap-4">
                <p class="text-sm font-black text-slate-900">{{ order.total }}</p>
                <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="orderStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section class="space-y-6">
          <div class="glass-card overflow-hidden">
            <div class="border-b border-slate-200 px-6 py-5">
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Quick Actions</p>
              <h2 class="mt-2 text-2xl font-black text-slate-900">What Do You Want To Do?</h2>
            </div>

            <div class="grid gap-3 px-6 py-6">
              <a *ngFor="let action of quickActions" [routerLink]="action.link" class="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:bg-slate-50">
                <p class="text-sm font-black text-slate-900">{{ action.title }}</p>
                <p class="mt-1 text-sm font-medium text-slate-500">{{ action.description }}</p>
              </a>
            </div>
          </div>

          <div class="glass-card overflow-hidden">
            <div class="border-b border-slate-200 px-6 py-5">
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Top Performers</p>
              <h2 class="mt-2 text-2xl font-black text-slate-900">Best Selling Products</h2>
            </div>

            <div *ngIf="isLoading" class="px-6 py-8 text-sm font-semibold text-slate-500">
              Loading product activity...
            </div>

            <div *ngIf="!isLoading && topProducts.length === 0" class="px-6 py-10 text-sm font-semibold text-slate-500">
              Product sales will show up here once paid orders are available.
            </div>

            <div *ngIf="topProducts.length" class="space-y-3 px-6 py-6">
              <article *ngFor="let product of topProducts" class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-black text-slate-900">{{ product.name }}</p>
                    <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Sold {{ product.units }} unit(s)</p>
                  </div>
                  <p class="text-sm font-black text-emerald-700">{{ product.value }}</p>
                </div>
                <p class="mt-3 text-sm font-medium text-slate-500">Revenue generated from paid orders</p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </section>
  `
})
export class VendorDashboardComponent implements OnInit {
  products: VendorProductRecord[] = [];
  soldOrders: VendorSoldOrderRecord[] = [];
  analytics: VendorAnalyticsPayload = {
    summary: {
      totalRevenue: 0,
      totalItemsSold: 0,
      totalOrdersCount: 0
    },
    productWiseSales: []
  };
  isLoading = true;
  errorMessage = '';

  quickActions = [
    { title: 'Review Product Catalog', description: 'Open the products page and update stock, discounts, and visibility.', link: '/vendor/products' },
    { title: 'Update Store Profile', description: 'Refresh logo, address, and storefront description.', link: '/vendor/profile' },
    { title: 'Add A New Listing', description: 'Create a new product entry with variants and images.', link: '/vendor/products/add' }
  ];

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get metrics(): DashboardMetric[] {
    const processingOrders = this.countOrdersByStatus('Processing');
    const shippedOrders = this.countOrdersByStatus('Shipped');
    const lowStockProducts = this.products.filter((product) => this.totalStock(product) > 0 && this.totalStock(product) <= 5).length;

    return [
      {
        label: 'Paid Revenue',
        value: this.formatCurrency(this.analytics.summary.totalRevenue),
        change: `${this.analytics.summary.totalOrdersCount} paid order(s) recorded`,
        tone: 'emerald'
      },
      {
        label: 'Items Sold',
        value: this.analytics.summary.totalItemsSold.toString(),
        change: `${this.countOrdersByStatus('Delivered')} item(s) delivered so far`,
        tone: 'cyan'
      },
      {
        label: 'Active Products',
        value: this.activeProducts.length.toString(),
        change: `${Math.max(this.products.length - this.activeProducts.length, 0)} inactive listings`,
        tone: 'amber'
      },
      {
        label: 'Open Shipments',
        value: (processingOrders + shippedOrders).toString(),
        change: `${lowStockProducts} low-stock listing(s)`,
        tone: 'rose'
      }
    ];
  }

  get recentOrders(): DashboardOrder[] {
    return [...this.soldOrders]
      .sort((a, b) => this.toTimestamp(b.date) - this.toTimestamp(a.date))
      .slice(0, 4)
      .map((order) => {
        const items = order.items || [];
        return {
          id: `#${this.shortOrderId(order.orderId)}`,
          item: this.soldItemSummary(order),
          itemCount: items.length,
          total: this.formatCurrency(this.soldOrderTotal(order)),
          status: this.toDashboardStatus(order.orderStatus)
        };
      });
  }

  get topProducts(): DashboardProduct[] {
    return [...this.analytics.productWiseSales]
      .sort((a, b) => Number(b.quantitySold || 0) - Number(a.quantitySold || 0))
      .slice(0, 3)
      .map((product) => ({
        name: product.productName || 'Product',
        units: Number(product.quantitySold || 0),
        value: this.formatCurrency(Number(product.revenueGenerated || 0))
      }));
  }

  get activeProducts(): VendorProductRecord[] {
    return this.products.filter((product) => product.isActive);
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      products: this.vendorService.getMyProducts(),
      analytics: this.vendorService.getVendorAnalytics(),
      soldItems: this.vendorService.getVendorSoldItems()
    }).subscribe({
      next: ({ products, analytics, soldItems }) => {
        this.products = products?.data?.docs || [];
        this.analytics = analytics;
        this.soldOrders = soldItems;
        this.isLoading = false;
      },
      error: (error) => {
        this.products = [];
        this.soldOrders = [];
        this.analytics = {
          summary: { totalRevenue: 0, totalItemsSold: 0, totalOrdersCount: 0 },
          productWiseSales: []
        };
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Unable to load vendor dashboard data.';
      }
    });
  }

  metricCardClass(tone: DashboardMetric['tone']): string {
    const classes: Record<DashboardMetric['tone'], string> = {
      cyan: 'border-cyan-100 bg-cyan-50/70 text-cyan-700',
      emerald: 'border-emerald-100 bg-emerald-50/70 text-emerald-700',
      amber: 'border-amber-100 bg-amber-50/70 text-amber-700',
      rose: 'border-rose-100 bg-rose-50/70 text-rose-700'
    };

    return classes[tone];
  }

  orderStatusClass(status: DashboardOrder['status']): string {
    const classes: Record<DashboardOrder['status'], string> = {
      Processing: 'bg-amber-100 text-amber-700',
      Shipped: 'bg-sky-100 text-sky-700',
      Delivered: 'bg-emerald-100 text-emerald-700',
      Cancelled: 'bg-rose-100 text-rose-700'
    };

    return classes[status];
  }

  private countOrdersByStatus(status: DashboardOrder['status']): number {
    return this.soldOrders.reduce(
      (count, order) =>
        count +
        (order.items || []).filter((item) => this.toDashboardStatus(item.orderItemStatus || order.orderStatus) === status).length,
      0
    );
  }

  private totalStock(product: VendorProductRecord): number {
    return (product.variants || []).reduce((sum, variant) => sum + Number(variant.productStock || 0), 0);
  }

  private soldItemSummary(order: VendorSoldOrderRecord): string {
    const itemNames = (order.items || [])
      .map((item) => {
        const quantity = Number(item.quantity || 0);
        return item.name ? `${item.name}${quantity ? ` x ${quantity}` : ''}` : '';
      })
      .filter(Boolean);

    if (!itemNames.length) {
      return 'Order items unavailable';
    }

    return itemNames.length > 2 ? `${itemNames.slice(0, 2).join(', ')} +${itemNames.length - 2}` : itemNames.join(', ');
  }

  private soldOrderTotal(order: VendorSoldOrderRecord): number {
    return (order.items || []).reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }

  private toDashboardStatus(status?: string): DashboardOrder['status'] {
    if (status === 'Cancelled') return 'Cancelled';
    if (status === 'Delivered') return 'Delivered';
    if (status === 'Shipped') return 'Shipped';
    return 'Processing';
  }

  private shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
  }

  private toTimestamp(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }
}
