import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
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
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent, PageHeaderComponent],
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
            <a routerLink="/vendor/products" class="btn-secondary w-full !px-6 !py-3 sm:w-auto">Back to Products</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'edit']" class="btn-secondary w-full !px-6 !py-3 sm:w-auto">Edit Product</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'restock']" class="btn-secondary w-full !px-6 !py-3 sm:w-auto">Restock</a>
          </app-page-header>
        </div>

        <div *ngIf="isLoading" class="px-6 py-20 text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading variants...</p>
        </div>

        <div *ngIf="!isLoading && product" class="border-t border-slate-200 vendor-section-body lg:py-6">
          <div class="grid gap-6">
            <div class="vendor-grid-3">
              <article class="vendor-stat-card">
                <p class="vendor-stat-label">Product</p>
                <p class="vendor-stat-value !text-2xl">{{ product.productName }}</p>
                <p class="mt-2 text-sm font-semibold text-slate-500">{{ product.brand || 'Generic' }}</p>
              </article>
              <article class="vendor-stat-card">
                <p class="vendor-stat-label">Variant Count</p>
                <p class="vendor-stat-value">{{ product.variants?.length || 0 }}</p>
                <p class="vendor-stat-copy">Each combination is managed independently here.</p>
              </article>
              <article class="vendor-stat-card">
                <p class="vendor-stat-label">Total Stock</p>
                <p class="vendor-stat-value">{{ totalStock }}</p>
                <p class="vendor-stat-copy">Combined inventory across all variants.</p>
              </article>
            </div>

            <app-vendor-form-section eyebrow="Add Variant" title="Create a new variant">
              <div class="vendor-grid-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.75fr))_auto]">
                <input [(ngModel)]="newVariant.attributesText" name="new-attributes" placeholder="Weight:500g, Type:Roasted" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                <input type="number" [(ngModel)]="newVariant.productPrice" name="new-price" min="0" placeholder="Price" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                <input type="number" [(ngModel)]="newVariant.discountPercentage" name="new-discount" min="0" max="100" placeholder="Discount %" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                <input type="number" [(ngModel)]="newVariant.productStock" name="new-stock" min="0" placeholder="Stock" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                <label class="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                  {{ newVariant.imageFile?.name || 'Upload image' }}
                  <input type="file" accept="image/*" class="hidden" (change)="onNewVariantImageSelected($event)" />
                </label>
              </div>
              <button type="button" (click)="addVariant()" [disabled]="isAddingVariant" class="btn-primary mt-5 w-full !px-6 !py-3 disabled:opacity-60 sm:w-auto">
                {{ isAddingVariant ? 'Adding Variant...' : 'Add Variant' }}
              </button>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Variant Cards" title="Edit existing variants">
              <div *ngIf="!(product.variants?.length)" class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-500">
                No variants exist for this product yet.
              </div>

              <div class="vendor-grid-2 lg:grid-cols-2" *ngIf="product.variants?.length">
                <article *ngFor="let variant of product.variants; trackBy: trackByVariant" class="rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div class="flex min-w-0 items-center gap-4">
                      <div class="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                        <img *ngIf="variant.variantImage" [src]="variant.variantImage" [alt]="variant.sku || 'Variant'" class="h-full w-full object-cover" />
                        <img *ngIf="!variant.variantImage && productImageUrl" [src]="productImageUrl" [alt]="product.productName || 'Product'" class="h-full w-full object-cover opacity-80" />
                      </div>
                      <div class="min-w-0">
                        <h3 class="truncate text-lg font-black text-slate-900">{{ variantAttributeSummaryLabel(variant) }}</h3>
                        <p class="mt-1 text-sm font-semibold text-slate-500">{{ variant.sku || 'SKU pending' }}</p>
                      </div>
                    </div>
                    <button type="button" (click)="deleteVariant(variant)" [disabled]="busyDeleteId === variant._id" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-rose-700 disabled:opacity-60 sm:shrink-0">
                      {{ busyDeleteId === variant._id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
  
                  <div class="mt-5 grid gap-4">
                    <input [(ngModel)]="variantForms[variant._id || ''].attributesText" [name]="'attributes-' + (variant._id || '')" placeholder="Attributes" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />

                    <div class="grid gap-4 sm:grid-cols-2">
                      <input type="number" [(ngModel)]="variantForms[variant._id || ''].productPrice" [name]="'price-' + (variant._id || '')" min="0" placeholder="Price" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                      <input type="number" [(ngModel)]="variantForms[variant._id || ''].discountPercentage" [name]="'discount-' + (variant._id || '')" min="0" max="100" placeholder="Discount %" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <input type="number" [(ngModel)]="variantForms[variant._id || ''].productStock" [name]="'stock-' + (variant._id || '')" min="0" placeholder="Stock" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                      <input type="text" [(ngModel)]="variantForms[variant._id || ''].sku" [name]="'sku-' + (variant._id || '')" placeholder="SKU" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold uppercase text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
                    </div>

                    <label class="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600">
                      <span class="truncate">{{ variantForms[variant._id || ''].imageFile?.name || 'Upload replacement image' }}</span>
                      <input type="file" accept="image/*" class="hidden" (change)="onVariantImageSelected($event, variant)" />
                    </label>

                    <div class="grid gap-2 rounded-[1.4rem] border border-slate-200 bg-white p-4 text-sm font-medium text-slate-600">
                      <p><span class="font-black text-slate-900">Final Price:</span> {{ finalPriceLabel(variant) }}</p>
                      <p><span class="font-black text-slate-900">Current SKU:</span> {{ variant.sku || 'Pending' }}</p>
                    </div>
                  </div>

                  <div class="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button type="button" (click)="saveVariant(variant)" [disabled]="busySaveId === variant._id" class="btn-primary w-full !px-6 !py-3 disabled:opacity-60 sm:w-auto">
                      {{ busySaveId === variant._id ? 'Saving...' : 'Save Variant' }}
                    </button>
                    <button type="button" (click)="resetVariantForm(variant)" class="btn-secondary w-full !px-6 !py-3 sm:w-auto">Reset</button>
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

  onNewVariantImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newVariant.imageFile = input.files?.[0] || null;
  }

  onVariantImageSelected(event: Event, variant: VendorProductVariant): void {
    const input = event.target as HTMLInputElement;
    if (variant._id) {
      this.variantForms[variant._id].imageFile = input.files?.[0] || null;
    }
  }

  addVariant(): void {
    if (!this.product) return;
    const attributes = parseVariantAttributes(this.newVariant.attributesText);
    if (!Object.keys(attributes).length || this.newVariant.productPrice === null || this.newVariant.productStock === null) {
      this.errorService.showToast('New variants need attributes, price, and stock.', 'error');
      return;
    }
    if (!this.newVariant.imageFile) {
      this.errorService.showToast('A variant image is required to create a new variant.', 'error');
      return;
    }

    const data = new FormData();
    data.append('attributes', JSON.stringify(attributes));
    data.append('productPrice', String(this.newVariant.productPrice));
    data.append('discountPercentage', String(this.newVariant.discountPercentage || 0));
    data.append('productStock', String(this.newVariant.productStock));
    data.append('variantImage', this.newVariant.imageFile);

    this.isAddingVariant = true;
    this.vendorService.addVariant(this.product._id, data).subscribe({
      next: (res) => {
        this.isAddingVariant = false;
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to add variant.', 'error');
          return;
        }
        this.errorService.showToast('Variant added successfully.', 'success');
        this.newVariant = { attributesText: '', productPrice: null, discountPercentage: 0, productStock: null, imageFile: null };
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
    if (form.imageFile) {
      data.append('variantImage', form.imageFile);
    }

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
    };
  }
}
