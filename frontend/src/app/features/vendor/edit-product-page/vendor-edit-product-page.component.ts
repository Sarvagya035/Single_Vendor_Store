import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import {
  VendorCategoryRecord,
  VendorProductEditForm,
  VendorProductRecord,
} from '../../../core/models/vendor.models';
import { VendorFormSectionComponent } from '../form-section/vendor-form-section.component';
import {
  FlatCategoryOption,
  buildFlatCategories,
  categoryOptionLabel,
  primaryProductImage,
  totalProductStock,
} from '../product-management/vendor-product-management.utils';

@Component({
  selector: 'app-vendor-edit-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent],
  template: `
    <div class="space-y-8">
      <div class="vendor-page-hero">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl">
            <p class="app-page-eyebrow">Vendor Products</p>
            <h1 class="app-page-title">Edit Product Details</h1>
            <p class="app-page-description">
              This page is only for customer-facing product information. Inventory and variant operations live in their own dedicated workspaces.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/vendor/products" class="btn-secondary !px-6 !py-3">Back to Products</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'restock']" class="btn-secondary !px-6 !py-3">Go to Restock</a>
            <a *ngIf="product" [routerLink]="['/vendor/products', product._id, 'variants']" class="btn-secondary !px-6 !py-3">Manage Variants</a>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="vendor-page-shell py-20 text-center">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
        <p class="mt-4 text-sm font-medium text-slate-500">Loading product details...</p>
      </div>

      <div *ngIf="!isLoading && !product" class="glass-card py-16 text-center">
        <h2 class="vendor-empty-title">Product not found</h2>
        <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
          We couldn't load that product. It may have been deleted or the link may be outdated.
        </p>
        <a routerLink="/vendor/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">Return to Products</a>
      </div>

      <form *ngIf="!isLoading && product" class="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]" (ngSubmit)="saveProduct()">
        <app-vendor-form-section eyebrow="Customer Facing" title="Editable product details">
          <div class="grid gap-5 md:grid-cols-2">
            <label class="space-y-2 md:col-span-2">
              <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Product Name</span>
              <input type="text" name="productName" [(ngModel)]="form.productName" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
            </label>

            <label class="space-y-2">
              <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</span>
              <input type="text" name="brand" [(ngModel)]="form.brand" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" />
            </label>

            <label class="space-y-2">
              <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</span>
              <select name="category" [(ngModel)]="form.category" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100">
                <option value="">Select category</option>
                <option *ngFor="let option of flatCategories; trackBy: trackByCategory" [value]="option._id">{{ optionLabel(option) }}</option>
              </select>
            </label>

            <label class="space-y-2 md:col-span-2">
              <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</span>
              <textarea rows="7" name="productDescription" [(ngModel)]="form.productDescription" class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"></textarea>
            </label>

            <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:col-span-2">
              <input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500" />
              <span class="text-sm font-bold text-slate-700">Product is active and visible to customers.</span>
            </label>

            <div class="flex flex-col gap-3 sm:flex-row md:col-span-2">
              <button type="submit" [disabled]="isSubmitting" class="btn-primary !px-8 !py-4">{{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}</button>
              <button type="button" (click)="cancel()" class="btn-secondary !px-8 !py-4">Cancel</button>
            </div>
          </div>
        </app-vendor-form-section>

        <app-vendor-form-section eyebrow="Preview" title="Product summary">
          <div class="space-y-5">
            <div class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div class="aspect-[4/3] bg-slate-50">
                <img *ngIf="primaryImageUrl" [src]="primaryImageUrl" [alt]="product.productName" class="h-full w-full object-cover" />
                <div *ngIf="!primaryImageUrl" class="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-4xl font-black text-slate-400">
                  {{ product.productName.charAt(0) || 'P' }}
                </div>
              </div>
              <div class="space-y-2 p-5">
                <p class="vendor-stat-label">Product</p>
                <h3 class="vendor-panel-title">{{ form.productName || product.productName }}</h3>
                <p class="text-sm font-medium text-slate-500">{{ form.brand || product.brand || 'Generic' }}</p>
              </div>
            </div>

            <div class="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600">
              <p><span class="font-black text-slate-900">Category:</span> {{ categoryPreview }}</p>
              <p><span class="font-black text-slate-900">Variants:</span> {{ product.variants?.length || 0 }}</p>
              <p><span class="font-black text-slate-900">Total Stock:</span> {{ totalStock }}</p>
              <p><span class="font-black text-slate-900">Status:</span> {{ form.isActive ? 'Active' : 'Inactive' }}</p>
            </div>

            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 text-sm font-medium leading-relaxed text-slate-600">
              {{ form.productDescription || 'Your product description preview appears here as you edit.' }}
            </div>
          </div>
        </app-vendor-form-section>
      </form>
    </div>
  `,
})
export class VendorEditProductPageComponent implements OnInit {
  productId = '';
  product: VendorProductRecord | null = null;
  isLoading = true;
  isSubmitting = false;
  categoriesTree: VendorCategoryRecord[] = [];
  flatCategories: FlatCategoryOption[] = [];
  totalStock = 0;

  form: VendorProductEditForm = {
    productName: '',
    productDescription: '',
    brand: '',
    category: '',
    isActive: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

    this.loadCategories();
    this.loadProduct();
  }

  get primaryImageUrl(): string | undefined {
    return primaryProductImage(this.product);
  }

  get categoryPreview(): string {
    return this.flatCategories.find((item) => item._id === this.form.category)?.name || this.product?.categoryDetails?.name || 'Uncategorized';
  }

  optionLabel(option: FlatCategoryOption): string {
    return categoryOptionLabel(option);
  }

  saveProduct(): void {
    if (!this.product) return;

    const productName = this.form.productName.trim();
    const productDescription = this.form.productDescription.trim();
    if (!productName || !productDescription) {
      this.errorService.showToast('Product name and description are required.', 'error');
      return;
    }

    this.isSubmitting = true;
    this.vendorService.updateProduct(this.product._id, {
      productName,
      productDescription,
      brand: this.form.brand.trim(),
      category: this.form.category || this.product.categoryDetails?._id || this.product.category,
      isActive: this.form.isActive,
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to update product.', 'error');
          return;
        }
        this.errorService.showToast('Product updated successfully.', 'success');
        this.router.navigate(['/vendor/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorService.showToast(err?.error?.message || 'Unable to update product.', 'error');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/vendor/products']);
  }

  trackByCategory(_: number, option: FlatCategoryOption): string {
    return option._id;
  }

  private loadProduct(): void {
    this.vendorService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.product = res?.data || null;
        if (!this.product) {
          this.errorService.showToast('Product not found.', 'error');
          return;
        }
        this.totalStock = totalProductStock(this.product);
        this.form = {
          productName: this.product.productName || '',
          productDescription: this.product.productDescription || '',
          brand: this.product.brand || '',
          category: this.product.categoryDetails?._id || this.product.category || '',
          isActive: this.product.isActive !== false,
        };
      },
      error: () => {
        this.isLoading = false;
        this.product = null;
        this.errorService.showToast('Unable to load product details.', 'error');
      },
    });
  }

  private loadCategories(): void {
    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.categoriesTree = res?.data || [];
        this.flatCategories = buildFlatCategories(this.categoriesTree);
      },
      error: () => {
        this.errorService.showToast('Failed to load categories.', 'error');
      },
    });
  }
}
