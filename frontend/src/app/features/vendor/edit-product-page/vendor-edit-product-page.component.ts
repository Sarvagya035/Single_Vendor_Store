import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import {
  VendorCategoryRecord,
  VendorProductEditForm,
  VendorProductRecord
} from '../../../core/models/vendor.models';
import { VendorFormSectionComponent } from '../form-section/vendor-form-section.component';

interface FlatCategoryOption {
  _id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-vendor-edit-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent],
  template: `
    <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_28%,#f8fafc_100%)] pt-8 pb-12">
      <main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.28em] text-amber-500">Vendor Tools</p>
            <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-900">Edit Product</h1>
            <p class="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              Update the product details on a dedicated page, then return to the products list when you're done.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a routerLink="/vendor/products" class="btn-secondary !py-3">
              Back to Products
            </a>
          </div>
        </div>

        <div *ngIf="isLoading" class="glass-card py-20">
          <div class="flex flex-col items-center gap-4">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
            <p class="font-medium text-slate-500">Loading product details...</p>
          </div>
        </div>

        <div *ngIf="!isLoading && !product" class="glass-card py-16 text-center">
          <h2 class="text-2xl font-black text-slate-900">Product not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
            We couldn't load that product. It may have been deleted or the link may be outdated.
          </p>
          <a routerLink="/vendor/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">
            Return to Products
          </a>
        </div>

        <form *ngIf="!isLoading && product" class="space-y-8" (ngSubmit)="saveProduct()">
          <div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <app-vendor-form-section eyebrow="Core Product" title="Edit basics">
              <div class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2 md:col-span-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    [(ngModel)]="form.productName"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    placeholder="Wireless Headphones Pro"
                  >
                </div>

                <div class="space-y-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    [(ngModel)]="form.brand"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    placeholder="SoundSphere"
                  >
                </div>

                <div class="space-y-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</label>
                  <select
                    name="category"
                    [(ngModel)]="form.category"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  >
                    <option value="">Select category</option>
                    <option *ngFor="let option of flatCategories; trackBy: trackByFlatCategoryId" [value]="option._id">
                      {{ optionLabel(option) }}
                    </option>
                  </select>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</label>
                  <textarea
                    rows="5"
                    name="productDescription"
                    [(ngModel)]="form.productDescription"
                    class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    placeholder="Describe the product, features, materials, and buying value."
                  ></textarea>
                </div>

                <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="form.isActive"
                    name="isActive"
                    class="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500"
                  />
                  <span class="text-sm font-bold text-slate-700">Product is active.</span>
                </label>

                <div class="flex flex-col gap-3 sm:flex-row md:col-span-2">
                  <button type="submit" [disabled]="isSubmitting" class="btn-primary !px-8 !py-4">
                    {{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}
                  </button>
                  <button type="button" (click)="cancel()" class="btn-secondary !px-8 !py-4">
                    Cancel
                  </button>
                </div>
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Preview" title="Current product">
              <div class="space-y-5">
                <div class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                  <div class="aspect-[4/3] bg-slate-50">
                    <img
                      *ngIf="primaryImageUrl"
                      [src]="primaryImageUrl"
                      [alt]="product.productName"
                      class="h-full w-full object-cover"
                    />
                    <div
                      *ngIf="!primaryImageUrl"
                      class="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-slate-50 text-4xl font-black text-slate-400"
                    >
                      {{ product.productName.charAt(0) || 'P' }}
                    </div>
                  </div>
                  <div class="space-y-2 p-5">
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Product</p>
                    <h3 class="text-2xl font-black text-slate-900">{{ product.productName }}</h3>
                    <p class="text-sm font-medium text-slate-500">{{ product.brand || 'Generic' }}</p>
                  </div>
                </div>

                <div class="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600">
                  <p><span class="font-black text-slate-900">Variants:</span> {{ product.variants?.length || 0 }}</p>
                  <p><span class="font-black text-slate-900">Current Stock:</span> {{ totalStock }}</p>
                  <p><span class="font-black text-slate-900">Status:</span> {{ product.isActive ? 'Active' : 'Inactive' }}</p>
                </div>
              </div>
            </app-vendor-form-section>
          </div>
        </form>
      </main>
    </div>
  `
})
export class VendorEditProductPageComponent implements OnInit {
  productId = '';
  product: VendorProductRecord | null = null;
  isLoading = true;
  isSubmitting = false;
  categoriesTree: VendorCategoryRecord[] = [];
  flatCategories: FlatCategoryOption[] = [];

  form: VendorProductEditForm = this.createForm();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('productId') || '';
    if (!this.productId) {
      this.isLoading = false;
      this.errorService.showToast('Missing product id.', 'error');
      return;
    }

    this.loadCategories();
    this.loadProduct();
  }

  optionLabel(option: FlatCategoryOption): string {
    return `${'-- '.repeat(option.level)}${option.name}`;
  }

  totalStock = 0;
  get primaryImageUrl(): string | undefined {
    return this.product?.mainImages?.[0];
  }

  trackByFlatCategoryId(_: number, option: FlatCategoryOption): string {
    return option._id;
  }

  saveProduct() {
    if (!this.product) {
      return;
    }

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
      isActive: this.form.isActive
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
      }
    });
  }

  cancel() {
    this.router.navigate(['/vendor/products']);
  }

  private loadProduct() {
    this.vendorService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.product = res?.data || null;
        if (!this.product) {
          this.errorService.showToast('Product not found.', 'error');
          return;
        }

        this.totalStock = (this.product.variants || []).reduce(
          (sum, variant) => sum + (variant.productStock || 0),
          0
        );

        this.form = {
          productName: this.product.productName || '',
          productDescription: this.product.productDescription || '',
          brand: this.product.brand || '',
          category: this.product.categoryDetails?._id || this.product.category || '',
          isActive: this.product.isActive !== false
        };
      },
      error: () => {
        this.isLoading = false;
        this.product = null;
        this.errorService.showToast('Unable to load product details.', 'error');
      }
    });
  }

  private loadCategories() {
    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.categoriesTree = res?.data || [];
        this.flatCategories = this.buildFlatCategories(this.categoriesTree);
      },
      error: () => {
        this.errorService.showToast('Failed to load categories.', 'error');
      }
    });
  }

  private createForm(): VendorProductEditForm {
    return {
      productName: '',
      productDescription: '',
      brand: '',
      category: '',
      isActive: true
    };
  }

  private buildFlatCategories(nodes: VendorCategoryRecord[]): FlatCategoryOption[] {
    const flat: FlatCategoryOption[] = [];
    this.flattenCategories(nodes, flat);
    return flat;
  }

  private flattenCategories(nodes: VendorCategoryRecord[], target: FlatCategoryOption[]) {
    for (const node of nodes) {
      target.push({
        _id: node._id,
        name: node.name,
        level: node.level || 0
      });

      if (node.children?.length) {
        this.flattenCategories(node.children, target);
      }
    }
  }
}

