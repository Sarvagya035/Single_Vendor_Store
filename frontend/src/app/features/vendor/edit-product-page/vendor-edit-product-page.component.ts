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
import { PageShellComponent } from '../../../shared/ui/page-shell.component';

interface FlatCategoryOption {
  _id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-vendor-edit-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent, PageShellComponent],
  template: `
    <app-page-shell
      eyebrow="Vendor tools"
      eyebrowClass="text-cyan-500"
      title="Edit product"
      description="Update the product details on a dedicated page, then return to the products list when you're done."
    >
      <div page-shell-actions>
        <a routerLink="/vendor/products" class="btn-secondary w-full !py-3 sm:w-auto">
          Back to Products
        </a>
      </div>

      <div page-shell-content class="space-y-8">
        <div *ngIf="isLoading" class="app-section py-20">
          <div class="flex flex-col items-center gap-4">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600"></div>
            <p class="font-medium text-slate-500">Loading product details...</p>
          </div>
        </div>

        <div *ngIf="!isLoading && !product" class="app-section py-16 text-center">
          <h2 class="text-2xl font-black text-slate-900">Product not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
            We couldn't load that product. It may have been deleted or the link may be outdated.
          </p>
          <a routerLink="/vendor/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">
            Return to Products
          </a>
        </div>

        <form *ngIf="!isLoading && product" class="space-y-8" (ngSubmit)="saveProduct()">
          <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <app-vendor-form-section eyebrow="Core Product" title="Edit basics">
              <div class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2 md:col-span-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    [(ngModel)]="form.productName"
                    class="app-input"
                    placeholder="Wireless Headphones Pro"
                  >
                </div>

                <div class="space-y-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    [(ngModel)]="form.brand"
                    class="app-input"
                    placeholder="SoundSphere"
                  >
                </div>

                <div class="space-y-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</label>
                  <select
                    name="category"
                    [(ngModel)]="form.category"
                    class="app-input"
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
                    class="app-input"
                    placeholder="Describe the product, features, materials, and buying value."
                  ></textarea>
                </div>

                <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="form.isActive"
                    name="isActive"
                    class="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
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
                      class="flex h-full items-center justify-center bg-gradient-to-br from-cyan-100 to-slate-50 text-4xl font-black text-slate-400"
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
      </div>
    </app-page-shell>
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
