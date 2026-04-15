import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorProductRecord, VendorProductVariant } from '../../../core/models/vendor.models';
import {
  formatVendorCurrency,
  formatVendorDate,
  primaryProductImage,
  totalProductStock,
  variantAttributeSummary,
} from '../product-management/vendor-product-management.utils';

@Component({
  selector: 'app-vendor-view-product-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="space-y-8">
      <div class="rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffaf4_0%,#f8ecdb_55%,#fff6ea_100%)] px-6 py-7 shadow-[0_28px_70px_rgba(111,78,55,0.12)] lg:px-8">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl">
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600">Vendor Product View</p>
            <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Product Details</h1>
            <p class="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              Review this product exactly as a vendor record, with images, pricing, stock, and variants, without any customer purchase actions.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a routerLink="/vendor/products" class="btn-secondary !px-6 !py-3">Back to Products</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'edit']" class="btn-secondary !px-6 !py-3">Edit</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'restock']" class="btn-secondary !px-6 !py-3">Restock</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'variants']" class="btn-primary !px-6 !py-3">Manage Variants</a>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="glass-card py-20 text-center">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
        <p class="mt-4 text-sm font-medium text-slate-500">Loading product details...</p>
      </div>

      <div *ngIf="!isLoading && !product" class="glass-card py-16 text-center">
        <h2 class="text-2xl font-black text-slate-900">Product not found</h2>
        <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
          We could not load this vendor product. It may have been removed or the link may be outdated.
        </p>
        <a routerLink="/vendor/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">Return to Products</a>
      </div>

      <div *ngIf="!isLoading && product" class="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section class="app-surface overflow-hidden p-5 sm:p-6">
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div class="space-y-4">
              <div class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
                <div class="aspect-[4/3]">
                  <img *ngIf="activeImage" [src]="activeImage" [alt]="product.productName" class="h-full w-full object-cover" />
                  <div *ngIf="!activeImage" class="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-5xl font-black text-slate-400">
                    {{ product.productName.charAt(0) || 'P' }}
                  </div>
                </div>
              </div>

              <div *ngIf="galleryImages.length > 1" class="grid grid-cols-4 gap-3 sm:grid-cols-5">
                <button
                  *ngFor="let image of galleryImages; let index = index; trackBy: trackByImage"
                  type="button"
                  (click)="selectImage(image)"
                  class="overflow-hidden rounded-2xl border transition"
                  [ngClass]="image === activeImage ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-amber-200'"
                  [attr.aria-label]="'View product image ' + (index + 1)"
                >
                  <img [src]="image" [alt]="product.productName + ' image ' + (index + 1)" class="h-20 w-full object-cover" />
                </button>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Customer-facing product</p>
                <h2 class="mt-3 text-3xl font-black text-slate-900">{{ product.productName }}</h2>
                <p class="mt-2 text-sm font-semibold text-slate-600">{{ product.brand || 'Generic brand' }}</p>
              </div>

              <div class="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 text-sm font-medium text-slate-600">
                <p><span class="font-black text-slate-900">Category:</span> {{ categoryName }}</p>
                <p><span class="font-black text-slate-900">Created:</span> {{ createdLabel }}</p>
                <p><span class="font-black text-slate-900">Variants:</span> {{ product.variants?.length || 0 }}</p>
                <p><span class="font-black text-slate-900">Total stock:</span> {{ totalStock }}</p>
                <p><span class="font-black text-slate-900">Base price:</span> {{ basePriceLabel }}</p>
                <p>
                  <span class="font-black text-slate-900">Status:</span>
                  <span
                    class="ml-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                    [ngClass]="product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </p>
              </div>

              <div class="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Description</p>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-600">
                  {{ product.productDescription || 'No description available for this product.' }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <div class="app-surface p-5 sm:p-6">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Product images</p>
            <h3 class="mt-2 text-2xl font-black text-slate-900">Gallery summary</h3>
            <div class="mt-5 grid gap-3 text-sm font-medium text-slate-600">
              <p><span class="font-black text-slate-900">Main images:</span> {{ product.mainImages?.length || 0 }}</p>
              <p><span class="font-black text-slate-900">Primary image:</span> {{ activeImage ? 'Available' : 'Not uploaded' }}</p>
              <p><span class="font-black text-slate-900">Variant images:</span> {{ variantImageCount }}</p>
            </div>
          </div>

          <div class="app-surface p-5 sm:p-6">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Variant options</p>
            <h3 class="mt-2 text-2xl font-black text-slate-900">Configured attributes</h3>

            <div *ngIf="product.variantOptions?.length; else noOptions" class="mt-5 space-y-3">
              <div *ngFor="let option of product.variantOptions; trackBy: trackByOption" class="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
                <p class="text-sm font-black text-slate-900">{{ option.name || 'Option' }}</p>
                <p class="mt-2 text-sm font-medium text-slate-600">{{ (option.values || []).join(', ') || 'No values' }}</p>
              </div>
            </div>

            <ng-template #noOptions>
              <p class="mt-5 text-sm font-medium text-slate-500">No variant options defined for this product.</p>
            </ng-template>
          </div>
        </section>
      </div>

      <section *ngIf="!isLoading && product" class="app-surface p-5 sm:p-6">
        <div class="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Variant inventory</p>
            <h3 class="mt-2 text-2xl font-black text-slate-900">Product variants</h3>
          </div>
          <p class="text-sm font-medium text-slate-500">
            Vendor-only detail view. No customer purchase buttons are shown here.
          </p>
        </div>

        <div *ngIf="product.variants?.length; else noVariants" class="mt-6 grid gap-4 lg:grid-cols-2">
          <article
            *ngFor="let variant of product.variants; trackBy: trackByVariant"
            class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
          >
            <div class="flex items-start gap-4">
              <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img *ngIf="variant.variantImage" [src]="variant.variantImage" [alt]="variant.sku || 'Variant image'" class="h-full w-full object-cover" />
                <div *ngIf="!variant.variantImage" class="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  No image
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-black text-slate-900">{{ variant.sku || 'SKU pending' }}</p>
                    <p class="mt-1 text-sm font-medium text-slate-600">{{ variantAttributeText(variant) }}</p>
                  </div>
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                    [ngClass]="variant.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ variant.isAvailable ? 'Available' : 'Unavailable' }}
                  </span>
                </div>

                <div class="mt-4 grid gap-2 text-sm font-medium text-slate-600 sm:grid-cols-2">
                  <p><span class="font-black text-slate-900">Price:</span> {{ formatCurrency(variant.productPrice) }}</p>
                  <p><span class="font-black text-slate-900">Final price:</span> {{ formatCurrency(variant.finalPrice) }}</p>
                  <p><span class="font-black text-slate-900">Discount:</span> {{ variant.discountPercentage || 0 }}%</p>
                  <p><span class="font-black text-slate-900">Stock:</span> {{ variant.productStock || 0 }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <ng-template #noVariants>
          <div class="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm font-medium text-slate-500">
            No variants available for this product yet.
          </div>
        </ng-template>
      </section>
    </section>
  `,
})
export class VendorViewProductPageComponent implements OnInit {
  productId = '';
  product: VendorProductRecord | null = null;
  isLoading = true;
  activeImage?: string;

  constructor(
    private route: ActivatedRoute,
    private vendorService: VendorService,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId') || '';
    if (!this.productId) {
      this.isLoading = false;
      this.errorService.showToast('Missing product id.', 'error');
      return;
    }

    this.loadProduct();
  }

  get galleryImages(): string[] {
    const imageSet = new Set<string>();

    for (const image of this.product?.mainImages || []) {
      if (image) {
        imageSet.add(image);
      }
    }

    for (const variant of this.product?.variants || []) {
      if (variant.variantImage) {
        imageSet.add(variant.variantImage);
      }
    }

    return Array.from(imageSet);
  }

  get createdLabel(): string {
    return formatVendorDate(this.product?.createdAt);
  }

  get totalStock(): number {
    return totalProductStock(this.product);
  }

  get categoryName(): string {
    const categoryDetailsName = this.product?.categoryDetails?.name;
    if (categoryDetailsName) {
      return categoryDetailsName;
    }

    const populatedCategory = this.product?.category;
    if (populatedCategory && typeof populatedCategory === 'object') {
      const categoryRecord = populatedCategory as { name?: string };
      return String(categoryRecord.name || 'Uncategorized');
    }

    return 'Uncategorized';
  }

  get basePriceLabel(): string {
    const basePrice = this.product?.basePrice;
    if (typeof basePrice === 'number' && !Number.isNaN(basePrice)) {
      return formatVendorCurrency(basePrice);
    }

    const firstVariantPrice = this.product?.variants?.find((variant) => typeof variant.productPrice === 'number')?.productPrice;
    return formatVendorCurrency(firstVariantPrice);
  }

  get variantImageCount(): number {
    return (this.product?.variants || []).filter((variant) => !!variant.variantImage).length;
  }

  selectImage(image: string): void {
    this.activeImage = image;
  }

  trackByImage(_: number, image: string): string {
    return image;
  }

  trackByOption(index: number, option: { name?: string }): string {
    return `${option.name || 'option'}-${index}`;
  }

  trackByVariant(index: number, variant: VendorProductVariant): string {
    return variant._id || variant.sku || String(index);
  }

  variantAttributeText(variant: VendorProductVariant): string {
    return variantAttributeSummary(variant);
  }

  formatCurrency(value?: number): string {
    return formatVendorCurrency(value);
  }

  private loadProduct(): void {
    this.vendorService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.product = res?.data || null;
        this.activeImage = primaryProductImage(this.product) || this.galleryImages[0];

        if (!this.product) {
          this.errorService.showToast('Product not found.', 'error');
        }
      },
      error: () => {
        this.isLoading = false;
        this.product = null;
        this.errorService.showToast('Unable to load product details.', 'error');
      },
    });
  }
}
