import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import {
  OrderReportRequest,
  VendorAnalyticsPayload,
  VendorProductRecord,
  VendorSoldOrderRecord
} from '../../../core/models/vendor.models';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  tone: 'primary' | 'accent' | 'amber' | 'rose';
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
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell">
        <div class="border-b border-slate-200 px-6 py-6 lg:px-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="app-page-eyebrow">Dashboard</p>
              <h1 class="app-page-title">Vendor Overview</h1>
            </div>

            <div class="flex flex-wrap gap-3">
              <a routerLink="/vendor/products/add" class="btn-primary !px-6 !py-3">+ Add Product</a>
              <a routerLink="/vendor/products" class="btn-secondary !px-6 !py-3">Manage Products</a>
              <a routerLink="/vendor/best-selling-products" class="btn-secondary !px-6 !py-3">Best Sellers</a>
            </div>
          </div>
        </div>

        <div class="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
          <article *ngFor="let metric of metrics" class="vendor-stat-card transition hover:-translate-y-0.5"
            [ngClass]="metricCardClass(metric.tone)">
            <p class="vendor-stat-label">{{ metric.label }}</p>
            <p class="vendor-stat-value">{{ metric.value }}</p>
            <p class="vendor-stat-copy !mt-3 !text-[15px] !text-current">{{ metric.change }}</p>
          </article>
        </div>
      </div>

      <div class="vendor-page-shell">
        <div class="vendor-section-head">
          <p class="vendor-stat-label">Reports</p>
          <h2 class="vendor-panel-title">Download Sales Reports</h2>
          <p class="mt-2 text-sm font-medium text-slate-500">
            Export weekly, monthly, or custom order reports as CSV or PDF.
          </p>
        </div>

        <div class="grid gap-6 px-6 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div class="space-y-4">
            <div>
              <p class="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Quick exports</p>
              <p class="mt-2 text-sm font-medium text-slate-500">
                One-click downloads for the most common report ranges.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-[#fff7ed]"
                [disabled]="isDownloadingReport"
                (click)="downloadPresetReport('weekly', 'csv')"
              >
                <span class="block text-sm font-black text-slate-900">Weekly CSV</span>
                <span class="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Spreadsheet</span>
              </button>

              <button
                type="button"
                class="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#e7dac9] hover:bg-[#fef6eb]"
                [disabled]="isDownloadingReport"
                (click)="downloadPresetReport('weekly', 'pdf')"
              >
                <span class="block text-sm font-black text-slate-900">Weekly PDF</span>
                <span class="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Printable</span>
              </button>

              <button
                type="button"
                class="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-[#fff7ed]"
                [disabled]="isDownloadingReport"
                (click)="downloadPresetReport('monthly', 'csv')"
              >
                <span class="block text-sm font-black text-slate-900">Monthly CSV</span>
                <span class="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Spreadsheet</span>
              </button>

              <button
                type="button"
                class="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#e7dac9] hover:bg-[#fef6eb]"
                [disabled]="isDownloadingReport"
                (click)="downloadPresetReport('monthly', 'pdf')"
              >
                <span class="block text-sm font-black text-slate-900">Monthly PDF</span>
                <span class="mt-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Printable</span>
              </button>
            </div>
          </div>

          <div class="rounded-[1.5rem] border border-[#e7dac9] bg-[#fff7ed]/80 p-4 shadow-sm sm:p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-sm font-black uppercase tracking-[0.18em] text-amber-700">Custom range</p>
                <h3 class="mt-1 text-xl font-black text-slate-900">Choose your dates</h3>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                CSV / PDF
              </span>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <label class="space-y-2">
                <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Start date</span>
                <input
                  type="date"
                  [(ngModel)]="customReportStartDate"
                  class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:ring-2 focus:ring-amber-600/30"
                >
              </label>

              <label class="space-y-2">
                <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">End date</span>
                <input
                  type="date"
                  [(ngModel)]="customReportEndDate"
                  class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:ring-2 focus:ring-amber-600/30"
                >
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                class="btn-secondary !px-5 !py-3"
                [disabled]="isDownloadingReport"
                (click)="downloadCustomReport('csv')"
              >
                {{ isDownloadingReport ? 'Preparing report...' : 'Download CSV' }}
              </button>

              <button
                type="button"
                class="btn-primary !px-5 !py-3"
                [disabled]="isDownloadingReport"
                (click)="downloadCustomReport('pdf')"
              >
                {{ isDownloadingReport ? 'Preparing report...' : 'Download PDF' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <section class="vendor-page-shell">
          <div class="vendor-section-head">
            <p class="vendor-stat-label">Recent Orders</p>
            <h2 class="vendor-panel-title">Fulfillment Snapshot</h2>
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
          <div class="app-surface overflow-hidden">
            <div class="vendor-section-head">
              <p class="vendor-stat-label">Quick Actions</p>
              <h2 class="vendor-panel-title">What Do You Want To Do?</h2>
            </div>

            <div class="grid gap-3 px-6 py-6">
              <a *ngFor="let action of quickActions" [routerLink]="action.link" class="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:bg-slate-50">
                <p class="text-sm font-black text-slate-900">{{ action.title }}</p>
                <p class="mt-1 text-sm font-medium text-slate-500">{{ action.description }}</p>
              </a>
            </div>
          </div>

          <div class="vendor-page-shell">
            <div class="vendor-section-head">
              <p class="vendor-stat-label">Top Performers</p>
              <h2 class="vendor-panel-title">Best Selling Products</h2>
            </div>

            <div *ngIf="isLoading" class="px-6 py-8 text-sm font-semibold text-slate-500">
              Loading product activity...
            </div>

            <div *ngIf="!isLoading && topProducts.length === 0" class="px-6 py-10 text-sm font-semibold text-slate-500">
              Product sales will show up here once paid orders are available.
            </div>

            <div *ngIf="topProducts.length" class="space-y-3 px-6 py-6">
              <article *ngFor="let product of topProducts" class="rounded-[1.5rem] border border-[#e7dac9] bg-[#fff7ed]/70 p-4 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-black text-slate-900">{{ product.name }}</p>
                    <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Sold {{ product.units }} unit(s)</p>
                  </div>
                  <p class="text-sm font-black text-amber-800">{{ product.value }}</p>
                </div>
                <p class="mt-3 text-sm font-medium text-slate-500">Revenue generated from paid orders</p>
              </article>
              <a routerLink="/vendor/best-selling-products" class="mt-4 inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50">
                View full best sellers
              </a>
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
  isDownloadingReport = false;
  customReportStartDate = '';
  customReportEndDate = '';

  quickActions = [
    { title: 'Review Product Catalog', description: 'Open the products page and update stock, discounts, and visibility.', link: '/vendor/products' },
    { title: 'Update Store Profile', description: 'Refresh logo, address, and storefront description.', link: '/vendor/profile' },
    { title: 'Add A New Listing', description: 'Create a new product entry with variants and images.', link: '/vendor/products/add' },
    { title: 'View Customers', description: 'See customer profiles, contact details, and signup info.', link: '/vendor/customers' },
    { title: 'Open Notifications', description: 'Check low-stock alerts and mark important updates as read.', link: '/vendor/notifications' }
  ];

  constructor(
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

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
        tone: 'primary'
      },
      {
        label: 'Items Sold',
        value: this.analytics.summary.totalItemsSold.toString(),
        change: `${this.countOrdersByStatus('Delivered')} item(s) delivered so far`,
        tone: 'accent'
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
      error: () => {
        this.products = [];
        this.soldOrders = [];
        this.analytics = {
          summary: { totalRevenue: 0, totalItemsSold: 0, totalOrdersCount: 0 },
          productWiseSales: []
        };
        this.isLoading = false;
      }
    });
  }

  downloadPresetReport(range: 'weekly' | 'monthly', format: 'csv' | 'pdf'): void {
    this.downloadReport({ range, format });
  }

  downloadCustomReport(format: 'csv' | 'pdf'): void {
    if (!this.customReportStartDate || !this.customReportEndDate) {
      this.errorService.showToast('Please choose both start and end dates for a custom report.', 'error');
      return;
    }

    if (new Date(this.customReportStartDate) > new Date(this.customReportEndDate)) {
      this.errorService.showToast('Start date must be before end date.', 'error');
      return;
    }

    this.downloadReport({
      range: 'custom',
      format,
      startDate: this.customReportStartDate,
      endDate: this.customReportEndDate
    });
  }

  metricCardClass(tone: DashboardMetric['tone']): string {
    const classes: Record<DashboardMetric['tone'], string> = {
      primary: 'border-amber-100 bg-[#fff7ed]/70 text-[#6f4e37]',
      accent: 'border-amber-100 bg-[#f5e6d3]/70 text-[#6f4e37]',
      amber: 'border-amber-100 bg-amber-50/70 text-amber-800',
      rose: 'border-rose-100 bg-rose-50/70 text-rose-700'
    };

    return classes[tone];
  }

  orderStatusClass(status: DashboardOrder['status']): string {
    const classes: Record<DashboardOrder['status'], string> = {
      Processing: 'bg-amber-100 text-amber-700',
      Shipped: 'bg-amber-100 text-amber-800',
      Delivered: 'bg-amber-100 text-amber-800',
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

  private downloadReport(request: OrderReportRequest): void {
    this.isDownloadingReport = true;

    this.vendorService
      .downloadOrdersReport(request)
      .pipe(
        finalize(() => {
          this.isDownloadingReport = false;
        })
      )
      .subscribe({
        next: (response) => {
          const blob = response.body;

          if (!blob) {
            this.errorService.showToast('Report download failed. Empty file received.', 'error');
            return;
          }

          const filename = this.resolveFilename(response, request);
          this.triggerDownload(blob, filename);
          this.errorService.showToast('Report downloaded successfully.', 'success');
        },
        error: (error) => {
          this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
        }
      });
  }

  private resolveFilename(response: { headers: { get(name: string): string | null } }, request: OrderReportRequest): string {
    const header = response.headers.get('content-disposition') || '';
    const match = /filename="?([^"]+)"?/i.exec(header);

    if (match?.[1]) {
      return match[1];
    }

    return `order-report-${request.range}.${request.format}`;
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }
}

