import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { CardComponent as AppCardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent as AppEmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { StatCardComponent as AppStatCardComponent } from '../../../shared/ui/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  VendorProductRecord,
  VendorProductVariant,
  VendorVariantCreateForm,
  VendorVariantUpdateForm,
} from '../../../core/models/vendor.models';
import { VendorFormSectionComponent } from '../form-section/vendor-form-section.component';
import {
  formatVendorCurrency,
  parseVariantAttributes,
  primaryProductImage,
  totalProductStock,
  variantAttributeSummary,
  variantAttributesTextFromRecord,
} from '../product-management/vendor-product-management.utils';

@Component({
  selector: 'app-vendor-manage-variants-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent, PageHeaderComponent, AppCardComponent, AppEmptyStateComponent, AppStatCardComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Variant Management"
            title="Manage Variants"
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
            description="Edit product combinations here without mixing inventory-only changes into the product details page."
          >
            <a
              routerLink="/vendor/products"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Back to Products
            </a>
            <a
              *ngIf="product"
              [routerLink]="['/vendor/products', product._id, 'edit']"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Edit Product
            </a>
            <a
              *ngIf="product"
              [routerLink]="['/vendor/products', product._id, 'restock']"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Restock
            </a>
          </app-page-header>
        </div>

        <app-card *ngIf="isLoading" cardClass="py-20 text-center vendor-section-body">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading variants...</p>
        </app-card>

        <div *ngIf="!isLoading && product" class="space-y-6 vendor-section-body">
          <div class="grid gap-6">
            <div class="vendor-grid-3">
              <app-stat-card label="Product" [value]="product.productName" cardClass="border-l-4 border-l-indigo-500">
                <div appStatCardBody class="mt-2 text-sm font-semibold text-slate-500">{{ product.brand || 'Generic' }}</div>
              </app-stat-card>
              <app-stat-card label="Variant Count" [value]="(product.variants?.length || 0).toString()" cardClass="border-l-4 border-l-sky-500" copy="Each combination is managed independently here." />
              <app-stat-card label="Total Stock" [value]="totalStock.toString()" cardClass="border-l-4 border-l-emerald-500" copy="Combined inventory across all variants." />
            </div>

            <app-vendor-form-section eyebrow="Add Variant" title="Create a new variant">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.75fr))_auto]">
                <label class="grid gap-1.5">
                  <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Variant Option / Color / Weight / Size</span>
                  <input [(ngModel)]="newVariant.attributesText" name="new-attributes" placeholder="Weight:500g, Type:Roasted" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                </label>
                <label class="grid gap-1.5">
                  <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Price</span>
                  <input type="number" [(ngModel)]="newVariant.productPrice" name="new-price" min="0" placeholder="Price" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                </label>
                <label class="grid gap-1.5">
                  <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Offer / Discount</span>
                  <input type="number" [(ngModel)]="newVariant.discountPercentage" name="new-discount" min="0" max="100" placeholder="Discount %" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                </label>
                <label class="grid gap-1.5">
                  <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Stock</span>
                  <input type="number" [(ngModel)]="newVariant.productStock" name="new-stock" min="0" placeholder="Stock" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                </label>
                <div class="grid gap-1.5 lg:col-span-5">
                  <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Variant Images</span>
                  <label class="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-amber-300 hover:text-slate-800">
                    <span class="truncate">{{ (newVariant.imageFiles?.length || 0) ? ((newVariant.imageFiles?.length || 0) + ' image' + ((newVariant.imageFiles?.length || 0) > 1 ? 's' : '') + ' selected') : 'Upload images' }}</span>
                    <span class="ml-3 shrink-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Browse</span>
                    <input type="file" accept="image/*" multiple class="sr-only" (change)="onNewVariantImagesSelected($event)" />
                  </label>
                  <div *ngIf="(newVariant.imagePreviews?.length || 0)" class="flex flex-wrap gap-2">
                    <div *ngFor="let preview of (newVariant.imagePreviews || []); let imageIndex = index" class="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img [src]="preview" alt="New variant preview" class="h-full w-full object-cover" />
                      <button type="button" class="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-black text-rose-600 shadow-sm" (click)="removeNewVariantImage(imageIndex)">×</button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="mt-5 inline-flex items-center justify-center rounded-full bg-[#8B5E3C] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#754c30] disabled:cursor-not-allowed disabled:opacity-60"
                (click)="addVariant()"
                [disabled]="isAddingVariant"
              >
                {{ isAddingVariant ? 'Adding Variant...' : 'Add Variant' }}
              </button>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Variant Cards" title="Edit existing variants">
              <app-empty-state *ngIf="!(product.variants?.length)" title="No variants yet" description="Add the first variant to start managing combinations and inventory here." cardClass="border-dashed" />

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start" *ngIf="product.variants?.length">
                <article *ngFor="let variant of product.variants; trackBy: trackByVariant" class="vendor-card-compact h-full flex flex-col gap-4 !p-4 sm:!p-5">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="flex min-w-0 items-center gap-3">
                      <div class="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 sm:h-16 sm:w-16">
                        <img *ngIf="variant.variantImage" [src]="variant.variantImage" [alt]="variant.sku || 'Variant'" class="h-full w-full object-cover" />
                        <img *ngIf="!variant.variantImage && productImageUrl" [src]="productImageUrl" [alt]="product.productName || 'Product'" class="h-full w-full object-cover opacity-80" />
                      </div>
                      <div class="min-w-0">
                        <h3 class="truncate text-base font-black text-slate-900 sm:text-lg">{{ variantAttributeSummaryLabel(variant) }}</h3>
                        <p class="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{{ variant.sku || 'SKU pending' }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
                      (click)="deleteVariant(variant)"
                      [disabled]="busyDeleteId === variant._id"
                    >
                      {{ busyDeleteId === variant._id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>

                  <div class="grid gap-3">
                    <label class="grid gap-1.5">
                      <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Variant Option / Color / Weight / Size</span>
                      <input
                        [(ngModel)]="variantForms[variant._id || ''].attributesText"
                        [name]="'attributes-' + (variant._id || '')"
                        placeholder="Weight:500g, Type:Roasted"
                        class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                      />
                    </label>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label class="grid gap-1.5">
                        <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Price</span>
                        <input
                          type="number"
                          [(ngModel)]="variantForms[variant._id || ''].productPrice"
                          [name]="'price-' + (variant._id || '')"
                          min="0"
                          placeholder="Price"
                          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                        />
                      </label>

                      <label class="grid gap-1.5">
                        <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Stock</span>
                        <input
                          type="number"
                          [(ngModel)]="variantForms[variant._id || ''].productStock"
                          [name]="'stock-' + (variant._id || '')"
                          min="0"
                          placeholder="Stock"
                          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                        />
                      </label>
                    </div>

                    <p class="text-[11px] font-medium leading-5 text-slate-500">Final Price updates based on price and discount.</p>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label class="grid gap-1.5">
                        <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Offer / Discount</span>
                        <input
                          type="number"
                          [(ngModel)]="variantForms[variant._id || ''].discountPercentage"
                          [name]="'discount-' + (variant._id || '')"
                          min="0"
                          max="100"
                          placeholder="Discount %"
                          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                        />
                      </label>

                      <label class="grid gap-1.5">
                        <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">SKU</span>
                        <input
                          type="text"
                          [(ngModel)]="variantForms[variant._id || ''].sku"
                          [name]="'sku-' + (variant._id || '')"
                          placeholder="SKU"
                          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold uppercase text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                        />
                      </label>
                    </div>

                    <div class="grid gap-1.5">
                      <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Variant Images</span>
                      <span class="text-[11px] font-medium leading-5 text-slate-500">Upload up to 5 images. Saving replaces the current set.</span>
                      <label class="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-amber-300 hover:text-slate-800">
                        <span class="truncate">{{ ((variantForms[variant._id || '']?.imageFiles?.length || 0)) ? ((variantForms[variant._id || '']?.imageFiles?.length || 0) + ' image' + ((variantForms[variant._id || '']?.imageFiles?.length || 0) > 1 ? 's' : '') + ' selected') : 'Upload images' }}</span>
                        <span class="ml-3 shrink-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Browse</span>
                        <input type="file" accept="image/*" multiple class="sr-only" (change)="onVariantImageSelected($event, variant)" />
                      </label>
                      <div *ngIf="(variantForms[variant._id || '']?.imagePreviews?.length || 0)" class="flex flex-wrap gap-2">
                        <div *ngFor="let preview of (variantForms[variant._id || '']?.imagePreviews || []); let imageIndex = index" class="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img [src]="preview" alt="Variant preview" class="h-full w-full object-cover" />
                          <button type="button" class="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-black text-rose-600 shadow-sm" (click)="removeVariantImage(variant, imageIndex)">×</button>
                        </div>
                      </div>
                    </div>

                    <div class="grid gap-1.5 rounded-[1.3rem] border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600">
                      <p><span class="font-black text-slate-900">Final Price:</span> {{ finalPriceLabel(variant) }}</p>
                      <p><span class="font-black text-slate-900">Current SKU:</span> {{ variant.sku || 'Pending' }}</p>
                    </div>
                  </div>

                  <div class="mt-auto grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full bg-[#8B5E3C] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#754c30] disabled:cursor-not-allowed disabled:opacity-60"
                      (click)="saveVariant(variant)"
                      [disabled]="busySaveId === variant._id"
                    >
                      {{ busySaveId === variant._id ? 'Saving...' : 'Save Variant' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      (click)="resetVariantForm(variant)"
                    >
                      Reset
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
export class VendorManageVariantsPageComponent implements OnInit {
  productId = '';
  product: VendorProductRecord | null = null;
  isLoading = true;
  isAddingVariant = false;
  busySaveId = '';
  busyDeleteId = '';
  totalStock = 0;
  variantForms: Record<string, VendorVariantUpdateForm> = {};
  newVariant: VendorVariantCreateForm = {
    attributesText: '',
    productPrice: null,
    discountPercentage: 0,
    productStock: null,
    imageFile: null,
    imageFiles: [],
    imagePreviews: [],
  };

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

  get productImageUrl(): string | undefined {
    return primaryProductImage(this.product);
  }

  variantAttributeSummaryLabel(variant: VendorProductVariant): string {
    return variantAttributeSummary(variant);
  }

  finalPriceLabel(variant: VendorProductVariant): string {
    const currentForm = this.variantForms[variant._id || ''];
    const price = Number(currentForm?.productPrice ?? variant.productPrice ?? 0);
    const discount = Number(currentForm?.discountPercentage ?? variant.discountPercentage ?? 0);
    const finalPrice = Math.max(0, Math.round(price - (price * discount) / 100));
    return formatVendorCurrency(finalPrice);
  }

  onNewVariantImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []).slice(0, 5);
    this.newVariant.imageFiles = files;
    this.newVariant.imagePreviews = files.map((file) => URL.createObjectURL(file));
    this.newVariant.imageFile = files[0] || null;
    input.value = '';
  }

  onVariantImageSelected(event: Event, variant: VendorProductVariant): void {
    const input = event.target as HTMLInputElement;
    if (variant._id) {
      const files = Array.from(input.files || []).slice(0, 5);
      const form = this.variantForms[variant._id];
      if (!form) {
        return;
      }

      form.imageFiles = files;
      form.imagePreviews = files.map((file) => URL.createObjectURL(file));
      form.imageFile = files[0] || null;
      input.value = '';
    }
  }

  removeNewVariantImage(imageIndex: number): void {
    const currentFiles = this.newVariant.imageFiles ?? [];
    const currentPreviews = this.newVariant.imagePreviews ?? [];
    if (imageIndex < 0 || imageIndex >= currentFiles.length) {
      return;
    }

    this.newVariant.imageFiles = currentFiles.filter((_, index) => index !== imageIndex);
    this.newVariant.imagePreviews = currentPreviews.filter((_, index) => index !== imageIndex);
    this.newVariant.imageFile = this.newVariant.imageFiles[0] || null;
  }

  removeVariantImage(variant: VendorProductVariant, imageIndex: number): void {
    if (!variant._id) {
      return;
    }

    const form = this.variantForms[variant._id];
    const currentFiles = form?.imageFiles ?? [];
    const currentPreviews = form?.imagePreviews ?? [];
    if (!form || imageIndex < 0 || imageIndex >= currentFiles.length) {
      return;
    }

    form.imageFiles = currentFiles.filter((_, index) => index !== imageIndex);
    form.imagePreviews = currentPreviews.filter((_, index) => index !== imageIndex);
    form.imageFile = form.imageFiles[0] || null;
  }

  addVariant(): void {
    if (!this.product) return;
    const attributes = parseVariantAttributes(this.newVariant.attributesText);
    if (!Object.keys(attributes).length || this.newVariant.productPrice === null || this.newVariant.productStock === null) {
      this.errorService.showToast('New variants need attributes, price, and stock.', 'error');
      return;
    }
    if (!(this.newVariant.imageFiles?.length || 0)) {
      this.errorService.showToast('At least one variant image is required to create a new variant.', 'error');
      return;
    }

    const data = new FormData();
    data.append('attributes', JSON.stringify(attributes));
    data.append('productPrice', String(this.newVariant.productPrice));
    data.append('discountPercentage', String(this.newVariant.discountPercentage || 0));
    data.append('productStock', String(this.newVariant.productStock));
    (this.newVariant.imageFiles || []).forEach((file) => data.append('variantImages', file));

    this.isAddingVariant = true;
    this.vendorService.addVariant(this.product._id, data).subscribe({
      next: (res) => {
        this.isAddingVariant = false;
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to add variant.', 'error');
          return;
        }
        this.errorService.showToast('Variant added successfully.', 'success');
        this.newVariant = {
          attributesText: '',
          productPrice: null,
          discountPercentage: 0,
          productStock: null,
          imageFile: null,
          imageFiles: [],
          imagePreviews: [],
        };
        this.loadProduct();
      },
      error: (err) => {
        this.isAddingVariant = false;
        this.errorService.showToast(err?.error?.message || 'Unable to add variant.', 'error');
      },
    });
  }

  saveVariant(variant: VendorProductVariant): void {
    if (!this.product || !variant._id) return;
    const form = this.variantForms[variant._id];
    const attributes = parseVariantAttributes(form.attributesText);
    if (!Object.keys(attributes).length || form.productPrice === null || form.productStock === null || !form.sku.trim()) {
      this.errorService.showToast('Each variant needs attributes, price, stock, and SKU.', 'error');
      return;
    }

    const data = new FormData();
    data.append('attributes', JSON.stringify(attributes));
    data.append('productPrice', String(form.productPrice));
    data.append('discountPercentage', String(form.discountPercentage || 0));
    data.append('productStock', String(form.productStock));
    data.append('sku', form.sku.trim());
    (form.imageFiles || []).forEach((file) => data.append('variantImages', file));

    this.busySaveId = variant._id;
    this.vendorService.updateVariant(this.product._id, variant._id, data).subscribe({
      next: (res) => {
        this.busySaveId = '';
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to update variant.', 'error');
          return;
          }
          this.errorService.showToast(`Variant ${form.sku.trim().toUpperCase()} updated successfully.`, 'success');
          this.appRefreshService.notify('vendor');
          this.loadProduct();
        },
      error: (err) => {
        this.busySaveId = '';
        this.errorService.showToast(err?.error?.message || 'Unable to update variant.', 'error');
      },
    });
  }

  resetVariantForm(variant: VendorProductVariant): void {
    if (!variant._id) return;
    this.variantForms[variant._id] = this.mapVariantToForm(variant);
  }

  deleteVariant(variant: VendorProductVariant): void {
    if (!this.product || !variant._id) return;
    const confirmed = window.confirm(`Delete variant ${variant.sku || 'without SKU'} from "${this.product.productName}"?`);
    if (!confirmed) return;

    this.busyDeleteId = variant._id;
    this.vendorService.deleteVariant(this.product._id, variant._id).subscribe({
      next: (res) => {
        this.busyDeleteId = '';
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to delete variant.', 'error');
          return;
        }
        this.errorService.showToast('Variant deleted successfully.', 'success');
        this.loadProduct();
      },
      error: (err) => {
        this.busyDeleteId = '';
        this.errorService.showToast(err?.error?.message || 'Unable to delete variant.', 'error');
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
        this.syncVariantForms();
      },
      error: () => {
        this.isLoading = false;
        this.product = null;
        this.errorService.showToast('Unable to load product variants.', 'error');
      },
    });
  }

  private syncVariantForms(): void {
    const forms: Record<string, VendorVariantUpdateForm> = {};
    (this.product?.variants || []).forEach((variant) => {
      if (variant._id) {
        forms[variant._id] = this.mapVariantToForm(variant);
      }
    });
    this.variantForms = forms;
  }

  private mapVariantToForm(variant: VendorProductVariant): VendorVariantUpdateForm {
    return {
      attributesText: variantAttributesTextFromRecord(variant),
      productPrice: variant.productPrice ?? null,
      discountPercentage: variant.discountPercentage ?? 0,
      productStock: variant.productStock ?? 0,
      sku: variant.sku || '',
      imageFile: null,
      imageFiles: [],
      imagePreviews: Array.isArray(variant.variantImages) && variant.variantImages.length
        ? [...variant.variantImages]
        : variant.variantImage
          ? [variant.variantImage]
          : [],
    };
  }
}
