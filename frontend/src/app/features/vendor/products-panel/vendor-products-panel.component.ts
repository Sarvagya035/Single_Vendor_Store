import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { VendorService } from '../../../core/services/vendor.service';
import {
  VendorCategoryRecord,
  VendorProductEditForm,
  VendorProductRecord,
  VendorProductVariant,
  VendorVariantCreateForm
} from '../../../core/models/vendor.models';
import { VendorProductCardComponent } from '../product-card/vendor-product-card.component';
import { VendorProductQuickActionsComponent } from '../product-quick-actions/vendor-product-quick-actions.component';

interface FlatCategoryOption {
  _id: string;
  name: string;
  level: number;
}

interface ProductMessage {
  type: 'success' | 'error';
  text: string;
}

@Component({
  selector: 'app-vendor-products-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorProductCardComponent, VendorProductQuickActionsComponent],
  template: `
    <section class="space-y-6">
      <div class="glass-card overflow-hidden">
        <div class="border-b border-slate-200 px-6 py-6 lg:px-8">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Product Management
              </h2>
            </div>
            <a routerLink="/vendor/products/add" class="btn-primary !px-6 !py-3">+ Add Product</a>
          </div>
        </div>

        <div class="space-y-5 px-6 py-6 lg:px-8">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by product name, brand, or category"
              class="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100 xl:max-w-md"
            />
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                (click)="selectedCategory = 'all'"
                class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition"
                [ngClass]="
                  selectedCategory === 'all'
                    ? 'border border-amber-300 bg-amber-50 text-slate-900 ring-2 ring-amber-200'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                "
              >
                All
              </button>
              <button
                *ngFor="let category of categories"
                type="button"
                (click)="selectedCategory = category"
                class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition"
                [ngClass]="
                  selectedCategory === category
                    ? 'border border-amber-300 bg-amber-50 text-slate-900 ring-2 ring-amber-200'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                "
              >
                {{ category }}
              </button>
            </div>
          </div>

          <div
            *ngIf="isLoading"
            class="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 py-20 text-center text-slate-500"
          >
            Loading products...
          </div>

          <div
            *ngIf="!isLoading && filteredProducts.length === 0"
            class="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/70 px-8 py-20 text-center"
          >
            <h3 class="text-2xl font-black text-slate-900">No Matching Products</h3>
            <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
              Try another category filter or search term.
            </p>
          </div>

          <div *ngIf="!isLoading && filteredProducts.length > 0" class="space-y-4">
            <app-vendor-product-card
              *ngFor="let product of filteredProducts; trackBy: trackByProductId"
              [product]="product"
              [imageUrl]="primaryImage(product)"
              [createdLabel]="formatDate(product.createdAt)"
              [variantCount]="product.variants?.length || 0"
              [stockLabel]="'' + totalStock(product)"
              [lowStock]="isLowStock(product)"
              [priceLabel]="formatCurrency(product.basePrice)"
              [statusBusy]="isBusy('status-' + product._id)"
              [deleteBusy]="isBusy('delete-product-' + product._id)"
              (open)="toggleExpanded(product)"
              (edit)="openEditPage(product)"
              (toggleStatus)="toggleProductStatus(product)"
              (delete)="deleteProduct(product)"
            >
            </app-vendor-product-card>
          </div>

          <div
            *ngIf="selectedExpandedProduct as product"
            (click)="closeExpanded()"
            class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-6 sm:px-6 sm:py-10 backdrop-blur-[2px]"
          >
            <div
              (click)="$event.stopPropagation()"
              class="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-2xl sm:p-6 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <div class="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Product Details
                  </p>
                  <h3 class="mt-2 text-2xl font-black text-slate-900">
                    {{ product.productName }}
                  </h3>
                  <p class="mt-2 text-sm font-medium text-slate-500">
                    Manage pricing, stock, visibility, and variants without leaving this page.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="closeExpanded()"
                  class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              <div
                *ngIf="messageFor(product._id)"
                class="mb-5 rounded-3xl border px-5 py-4 text-sm font-bold"
                [ngClass]="
                  messageFor(product._id)?.type === 'success'
                    ? 'border-amber-100 bg-amber-50 text-amber-800'
                    : 'border-rose-100 bg-rose-50 text-rose-700'
                "
              >
                {{ messageFor(product._id)?.text }}
              </div>

              <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section class="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Product Details
                      </p>
                      <h3 class="mt-2 text-xl font-black text-slate-900">Edit basics</h3>
                    </div>
                    <button
                      type="button"
                      (click)="openEditPage(product)"
                      class="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </div>

                  <div class="mt-5 space-y-3 text-sm font-medium text-slate-600">
                    <p>
                      <span class="font-black text-slate-900">Name:</span>
                      {{ product.productName }}
                    </p>
                    <p>
                      <span class="font-black text-slate-900">Brand:</span>
                      {{ product.brand || 'Generic' }}
                    </p>
                    <p>
                      <span class="font-black text-slate-900">Category:</span>
                      {{ product.categoryDetails?.name || 'Uncategorized' }}
                    </p>
                    <p>
                      <span class="font-black text-slate-900">Description:</span>
                      {{ product.productDescription || 'No description' }}
                    </p>
                  </div>
                </section>

                <app-vendor-product-quick-actions
                  [product]="product"
                  [statusBusy]="isBusy('status-' + product._id)"
                  [deleteBusy]="isBusy('delete-product-' + product._id)"
                  (toggleStatus)="toggleProductStatus(product)"
                  (delete)="deleteProduct(product)"
                />
              </div>

              <section class="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div class="border-b border-slate-100 pb-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Variant Tools
                  </p>
                  <h3 class="mt-2 text-xl font-black text-slate-900">Add variant</h3>
                </div>
                <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <input
                    [(ngModel)]="variantCreateForms[product._id].attributesText"
                    [name]="'new-attributes-' + product._id"
                    placeholder="Color:Black, Size:XL"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100 md:col-span-2 xl:col-span-2"
                  />
                  <input
                    type="number"
                    [(ngModel)]="variantCreateForms[product._id].productPrice"
                    [name]="'new-price-' + product._id"
                    min="0"
                    placeholder="Price"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                  <input
                    type="number"
                    [(ngModel)]="variantCreateForms[product._id].discountPercentage"
                    [name]="'new-discount-' + product._id"
                    min="0"
                    max="100"
                    placeholder="Discount %"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                  <input
                    type="number"
                    [(ngModel)]="variantCreateForms[product._id].productStock"
                    [name]="'new-stock-' + product._id"
                    min="0"
                    placeholder="Stock"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                  <div class="md:col-span-2 xl:col-span-5">
                    <input
                      type="file"
                      accept="image/*"
                      (change)="onNewVariantImageSelected($event, product._id)"
                      class="block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600"
                    />
                    <p class="mt-2 text-xs font-semibold text-slate-500">
                      {{
                        variantCreateForms[product._id].imageFile?.name ||
                          'Variant image is required for this backend endpoint.'
                      }}
                    </p>
                  </div>
                  <div class="md:col-span-2 xl:col-span-5">
                    <button
                      type="button"
                      (click)="addVariant(product)"
                      [disabled]="isBusy('add-variant-' + product._id)"
                      class="btn-primary !px-6 !py-3"
                    >
                      {{
                        isBusy('add-variant-' + product._id) ? 'Adding Variant...' : 'Add Variant'
                      }}
                    </button>
                  </div>
                </div>
              </section>

              <section class="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div class="border-b border-slate-100 pb-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Existing Variants
                  </p>
                  <h3 class="mt-2 text-xl font-black text-slate-900">Inventory and pricing</h3>
                </div>
                <div class="mt-5 space-y-4" *ngIf="product.variants?.length; else noVariants">
                  <article
                    *ngFor="let variant of product.variants; trackBy: trackByVariantId"
                    class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
                  >
                    <div class="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))]">
                      <div class="space-y-3">
                        <div class="flex items-center gap-4">
                          <div class="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                            <img
                              *ngIf="variant.variantImage"
                              [src]="variant.variantImage"
                              [alt]="variant.sku || 'Variant'"
                              class="h-full w-full object-cover"
                            />
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-sm font-black text-slate-900">
                              {{ variant.sku || 'SKU pending' }}
                            </p>
                            <p
                              class="mt-1 text-xs font-semibold uppercase tracking-[0.16em]"
                              [ngClass]="
                                variant.isAvailable ? 'text-amber-700' : 'text-rose-600'
                              "
                            >
                              {{ variant.isAvailable ? 'In Stock' : 'Out of Stock' }}
                            </p>
                          </div>
                        </div>
                        <p class="text-sm font-medium text-slate-600">
                          {{ attributeSummary(variant) }}
                        </p>
                        <p class="text-sm font-semibold text-slate-700">
                          Base: {{ formatCurrency(variant.productPrice) }} | Final:
                          {{ formatCurrency(variant.finalPrice) }}
                        </p>
                        <p class="text-sm font-semibold text-slate-700">
                          Current stock: {{ variant.productStock || 0 }}
                        </p>
                      </div>

                      <div class="space-y-2">
                        <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Restock Units
                        </label>
                        <input
                          type="number"
                          [(ngModel)]="restockDrafts[variant._id || '']"
                          [name]="'restock-' + (variant._id || '')"
                          min="1"
                          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                        />
                        <button
                          type="button"
                          (click)="restockVariant(product, variant)"
                          [disabled]="!variant._id || isBusy('restock-' + (variant._id || ''))"
                          class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                        >
                          {{ isBusy('restock-' + (variant._id || '')) ? 'Updating...' : 'Restock' }}
                        </button>
                      </div>

                      <div class="space-y-2">
                        <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Discount %
                        </label>
                        <input
                          type="number"
                          [(ngModel)]="discountDrafts[variant._id || '']"
                          [name]="'discount-' + (variant._id || '')"
                          min="0"
                          max="100"
                          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                        />
                        <button
                          type="button"
                          (click)="updateDiscount(product, variant)"
                          [disabled]="!variant._id || isBusy('discount-' + (variant._id || ''))"
                          class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                        >
                          {{
                            isBusy('discount-' + (variant._id || ''))
                              ? 'Saving...'
                              : 'Update Discount'
                          }}
                        </button>
                      </div>

                      <div class="space-y-2">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Removal
                        </p>
                        <button
                          type="button"
                          (click)="deleteVariant(product, variant)"
                          [disabled]="!variant._id || isBusy('delete-variant-' + (variant._id || ''))"
                          class="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
                        >
                          {{
                            isBusy('delete-variant-' + (variant._id || ''))
                              ? 'Deleting...'
                              : 'Delete Variant'
                          }}
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
                <ng-template #noVariants>
                  <div
                    class="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No variants available for this product yet.
                  </div>
                </ng-template>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class VendorProductsPanelComponent implements OnInit, OnChanges {
  @Input() products: VendorProductRecord[] = [];
  @Input() isLoading = false;
  @Output() refreshRequested = new EventEmitter<void>();

  searchQuery = '';
  selectedCategory = 'all';
  expandedProductId: string | null = null;
  selectedExpandedProduct: VendorProductRecord | null = null;
  editingProductId: string | null = null;
  productEditForm: VendorProductEditForm = this.createEditForm();
  categoriesTree: VendorCategoryRecord[] = [];
  categories: string[] = [];
  flatCategories: FlatCategoryOption[] = [];
  variantCreateForms: Record<string, VendorVariantCreateForm> = {};
  restockDrafts: Record<string, number | null> = {};
  discountDrafts: Record<string, number | null> = {};
  productMessages: Record<string, ProductMessage | undefined> = {};
  busyStates: Record<string, boolean> = {};

  constructor(
    private vendorService: VendorService,
    private appRefreshService: AppRefreshService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.updateCategoriesFromProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['products']) {
      this.updateCategoriesFromProducts();
    }
  }

  get filteredProducts(): VendorProductRecord[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.products.filter((product) => {
      const categoryName = product.categoryDetails?.name || 'Uncategorized';
      const matchesCategory =
        this.selectedCategory === 'all' || categoryName === this.selectedCategory;
      const matchesSearch =
        !query ||
        product.productName.toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }

  toggleExpanded(product: VendorProductRecord, preserveEditing = false) {
    this.ensureProductState(product);
    const isClosing = this.expandedProductId === product._id;
    this.expandedProductId = isClosing ? null : product._id;
    this.selectedExpandedProduct = isClosing ? null : product;
    if (!preserveEditing) {
      this.editingProductId = null;
    }
    this.productMessages[product._id] = undefined;
  }

  closeExpanded() {
    this.expandedProductId = null;
    this.selectedExpandedProduct = null;
    this.editingProductId = null;
  }

  openEditPage(product: VendorProductRecord) {
    this.router.navigate(['/vendor/products', product._id, 'edit']);
  }

  startEditing(product: VendorProductRecord) {
    this.productMessages[product._id] = undefined;
    this.editingProductId = product._id;
    this.productEditForm = {
      productName: product.productName || '',
      productDescription: product.productDescription || '',
      brand: product.brand || '',
      category: product.categoryDetails?._id || product.category || '',
      isActive: product.isActive !== false,
    };
  }

  cancelEditing() {
    this.editingProductId = null;
    this.productEditForm = this.createEditForm();
  }

  saveProduct(product: VendorProductRecord) {
    const productName = this.productEditForm.productName.trim();
    const productDescription = this.productEditForm.productDescription.trim();

    if (!productName || !productDescription) {
      this.setMessage(product._id, 'error', 'Product name and description are required.');
      return;
    }

    this.setBusy(`save-${product._id}`, true);
    this.vendorService
      .updateProduct(product._id, {
        productName,
        productDescription,
        brand: this.productEditForm.brand.trim(),
        category: this.productEditForm.category || product.categoryDetails?._id || product.category,
        isActive: this.productEditForm.isActive,
      })
      .subscribe({
        next: (res) => {
          this.setBusy(`save-${product._id}`, false);
          if (!res?.success) {
            this.setMessage(product._id, 'error', res?.message || 'Unable to update product.');
            return;
          }

          this.setMessage(product._id, 'success', 'Product details updated successfully.');
          this.editingProductId = null;
          this.appRefreshService.notify('vendor');
          this.refreshRequested.emit();
        },
        error: (err) => {
          this.setBusy(`save-${product._id}`, false);
          this.setMessage(product._id, 'error', err.error?.message || 'Unable to update product.');
        },
      });
  }

  toggleProductStatus(product: VendorProductRecord) {
    this.setBusy(`status-${product._id}`, true);
    this.vendorService.updateProduct(product._id, { isActive: !product.isActive }).subscribe({
      next: (res) => {
        this.setBusy(`status-${product._id}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to update status.');
          return;
        }

        this.setMessage(
          product._id,
          'success',
          `Product marked as ${product.isActive ? 'inactive' : 'active'}.`,
        );
        this.appRefreshService.notify('vendor');
        this.refreshRequested.emit();
      },
      error: (err) => {
        this.setBusy(`status-${product._id}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to update status.');
      },
    });
  }

  deleteProduct(product: VendorProductRecord) {
    const confirmed = window.confirm(`Delete "${product.productName}" and all of its variants?`);
    if (!confirmed) {
      return;
    }

    this.setBusy(`delete-product-${product._id}`, true);
    this.vendorService.deleteProduct(product._id).subscribe({
      next: (res) => {
        this.setBusy(`delete-product-${product._id}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to delete product.');
          return;
        }

        this.closeExpanded();
        this.appRefreshService.notify('vendor');
        this.refreshRequested.emit();
      },
      error: (err) => {
        this.setBusy(`delete-product-${product._id}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to delete product.');
      },
    });
  }

  onNewVariantImageSelected(event: Event, productId: string) {
    const input = event.target as HTMLInputElement;
    this.ensureVariantCreateForm(productId);
    this.variantCreateForms[productId].imageFile = input.files?.[0] || null;
  }

  addVariant(product: VendorProductRecord) {
    const form = this.variantCreateForms[product._id];
    const attributes = this.parseAttributes(form.attributesText);

    if (Object.keys(attributes).length === 0) {
      this.setMessage(
        product._id,
        'error',
        'Variant attributes are required, for example "Color:Black".',
      );
      return;
    }

    if (form.productPrice === null || form.productStock === null) {
      this.setMessage(product._id, 'error', 'Variant price and stock are required.');
      return;
    }

    if (!form.imageFile) {
      this.setMessage(
        product._id,
        'error',
        'Variant image is required by the backend add-variant endpoint.',
      );
      return;
    }

    const data = new FormData();
    data.append('attributes', JSON.stringify(attributes));
    data.append('productPrice', String(form.productPrice));
    data.append('discountPercentage', String(form.discountPercentage || 0));
    data.append('productStock', String(form.productStock));
    data.append('variantImage', form.imageFile);

    this.setBusy(`add-variant-${product._id}`, true);
    this.vendorService.addVariant(product._id, data).subscribe({
      next: (res) => {
        this.setBusy(`add-variant-${product._id}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to add variant.');
          return;
        }

        this.variantCreateForms[product._id] = this.createVariantForm();
        this.setMessage(product._id, 'success', 'Variant added successfully.');
        this.appRefreshService.notify('vendor');
        this.refreshRequested.emit();
      },
      error: (err) => {
        this.setBusy(`add-variant-${product._id}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to add variant.');
      },
    });
  }

  restockVariant(product: VendorProductRecord, variant: VendorProductVariant) {
    if (!variant._id) {
      return;
    }

    const variantId = variant._id;

    const stockToAdd = Number(this.restockDrafts[variantId] || 0);
    if (!Number.isFinite(stockToAdd) || stockToAdd <= 0) {
      this.setMessage(product._id, 'error', 'Enter a valid restock quantity greater than zero.');
      return;
    }

    this.setBusy(`restock-${variantId}`, true);
    this.vendorService.restockVariant(product._id, variantId, stockToAdd).subscribe({
      next: (res) => {
        this.setBusy(`restock-${variantId}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to restock variant.');
          return;
        }

        this.restockDrafts[variantId] = null;
        this.setMessage(
          product._id,
          'success',
          `Added ${stockToAdd} units to ${variant.sku || 'the variant'}.`,
        );
        this.appRefreshService.notify('vendor');
        this.refreshRequested.emit();
      },
      error: (err) => {
        this.setBusy(`restock-${variantId}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to restock variant.');
      },
    });
  }

  updateDiscount(product: VendorProductRecord, variant: VendorProductVariant) {
    if (!variant._id) {
      return;
    }

    const variantId = variant._id;

    const discount = Number(this.discountDrafts[variantId]);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      this.setMessage(product._id, 'error', 'Discount must be between 0 and 100.');
      return;
    }

    this.setBusy(`discount-${variantId}`, true);
    this.vendorService.updateVariantDiscount(product._id, variantId, discount).subscribe({
      next: (res) => {
        this.setBusy(`discount-${variantId}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to update discount.');
          return;
        }

        this.setMessage(
          product._id,
          'success',
          `Discount updated for ${variant.sku || 'the variant'}.`,
        );
        this.appRefreshService.notify('vendor');
        this.refreshRequested.emit();
      },
      error: (err) => {
        this.setBusy(`discount-${variantId}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to update discount.');
      },
    });
  }

  deleteVariant(product: VendorProductRecord, variant: VendorProductVariant) {
    if (!variant._id) {
      return;
    }

    const variantId = variant._id;

    const confirmed = window.confirm(
      `Delete variant ${variant.sku || 'without SKU'} from "${product.productName}"?`,
    );
    if (!confirmed) {
      return;
    }

    this.setBusy(`delete-variant-${variantId}`, true);
    this.vendorService.deleteVariant(product._id, variantId).subscribe({
      next: (res) => {
        this.setBusy(`delete-variant-${variantId}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to delete variant.');
          return;
        }

        this.setMessage(product._id, 'success', 'Variant deleted successfully.');
        this.appRefreshService.notify('vendor');
        this.refreshRequested.emit();
      },
      error: (err) => {
        this.setBusy(`delete-variant-${variantId}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to delete variant.');
      },
    });
  }

  trackByProductId(_: number, product: VendorProductRecord): string {
    return product._id;
  }

  trackByVariantId(index: number, variant: VendorProductVariant): string {
    return variant._id || variant.sku || String(index);
  }

  trackByFlatCategoryId(_: number, option: FlatCategoryOption): string {
    return option._id;
  }

  primaryImage(product: VendorProductRecord): string | undefined {
    return product.mainImages?.[0];
  }

  totalStock(product: VendorProductRecord): number {
    return (product.variants || []).reduce(
      (total, variant) => total + (variant.productStock || 0),
      0,
    );
  }

  isLowStock(product: VendorProductRecord): boolean {
    const stock = this.totalStock(product);
    return stock > 0 && stock <= 5;
  }

  attributeSummary(variant: VendorProductVariant): string {
    const entries = Object.entries(variant.attributes || {});
    if (!entries.length) {
      return 'No attributes';
    }

    return entries.map(([key, value]) => `${key}: ${value}`).join(' • ');
  }

  optionLabel(option: FlatCategoryOption): string {
    return `${'-- '.repeat(option.level)}${option.name}`;
  }

  messageFor(productId: string): ProductMessage | undefined {
    return this.productMessages[productId];
  }

  isBusy(key: string): boolean {
    return !!this.busyStates[key];
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') {
      return 'N/A';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private loadCategories() {
    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.categoriesTree = res?.data || [];
        this.flatCategories = this.buildFlatCategories(this.categoriesTree);
      },
    });
  }

  private updateCategoriesFromProducts() {
    this.categories = [
      ...new Set(this.products.map((product) => product.categoryDetails?.name || 'Uncategorized')),
    ];
    this.syncProductState(this.products);
  }

  private ensureProductState(product: VendorProductRecord) {
    this.ensureVariantCreateForm(product._id);

    for (const variant of product.variants || []) {
      if (variant._id && this.restockDrafts[variant._id] === undefined) {
        this.restockDrafts[variant._id] = null;
      }

      if (variant._id && this.discountDrafts[variant._id] === undefined) {
        this.discountDrafts[variant._id] = variant.discountPercentage ?? 0;
      }
    }
  }

  private ensureVariantCreateForm(productId: string) {
    if (!this.variantCreateForms[productId]) {
      this.variantCreateForms[productId] = this.createVariantForm();
    }
  }

  private parseAttributes(input: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [key, ...rest] = pair.split(':');
        const value = rest.join(':').trim();
        if (key?.trim() && value) {
          attributes[key.trim()] = value;
        }
      });

    return attributes;
  }

  private setBusy(key: string, isBusy: boolean) {
    this.busyStates[key] = isBusy;
  }

  private setMessage(productId: string, type: 'success' | 'error', text: string) {
    this.productMessages[productId] = { type, text };
  }

  private createEditForm(): VendorProductEditForm {
    return {
      productName: '',
      productDescription: '',
      brand: '',
      category: '',
      isActive: true,
    };
  }

  private createVariantForm(): VendorVariantCreateForm {
    return {
      attributesText: '',
      productPrice: null,
      discountPercentage: 0,
      productStock: null,
      imageFile: null,
    };
  }

  private flattenCategories(nodes: VendorCategoryRecord[], target: FlatCategoryOption[]) {
    for (const node of nodes) {
      target.push({
        _id: node._id,
        name: node.name,
        level: node.level || 0,
      });

      if (node.children?.length) {
        this.flattenCategories(node.children, target);
      }
    }
  }

  private syncProductState(products: VendorProductRecord[]) {
    for (const product of products) {
      this.ensureProductState(product);
    }
  }

  private buildFlatCategories(nodes: VendorCategoryRecord[]): FlatCategoryOption[] {
    const flat: FlatCategoryOption[] = [];
    this.flattenCategories(nodes, flat);
    return flat;
  }
}

