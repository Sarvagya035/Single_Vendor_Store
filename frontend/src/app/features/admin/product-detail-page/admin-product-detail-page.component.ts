import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { AdminService } from '../../../core/services/admin.service';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-admin-product-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface p-6 sm:p-8">
        <app-page-header
          eyebrow="Product Administration"
          [title]="product?.productName || 'Product details'"
          eyebrowClass="text-amber-500"
          titleClass="text-4xl"
        >
          <a routerLink="/admin/products" class="btn-secondary !py-3">Back to products</a>
        </app-page-header>

        <p class="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500">
          Review the full product catalog entry and adjust variant inventory from one place.
        </p>
      </div>

      <div *ngIf="isLoading" class="app-card-soft px-6 py-12 text-sm font-semibold text-slate-500">
        Loading product details...
      </div>

      <div *ngIf="errorMessage" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {{ errorMessage }}
      </div>

      <ng-container *ngIf="product && !isLoading">
        <section class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <article class="app-card overflow-hidden">
            <div class="grid gap-6 border-b border-slate-100 p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div class="h-52 overflow-hidden rounded-[1.5rem] bg-slate-100">
                <img
                  *ngIf="product.mainImages?.length"
                  [src]="heroImage()"
                  [alt]="product.productName"
                  class="h-full w-full object-cover"
                />
                <div *ngIf="!product.mainImages?.length" class="flex h-full w-full items-center justify-center bg-slate-200 text-4xl font-black text-slate-500">
                  {{ productInitial() }}
                </div>
              </div>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-3xl font-black tracking-tight text-slate-900">{{ product.productName }}</h2>
                  <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="isProductActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                    {{ isProductActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <p class="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {{ product.categoryDetails?.name || 'Uncategorized' }}
                </p>
                <p class="mt-4 text-sm leading-7 text-slate-600">
                  {{ product.productDescription || 'No description available.' }}
                </p>

                <div class="mt-5 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ product.brand || 'Generic' }}</p>
                  </div>
                  <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Variants</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ product.variants?.length || 0 }}</p>
                  </div>
                  <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Base Price</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ formatCurrency(product.basePrice || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Inventory</p>
                  <h3 class="mt-2 text-2xl font-black text-slate-900">Adjust variant stock</h3>
                </div>
              </div>

              <div class="mt-5 space-y-4">
                <article *ngFor="let variant of product.variants || []; let i = index" class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-base font-black text-slate-900">{{ variantLabel(variant, i) }}</p>
                        <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="stockClass(variant)">
                          {{ stockLabel(variant) }}
                        </span>
                      </div>
                      <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        SKU: {{ variant.sku || 'N/A' }} | Current stock: {{ variant.productStock || 0 }}
                      </p>
                      <p class="mt-3 text-sm text-slate-600" *ngIf="attributeText(variant)">
                        {{ attributeText(variant) }}
                      </p>
                    </div>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="number"
                        min="1"
                        [ngModel]="stockAmount(variant, i)"
                        (ngModelChange)="updateStockAmount(variant, i, $event)"
                        [ngModelOptions]="{ standalone: true }"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none sm:w-28"
                      />
                      <button
                        type="button"
                        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        [disabled]="isBusy(stockBusyKey(variant, i))"
                        (click)="adjustVariantStock(variant, i, 'add')"
                      >
                        {{ isBusy(stockBusyKey(variant, i)) ? 'Saving...' : 'Restock' }}
                      </button>
                      <button
                        type="button"
                        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        [disabled]="isBusy(stockBusyKey(variant, i))"
                        (click)="adjustVariantStock(variant, i, 'subtract')"
                      >
                        {{ isBusy(stockBusyKey(variant, i)) ? 'Saving...' : 'Decrease' }}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </article>

          <aside class="app-card h-fit p-6">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Notes</p>
            <h3 class="mt-2 text-2xl font-black text-slate-900">Inventory guidance</h3>
            <p class="mt-4 text-sm leading-7 text-slate-600">
              Use positive stock adjustments to restock from your warehouse and negative adjustments to correct counts when items are damaged, returned, or miscounted.
            </p>
            <p class="mt-3 text-sm leading-7 text-slate-600">
              The stock count cannot go below zero.
            </p>
            <div *ngIf="message" class="mt-5 rounded-2xl px-4 py-3 text-sm font-semibold" [ngClass]="messageType === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
              {{ message }}
            </div>
          </aside>
        </section>
      </ng-container>
    </section>
  `
})
export class AdminProductDetailPageComponent implements OnInit {
  product: CustomerCatalogProduct | null = null;
  isLoading = false;
  errorMessage = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  busyStates: Record<string, boolean> = {};
  stockAdjustments: Record<string, number> = {};

  constructor(
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (!productId) {
      this.errorMessage = 'Product not found.';
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(productId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.catalogService.getProductDetails(productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.product = response?.data || null;
        this.initializeStockAdjustments();
        this.message = '';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Unable to load product details.';
      }
    });
  }

  get isProductActive(): boolean {
    return this.product?.isActive !== false;
  }

  heroImage(): string {
    return this.product?.mainImages?.[0] || '';
  }

  productInitial(): string {
    return this.product?.productName?.charAt(0) || 'P';
  }

  variantKey(variant: CustomerCatalogVariant, index: number): string {
    return `${variant._id || 'variant'}-${index}`;
  }

  stockBusyKey(variant: CustomerCatalogVariant, index: number): string {
    return `stock-${this.variantKey(variant, index)}`;
  }

  isBusy(key: string): boolean {
    return !!this.busyStates[key];
  }

  stockAmount(variant: CustomerCatalogVariant, index: number): number {
    const key = this.variantKey(variant, index);
    return this.stockAdjustments[key] ?? 1;
  }

  updateStockAmount(variant: CustomerCatalogVariant, index: number, value: number | string): void {
    const key = this.variantKey(variant, index);
    this.stockAdjustments[key] = Math.max(1, Number(value) || 1);
  }

  adjustVariantStock(variant: CustomerCatalogVariant, index: number, direction: 'add' | 'subtract'): void {
    if (!this.product?._id || !variant?._id) {
      return;
    }

    const amount = Math.max(1, Number(this.stockAmount(variant, index)) || 1);
    const delta = direction === 'add' ? amount : -amount;
    const key = this.stockBusyKey(variant, index);

    this.message = '';
    this.setBusy(key, true);

    this.adminService.adjustVariantStock(this.product._id, variant._id, delta).subscribe({
      next: (res) => {
        this.setBusy(key, false);
        if (res?.data) {
          this.product = res.data as CustomerCatalogProduct;
        }
        this.messageType = 'success';
        this.message = res?.message || 'Stock updated successfully.';
      },
      error: (error) => {
        this.setBusy(key, false);
        this.messageType = 'error';
        this.message = error.error?.message || 'Unable to update stock.';
      }
    });
  }

  variantLabel(variant: CustomerCatalogVariant, index: number): string {
    if (variant.sku) {
      return variant.sku;
    }
    const attributes = this.attributeEntries(variant.attributes);
    return attributes.length ? attributes.join(' | ') : `Variant ${index + 1}`;
  }

  attributeText(variant: CustomerCatalogVariant): string {
    const attributes = this.attributeEntries(variant.attributes);
    return attributes.length ? attributes.join(' | ') : '';
  }

  stockLabel(variant: CustomerCatalogVariant): string {
    const stock = Number(variant.productStock || 0);
    if (stock <= 0) return 'Out of stock';
    if (stock <= 5) return 'Few left';
    return 'In stock';
  }

  stockClass(variant: CustomerCatalogVariant): string {
    const stock = Number(variant.productStock || 0);
    if (stock <= 0) return 'bg-rose-100 text-rose-700';
    if (stock <= 5) return 'bg-rose-50 text-rose-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  attributeEntries(attributes?: Record<string, string>): string[] {
    return Object.entries(attributes || {}).map(([key, value]) => `${key}: ${value}`);
  }

  private setBusy(key: string, value: boolean): void {
    this.busyStates[key] = value;
  }

  private initializeStockAdjustments(): void {
    this.stockAdjustments = {};

    for (const [index, variant] of (this.product?.variants || []).entries()) {
      this.stockAdjustments[this.variantKey(variant, index)] = 1;
    }
  }
}
