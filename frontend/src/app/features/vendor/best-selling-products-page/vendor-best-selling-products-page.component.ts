import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import {
  VendorProductRecord,
  VendorProductSaleRecord,
  VendorAnalyticsPayload,
} from '../../../core/models/vendor.models';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  formatVendorCurrency,
  formatVendorDate,
  primaryProductImage,
  totalProductStock,
} from '../product-management/vendor-product-management.utils';

interface BestSellingProductRow {
  rank: number;
  sale: VendorProductSaleRecord;
  product: VendorProductRecord | null;
  displayName: string;
  image?: string;
  categoryName: string;
  brand: string;
  statusLabel: string;
  statusTone: 'active' | 'inactive';
  soldUnits: number;
  revenue: number;
  averageSellingPrice: number;
  stock: number;
  variants: number;
  salesShare: number;
  description: string;
  createdAt?: string;
}

@Component({
  selector: 'app-vendor-best-selling-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent, ButtonComponent, BadgeComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Top Performers"
            title="Best Selling Products"
            description="Compare sold units, revenue, stock, and listing status for your strongest products."
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          />
        </div>

        <div class="vendor-grid-4 vendor-section-body">
          <article class="vendor-stat-card">
            <p class="vendor-stat-label">Total Revenue</p>
            <p class="vendor-stat-value">{{ formatCurrency(analytics.summary.totalRevenue) }}</p>
            <p class="vendor-stat-copy">Revenue generated from paid orders.</p>
          </article>

          <article class="vendor-stat-card">
            <p class="vendor-stat-label">Items Sold</p>
            <p class="vendor-stat-value">{{ analytics.summary.totalItemsSold }}</p>
            <p class="vendor-stat-copy">All sold units across your catalog.</p>
          </article>

          <article class="vendor-stat-card">
            <p class="vendor-stat-label">Best Seller Count</p>
            <p class="vendor-stat-value">{{ visibleProducts.length }}</p>
            <p class="vendor-stat-copy">Products with matched sales activity.</p>
          </article>

          <article class="vendor-stat-card">
            <p class="vendor-stat-label">Avg Revenue / Item</p>
            <p class="vendor-stat-value">{{ formatCurrency(averageRevenuePerItem()) }}</p>
            <p class="vendor-stat-copy">Calculated from the sales summary.</p>
          </article>
        </div>

        <div class="border-t border-slate-200 vendor-section-body lg:py-6">
          <div class="vendor-grid-2 pt-5 lg:grid-cols-[minmax(0,1.5fr)_260px]">
            <label class="block">
              <span
                class="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                >Search</span
              >
              <div
                class="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 shadow-inner focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-slate-400">
                  <path
                    fill="currentColor"
                    d="M10 4a6 6 0 104.472 10.007l4.26 4.261 1.414-1.414-4.26-4.26A6 6 0 0010 4Zm0 2a4 4 0 110 8 4 4 0 010-8Z"
                  />
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Search best sellers"
                  class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>

            <label class="block">
              <span
                class="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                >Sort</span
              >
              <select
                [(ngModel)]="sortMode"
                class="block w-full rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
              >
                <option value="units">Units sold</option>
                <option value="revenue">Revenue</option>
                <option value="share">Sales share</option>
              </select>
            </label>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 vendor-section-body pb-4">
          <app-badge
            tone="warning"
            badgeClass="border border-[#e7dac9] !bg-[#fff7ed] !px-3 !py-2 !text-xs !font-black !uppercase !tracking-[0.16em] !text-[#6f4e37]"
          >
            Showing {{ visibleProducts.length }} result{{ visibleProducts.length === 1 ? '' : 's' }}
          </app-badge>
          <app-button
            *ngIf="searchTerm"
            variant="secondary"
            buttonClass="rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.16em] !min-h-0 transition hover:bg-slate-50"
            (click)="searchTerm = ''"
          >
            Clear Search
          </app-button>
        </div>

        <div *ngIf="isLoading" class="vendor-section-body py-14 text-center">
          <div
            class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"
          ></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading top selling products...</p>
        </div>

        <div
          *ngIf="!isLoading && !visibleProducts.length"
          class="vendor-section-body py-16 text-center"
        >
          <h2 class="vendor-empty-title">No best sellers yet</h2>
          <p class="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
            Once paid orders are available, your highest performing products will appear here with
            sales and catalog details.
          </p>
          <app-button
            routerLink="/vendor/products"
            variant="primary"
            buttonClass="mt-6 w-full justify-center !px-6 !py-3 sm:w-auto"
          >
            Go to Products
          </app-button>
        </div>

        <div
          *ngIf="!isLoading && visibleProducts.length"
          class="grid gap-4 border-t border-slate-200 vendor-section-body"
        >
          <article
            *ngFor="let product of visibleProducts; trackBy: trackByProduct"
            class="vendor-mobile-card p-3 transition hover:bg-[#fffaf4] sm:p-4 lg:p-5"
          >
            <div class="grid grid-cols-1 gap-4 xl:grid-cols-[96px_minmax(0,1fr)_260px_150px] xl:items-center">
              <div class="flex items-start gap-3 xl:min-w-0">
                <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-[0_10px_24px_rgba(47,27,20,0.05)]">
                  <img
                    *ngIf="product.image; else productFallback"
                    [src]="product.image"
                    [alt]="product.displayName"
                    class="h-full w-full object-cover"
                  />
                  <ng-template #productFallback>
                    <div
                      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-2xl font-black text-slate-500"
                    >
                      {{ product.displayName.charAt(0) || 'P' }}
                    </div>
                  </ng-template>
                </div>

                <div class="min-w-0 flex-1 xl:hidden">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="min-w-0 flex-1 text-sm font-black leading-snug text-slate-900 sm:text-lg">
                      #{{ product.rank }} {{ product.displayName }}
                    </p>
                    <app-badge
                      [tone]="product.statusTone === 'active' ? 'success' : 'neutral'"
                      badgeClass="shrink-0 px-2.5 py-1 text-[10px] font-black"
                    >
                      {{ product.statusLabel }}
                    </app-badge>
                  </div>

                  <div class="mt-2 flex flex-wrap gap-1.5">
                    <app-badge tone="neutral" badgeClass="px-2.5 py-1 text-[9px] font-black !bg-white !text-slate-600 !border !border-slate-200">
                      {{ product.categoryName }}
                    </app-badge>
                    <app-badge tone="neutral" badgeClass="px-2.5 py-1 text-[9px] font-black !bg-white !text-slate-600 !border !border-slate-200">
                      {{ product.brand }}
                    </app-badge>
                  </div>

                  <p class="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Added {{ formatDate(product.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="min-w-0 xl:pr-2">
                <div class="hidden xl:flex xl:flex-wrap xl:items-center xl:gap-3">
                  <p class="min-w-0 text-lg font-black text-slate-900">
                    #{{ product.rank }} {{ product.displayName }}
                  </p>
                  <app-badge
                    [tone]="product.statusTone === 'active' ? 'success' : 'neutral'"
                    badgeClass="px-3 py-1 text-[11px] font-black"
                  >
                    {{ product.statusLabel }}
                  </app-badge>
                </div>

                <div class="hidden xl:mt-3 xl:flex xl:flex-wrap xl:gap-2">
                  <app-badge tone="neutral" badgeClass="px-3 py-1 text-[11px] font-black !bg-white !text-slate-600 !border !border-slate-200">
                    {{ product.categoryName }}
                  </app-badge>
                  <app-badge tone="neutral" badgeClass="px-3 py-1 text-[11px] font-black !bg-white !text-slate-600 !border !border-slate-200">
                    {{ product.brand }}
                  </app-badge>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:mt-4">
                  <div class="min-h-[70px] rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-3">
                    <p class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Sold</p>
                    <p class="mt-1 text-sm font-black leading-tight text-slate-900">
                      {{ product.soldUnits }} unit{{ product.soldUnits === 1 ? '' : 's' }}
                    </p>
                  </div>
                  <div class="min-h-[70px] rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-3">
                    <p class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Revenue</p>
                    <p class="mt-1 text-sm font-black leading-tight text-slate-900">
                      {{ formatCurrency(product.revenue) }}
                    </p>
                  </div>
                  <div class="min-h-[70px] rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-3">
                    <p class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Stock</p>
                    <p class="mt-1 text-sm font-black leading-tight text-slate-900">{{ product.stock }}</p>
                  </div>
                  <div class="min-h-[70px] rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-3">
                    <p class="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Avg. price</p>
                    <p class="mt-1 text-sm font-black leading-tight text-slate-900">
                      {{ formatCurrency(product.averageSellingPrice) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="min-w-0 xl:text-right">
                <div class="flex items-center justify-between gap-4 xl:block">
                  <div class="xl:text-right">
                    <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Sales share
                    </p>
                    <p class="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      {{ product.salesShare.toFixed(1) }}%
                    </p>
                  </div>
                  <div class="min-w-[120px] flex-1 xl:mt-3 xl:w-full">
                    <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        class="h-full rounded-full bg-[linear-gradient(90deg,#6f4e37_0%,#d4a017_100%)]"
                        [style.width.%]="salesBarWidth(product.salesShare)"
                      ></div>
                    </div>
                  </div>
                </div>

                <p class="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 xl:text-right">
                  Added {{ formatDate(product.createdAt) }}
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2 xl:justify-end xl:self-stretch xl:pl-2">
                <app-button
                  *ngIf="product.product?._id"
                  [routerLink]="['/vendor/products', product.product?._id, 'view']"
                  variant="secondary"
                  buttonClass="w-full justify-center rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] sm:w-auto xl:w-full"
                >
                  View Product
                </app-button>
                <app-button
                  *ngIf="product.product?._id"
                  [routerLink]="['/vendor/products', product.product?._id, 'edit']"
                  variant="secondary"
                  buttonClass="w-full justify-center rounded-2xl !border-amber-200 !bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] !text-amber-800 hover:!bg-amber-100 sm:w-auto xl:w-full"
                >
                  Edit Listing
                </app-button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
})
export class VendorBestSellingProductsPageComponent implements OnInit {
  analytics: VendorAnalyticsPayload = {
    summary: {
      totalRevenue: 0,
      totalItemsSold: 0,
      totalOrdersCount: 0,
    },
    productWiseSales: [],
  };

  products: VendorProductRecord[] = [];
  isLoading = true;
  searchTerm = '';
  sortMode: 'units' | 'revenue' | 'share' = 'units';

  constructor(
    private vendorService: VendorService,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get visibleProducts(): BestSellingProductRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    const rows = this.enrichedProducts().filter((row) => {
      if (!term) {
        return true;
      }

      return [row.displayName, row.brand, row.categoryName, row.statusLabel].some(
        (value) =>
          String(value || '')
            .toLowerCase()
            .includes(term),
      );
    });

    return rows.sort((left, right) => {
      switch (this.sortMode) {
        case 'revenue':
          return right.revenue - left.revenue;
        case 'share':
          return right.salesShare - left.salesShare;
        default:
          return right.soldUnits - left.soldUnits;
      }
    });
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      analytics: this.vendorService.getVendorAnalytics(),
      products: this.vendorService.getMyProducts(1, 1000),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ analytics, products }) => {
          this.analytics = analytics;
          this.products = products?.data?.docs || [];
        },
        error: () => {
          this.analytics = {
            summary: {
              totalRevenue: 0,
              totalItemsSold: 0,
              totalOrdersCount: 0,
            },
            productWiseSales: [],
          };
          this.products = [];
          this.errorService.showToast('Unable to load best selling products.', 'error');
        },
      });
  }

  formatCurrency(value: number): string {
    return formatVendorCurrency(value);
  }

  formatDate(value?: string): string {
    return formatVendorDate(value);
  }

  averageRevenuePerItem(): number {
    const totalItems = Number(this.analytics.summary.totalItemsSold || 0);
    if (!totalItems) {
      return 0;
    }

    return Number(this.analytics.summary.totalRevenue || 0) / totalItems;
  }

  salesBarWidth(share: number): number {
    return Math.max(share, 4);
  }

  trackByProduct(_: number, row: BestSellingProductRow): string {
    return row.product?._id || row.displayName;
  }

  private enrichedProducts(): BestSellingProductRow[] {
    const totalItems = Number(this.analytics.summary.totalItemsSold || 0);
    const sales = [...this.analytics.productWiseSales].filter(
      (sale) => Number(sale.quantitySold || 0) > 0,
    );

    return sales
      .map((sale, index) => {
        const product = this.findMatchingProduct(sale);
        const soldUnits = Number(sale.quantitySold || 0);
        const revenue = Number(sale.revenueGenerated || 0);
        const stock = totalProductStock(product);
        const variants = product?.variants?.length || 0;
        const categoryName = product?.categoryDetails?.name || 'Uncategorized';
        const brand = product?.brand || 'Generic';
        const displayName = product?.productName || sale.productName || 'Product';

        return {
          rank: index + 1,
          sale,
          product: product || null,
          displayName,
          image: primaryProductImage(product),
          categoryName,
          brand,
          statusLabel: product?.isActive === false ? 'Inactive' : 'Active',
          statusTone: product?.isActive === false ? 'inactive' : 'active',
          soldUnits,
          revenue,
          averageSellingPrice: soldUnits > 0 ? revenue / soldUnits : 0,
          stock,
          variants,
          salesShare: totalItems > 0 ? (soldUnits / totalItems) * 100 : 0,
          createdAt: product?.createdAt,
        } as BestSellingProductRow;
      })
      .sort((left, right) => right.soldUnits - left.soldUnits)
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));
  }

  private findMatchingProduct(sale: VendorProductSaleRecord): VendorProductRecord | undefined {
    const saleId = String(sale._id || '').trim();
    const saleName = String(sale.productName || '')
      .trim()
      .toLowerCase();

    if (saleId) {
      const matchById = this.products.find((product) => product._id === saleId);
      if (matchById) {
        return matchById;
      }
    }

    if (saleName) {
      return this.products.find((product) => product.productName.trim().toLowerCase() === saleName);
    }

    return undefined;
  }
}
