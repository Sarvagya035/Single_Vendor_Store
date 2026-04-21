import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorProductRecord, VendorProductVariant } from '../../../core/models/vendor.models';
import { VendorFormSectionComponent } from '../form-section/vendor-form-section.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  primaryProductImage,
  totalProductStock,
  variantAttributeSummary,
} from '../product-management/vendor-product-management.utils';

@Component({
  selector: 'app-vendor-restock-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header
            eyebrow="Inventory Management"
            title="Manage Inventory / Restock"
            titleClass="!text-[1.9rem] sm:!text-[2.2rem]"
            description="This page is only for stock updates. Product details and variant editing stay separate so inventory work stays fast and focused."
          >
            <a routerLink="/vendor/products" class="btn-secondary !px-6 !py-3">Back to Products</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'edit']" class="btn-secondary !px-6 !py-3">Edit Product</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'variants']" class="btn-secondary !px-6 !py-3">Manage Variants</a>
          </app-page-header>
        </div>

        <div *ngIf="isLoading" class="px-6 py-20 text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading inventory details...</p>
        </div>

        <div *ngIf="!isLoading && product" class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <div class="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <app-vendor-form-section eyebrow="Inventory Summary" title="Current product">
              <div class="space-y-5">
                <div class="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
                  <div class="aspect-[4/3] bg-slate-50">
                    <img *ngIf="primaryImageUrl" [src]="primaryImageUrl" [alt]="product.productName" class="h-full w-full object-cover" />
                    <div *ngIf="!primaryImageUrl" class="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-4xl font-black text-slate-400">{{ product.productName.charAt(0) || 'P' }}</div>
                  </div>
                  <div class="p-5">
                    <h2 class="vendor-panel-title">{{ product.productName }}</h2>
                    <p class="mt-2 text-sm font-semibold text-slate-500">{{ product.brand || 'Generic' }}</p>
                  </div>
                </div>

                <div class="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600">
                  <p><span class="font-black text-slate-900">Variants:</span> {{ product.variants?.length || 0 }}</p>
                  <p><span class="font-black text-slate-900">Current Stock:</span> {{ totalStock }}</p>
                  <p><span class="font-black text-slate-900">Status:</span> {{ product.isActive ? 'Active' : 'Inactive' }}</p>
                </div>
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Restock Workspace" title="Variant stock updates">
              <div *ngIf="!(product.variants?.length)" class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-500">
                No variants available for inventory management yet.
              </div>

              <div class="space-y-4" *ngIf="product.variants?.length">
                <article *ngFor="let variant of product.variants; trackBy: trackByVariant" class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div class="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.65fr))_auto] lg:items-end">
                    <div class="space-y-2">
                      <p class="text-lg font-black text-slate-900">{{ variantAttributeSummaryLabel(variant) }}</p>
                      <p class="text-sm font-semibold text-slate-500">{{ variant.sku || 'SKU pending' }}</p>
                      <p class="text-sm font-medium text-slate-600">Current Stock: <span class="font-black text-slate-900">{{ variant.productStock || 0 }}</span></p>
                    </div>

                    <div class="space-y-2">
                      <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Add Stock</label>
                      <input type="number" min="1" [(ngModel)]="restockDrafts[variant._id || '']" [name]="'restock-' + (variant._id || '')" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                    </div>

                    <div class="space-y-2">
                      <p class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">New Stock Preview</p>
                      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-black text-slate-900">
                        {{ projectedStock(variant) }}
                      </div>
                    </div>

                    <div class="space-y-2">
                      <p class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Availability</p>
                      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                        {{ projectedStock(variant) > 0 ? 'In stock' : 'Out of stock' }}
                      </div>
                    </div>

                    <button type="button" (click)="restockVariant(variant)" [disabled]="!variant._id || busyVariantId === variant._id" class="btn-primary !px-6 !py-3 disabled:opacity-60">
                      {{ busyVariantId === variant._id ? 'Updating...' : 'Update Stock' }}
                    </button>
                  </div>
                </article>
              </div>
            </app-vendor-form-section>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class VendorRestockPageComponent implements OnInit {
  productId = '';
  product: VendorProductRecord | null = null;
  isLoading = true;
  totalStock = 0;
  busyVariantId = '';
  restockDrafts: Record<string, number | null> = {};

  constructor(
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private errorService: ErrorService,
    private appRefreshService: AppRefreshService,
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId') || '';
    this.loadProduct();
  }

  get primaryImageUrl(): string | undefined {
    return primaryProductImage(this.product);
  }

  projectedStock(variant: VendorProductVariant): number {
    const currentStock = Number(variant.productStock || 0);
    const toAdd = Number(this.restockDrafts[variant._id || ''] || 0);
    return currentStock + (Number.isFinite(toAdd) && toAdd > 0 ? toAdd : 0);
  }

  variantAttributeSummaryLabel(variant: VendorProductVariant): string {
    return variantAttributeSummary(variant);
  }

  restockVariant(variant: VendorProductVariant): void {
    if (!this.product || !variant._id) return;
    const stockToAdd = Number(this.restockDrafts[variant._id] || 0);
    if (!Number.isFinite(stockToAdd) || stockToAdd <= 0) {
      this.errorService.showToast('Enter a valid restock quantity greater than zero.', 'error');
      return;
    }

    this.busyVariantId = variant._id;
    this.vendorService.restockVariant(this.product._id, variant._id, stockToAdd).subscribe({
      next: (res) => {
        this.busyVariantId = '';
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to restock variant.', 'error');
          return;
        }
        this.restockDrafts[variant._id || ''] = null;
        this.errorService.showToast(`Added ${stockToAdd} units to ${variant.sku || 'the variant'}.`, 'success');
        this.appRefreshService.notify('vendor');
        this.loadProduct();
      },
      error: (err) => {
        this.busyVariantId = '';
        this.errorService.showToast(err?.error?.message || 'Unable to restock variant.', 'error');
      },
    });
  }

  trackByVariant(index: number, variant: VendorProductVariant): string {
    return variant._id || variant.sku || String(index);
  }

  private loadProduct(): void {
    this.isLoading = true;
    this.vendorService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.product = res?.data || null;
        this.totalStock = totalProductStock(this.product);
        (this.product?.variants || []).forEach((variant) => {
          if (variant._id && this.restockDrafts[variant._id] === undefined) {
            this.restockDrafts[variant._id] = null;
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.product = null;
        this.errorService.showToast('Unable to load inventory details.', 'error');
      },
    });
  }
}
