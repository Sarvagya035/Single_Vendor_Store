import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { CardComponent as AppCardComponent } from '../../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  VendorCategoryRecord,
  VendorProductEditForm,
  VendorProductRecord,
} from '../../../core/models/vendor.models';
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
  imports: [CommonModule, FormsModule, RouterModule, AppCardComponent, PageHeaderComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header
            eyebrow="Vendor Products"
            title="Edit Product Details"
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
            description="This page is only for customer-facing product information. Inventory and variant operations live in their own dedicated workspaces."
          >
            <a
              routerLink="/vendor/products"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Back to Products
            </a>
            <a
              *ngIf="product"
              [routerLink]="['/vendor/products', product._id, 'restock']"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Go to Restock
            </a>
            <a
              *ngIf="product"
              [routerLink]="['/vendor/products', product._id, 'variants']"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              Manage Variants
            </a>
          </app-page-header>
        </div>

        <div *ngIf="isLoading" class="vendor-section-body text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading product details...</p>
        </div>

        <div *ngIf="!isLoading && !product" class="vendor-section-body text-center">
          <h2 class="vendor-empty-title">Product not found</h2>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
            We couldn't load that product. It may have been deleted or the link may be outdated.
          </p>
          <a
            routerLink="/vendor/products"
            class="mt-6 inline-flex items-center justify-center rounded-full bg-[#8B5E3C] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#754c30]"
          >
            Return to Products
          </a>
        </div>

        <form *ngIf="!isLoading && product" class="space-y-6 vendor-section-body" (ngSubmit)="saveProduct()">
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <app-card cardClass="p-5 sm:p-6 lg:p-7">
              <div class="border-b border-slate-100 pb-4">
                <p class="vendor-stat-label">Customer Facing</p>
                <h2 class="vendor-panel-title">Editable product details</h2>
              </div>

              <div class="mt-6 grid gap-5 md:grid-cols-2">
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

                <div class="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-[#fffaf5] p-4">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <p class="vendor-stat-label">Product Images</p>
                      <h3 class="vendor-panel-title !text-lg">Main image manager</h3>
                    </div>
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      {{ totalMainImagesCount }}/5 images
                    </p>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-3">
                    <label
                      class="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      [class.opacity-60]="remainingImageSlots === 0"
                    >
                      Add images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        [disabled]="remainingImageSlots === 0 || imageUpdateLoading"
                        (change)="onNewMainImagesSelected($event)"
                      />
                    </label>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      [disabled]="!canSaveImages || imageUpdateLoading"
                      (click)="saveProductImages()"
                    >
                      {{ imageUpdateLoading ? 'Saving...' : 'Save Images' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      [disabled]="!hasImageDraftChanges || imageUpdateLoading"
                      (click)="resetImageDraft()"
                    >
                      Reset
                    </button>
                  </div>

                  <div class="mt-4 space-y-3">
                    <div class="space-y-2">
                      <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Current images</p>
                      <div class="flex gap-3 overflow-x-auto pb-1">
                        <article *ngFor="let image of retainedMainImages; let i = index; trackBy: trackByImageUrl" class="w-20 shrink-0 overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white shadow-sm sm:w-24">
                          <div class="relative aspect-square bg-slate-50">
                            <img [src]="image" [alt]="product.productName + ' image ' + (i + 1)" class="h-full w-full object-cover" />
                            <button
                              type="button"
                              class="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[10px] font-black text-rose-600 shadow-sm"
                              (click)="removeRetainedMainImage(image)"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                          <div class="px-2 py-1.5">
                            <p class="truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">#{{ i + 1 }}</p>
                          </div>
                        </article>
                        <div *ngIf="retainedMainImages.length === 0" class="flex h-20 min-w-28 items-center justify-center rounded-[1.1rem] border border-dashed border-amber-200 bg-amber-50/60 px-3 text-center text-[11px] font-semibold leading-5 text-amber-800 sm:h-24">
                          No retained images
                        </div>
                      </div>
                    </div>

                    <div *ngIf="newMainImagePreviews.length > 0" class="space-y-2">
                      <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">New uploads</p>
                      <div class="flex gap-3 overflow-x-auto pb-1">
                        <article *ngFor="let preview of newMainImagePreviews; let i = index; trackBy: trackByPreviewUrl" class="w-20 shrink-0 overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white shadow-sm sm:w-24">
                          <div class="relative aspect-square bg-slate-50">
                            <img [src]="preview" [alt]="'New image ' + (i + 1)" class="h-full w-full object-cover" />
                            <button
                              type="button"
                              class="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[10px] font-black text-rose-600 shadow-sm"
                              (click)="removeNewMainImage(i)"
                              aria-label="Remove new image"
                            >
                              ×
                            </button>
                          </div>
                          <div class="px-2 py-1.5">
                            <p class="truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">New {{ i + 1 }}</p>
                          </div>
                        </article>
                      </div>
                    </div>
                  </div>

                  <p class="mt-3 text-xs font-medium leading-6 text-slate-500">
                    {{ remainingImageSlots === 0 ? 'Image limit reached. Remove one to add another.' : 'Keep existing images, remove any you do not want, and add up to ' + remainingImageSlots + ' more.' }}
                  </p>
                </div>

                <label class="space-y-2 md:col-span-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</span>
                  <textarea rows="7" name="productDescription" [(ngModel)]="form.productDescription" class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"></textarea>
                </label>

                <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:col-span-2">
                  <input type="checkbox" [(ngModel)]="form.isActive" name="isActive" class="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500" />
                  <span class="text-sm font-bold text-slate-700">Product is active and visible to customers.</span>
                </label>

                <div class="flex flex-col gap-3 sm:flex-row md:col-span-2">
                  <button
                    type="submit"
                    class="inline-flex items-center justify-center rounded-full bg-[#8B5E3C] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#754c30] disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="isSubmitting"
                  >
                    {{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                    (click)="cancel()"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </app-card>

            <aside class="space-y-6">
              <app-card cardClass="p-5 sm:p-6 lg:p-7">
                <div class="border-b border-slate-100 pb-4">
                  <p class="vendor-stat-label">Preview</p>
                  <h2 class="vendor-panel-title">Product summary</h2>
                </div>

                <div class="mt-6 space-y-5">
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
              </app-card>
            </aside>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class VendorEditProductPageComponent implements OnInit, OnDestroy {
  productId = '';
  product: VendorProductRecord | null = null;
  isLoading = true;
  isSubmitting = false;
  imageUpdateLoading = false;
  imageUpdateMessage = '';
  imageUpdateError = '';
  categoriesTree: VendorCategoryRecord[] = [];
  flatCategories: FlatCategoryOption[] = [];
  totalStock = 0;
  retainedMainImages: string[] = [];
  newMainImageFiles: File[] = [];
  newMainImagePreviews: string[] = [];

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
    return this.retainedMainImages[0] || this.newMainImagePreviews[0] || primaryProductImage(this.product);
  }

  get categoryPreview(): string {
    return this.flatCategories.find((item) => item._id === this.form.category)?.name || this.product?.categoryDetails?.name || 'Uncategorized';
  }

  optionLabel(option: FlatCategoryOption): string {
    return categoryOptionLabel(option);
  }

  get totalMainImagesCount(): number {
    return this.retainedMainImages.length + this.newMainImageFiles.length;
  }

  get remainingImageSlots(): number {
    return Math.max(0, 5 - this.totalMainImagesCount);
  }

  get hasImageDraftChanges(): boolean {
    const originalImages = this.product?.mainImages || [];
    if (this.newMainImageFiles.length > 0) {
      return true;
    }
    if (originalImages.length !== this.retainedMainImages.length) {
      return true;
    }
    return originalImages.some((image, index) => this.retainedMainImages[index] !== image);
  }

  get canSaveImages(): boolean {
    return this.totalMainImagesCount > 0 && this.totalMainImagesCount <= 5 && this.hasImageDraftChanges;
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

  saveProductImages(): void {
    if (!this.product || !this.canSaveImages) {
      if (this.totalMainImagesCount === 0) {
        this.imageUpdateError = 'At least one main image is required.';
      }
      return;
    }

    this.imageUpdateLoading = true;
    this.imageUpdateError = '';
    this.imageUpdateMessage = '';

    this.vendorService.updateProductImages(this.product._id, this.retainedMainImages, this.newMainImageFiles).subscribe({
      next: (res) => {
        this.imageUpdateLoading = false;
        if (!res?.success) {
          this.imageUpdateError = res?.message || 'Unable to update product images.';
          return;
        }

        const updatedProduct = res?.data || this.product;
        this.product = updatedProduct;
        this.totalStock = totalProductStock(this.product);
        this.retainedMainImages = Array.isArray(updatedProduct?.mainImages) ? [...updatedProduct.mainImages] : [...this.retainedMainImages];
        this.clearNewImageDrafts();
        this.imageUpdateMessage = 'Product images updated successfully.';
        this.errorService.showToast('Product images updated successfully.', 'success');
      },
      error: (err) => {
        this.imageUpdateLoading = false;
        this.imageUpdateError = err?.error?.message || 'Unable to update product images.';
      },
    });
  }

  trackByCategory(_: number, option: FlatCategoryOption): string {
    return option._id;
  }

  trackByImageUrl(_: number, imageUrl: string): string {
    return imageUrl;
  }

  trackByPreviewUrl(_: number, previewUrl: string): string {
    return previewUrl;
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
        this.retainedMainImages = [...(this.product.mainImages || [])];
        this.clearNewImageDrafts();
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

  onNewMainImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files || []);

    if (!selectedFiles.length) {
      return;
    }

    const availableSlots = this.remainingImageSlots;
    if (availableSlots <= 0) {
      this.errorService.showToast('You can keep at most 5 main images.', 'error');
      input.value = '';
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, availableSlots);
    if (acceptedFiles.length < selectedFiles.length) {
      this.errorService.showToast('Only the first available images were added to stay within the 5 image limit.', 'error');
    }

    this.newMainImageFiles = [...this.newMainImageFiles, ...acceptedFiles];
    this.newMainImagePreviews = [...this.newMainImagePreviews, ...acceptedFiles.map((file) => URL.createObjectURL(file))];
    this.imageUpdateError = '';
    this.imageUpdateMessage = '';
    input.value = '';
  }

  removeRetainedMainImage(imageUrl: string): void {
    this.retainedMainImages = this.retainedMainImages.filter((image) => image !== imageUrl);
    this.imageUpdateError = '';
    this.imageUpdateMessage = '';
  }

  removeNewMainImage(index: number): void {
    const preview = this.newMainImagePreviews[index];
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    this.newMainImageFiles = this.newMainImageFiles.filter((_, i) => i !== index);
    this.newMainImagePreviews = this.newMainImagePreviews.filter((_, i) => i !== index);
    this.imageUpdateError = '';
    this.imageUpdateMessage = '';
  }

  resetImageDraft(): void {
    this.retainedMainImages = [...(this.product?.mainImages || [])];
    this.clearNewImageDrafts();
    this.imageUpdateError = '';
    this.imageUpdateMessage = '';
  }

  private clearNewImageDrafts(): void {
    this.newMainImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    this.newMainImageFiles = [];
    this.newMainImagePreviews = [];
  }

  ngOnDestroy(): void {
    this.clearNewImageDrafts();
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
