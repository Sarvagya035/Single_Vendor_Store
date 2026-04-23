import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorCategoryRecord, VendorProductRecord } from '../../../core/models/vendor.models';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  FlatCategoryOption,
  buildFlatCategories,
  formatVendorDate,
  primaryProductImage,
  totalProductStock,
} from '../product-management/vendor-product-management.utils';

@Component({
  selector: 'app-vendor-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header
            eyebrow="Vendor Products"
            title="Product Management Dashboard"
            titleClass="!text-[1.9rem] sm:!text-[2.2rem]"
          >
            <a routerLink="/vendor/products/add" class="btn-primary !px-7 !py-3.5">
              Add Product
            </a>
          </app-page-header>
        </div>

        <div class="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-3 lg:px-6">
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Total Products</p>
            <p class="vendor-stat-value">{{ totalDocs }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-700">Active Listings</p>
            <p class="vendor-stat-value">{{ activeCount }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label !text-amber-600">Low Stock</p>
            <p class="vendor-stat-value">{{ lowStockCount }}</p>
          </article>
        </div>

        <div class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-3">
              <div>
                <p class="vendor-stat-label">Control Center</p>
                <h2 class="vendor-panel-title">All Products</h2>
              </div>
            </div>

            <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div class="relative w-full xl:max-w-[calc(100%-150px)]">
                <svg
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a5f44]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchChange()"
                  placeholder="Search by name, brand, SKU, or category..."
                  class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-12 py-3.5 text-sm font-medium text-slate-900 shadow-[0_10px_30px_rgba(47,27,20,0.04)] outline-none transition placeholder:text-slate-400 focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <button
                type="button"
                (click)="loadVendorProducts(currentPage)"
                [disabled]="isLoading"
                class="inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#f7f3ef] px-5 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-[#efe7df] disabled:opacity-60"
              >
                <svg class="h-4 w-4 text-[#7c5646]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20 11a8.5 8.5 0 1 0 1.5 4.8" />
                  <path d="M20 4v7h-7" />
                </svg>
                Refresh Products
              </button>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label class="block w-full sm:min-w-[150px]">
                <select
                  [(ngModel)]="selectedCategory"
                  (ngModelChange)="applyFilters()"
                  class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-[0_10px_30px_rgba(47,27,20,0.04)] outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                >
                  <option value="all">All Categories</option>
                  <option *ngFor="let category of categoryOptions; trackBy: trackByCategoryOption" [value]="category._id">
                    {{ category.name }}
                  </option>
                </select>
              </label>

              <label class="block w-full sm:min-w-[130px]">
                <select
                  [(ngModel)]="selectedStatus"
                  (ngModelChange)="applyFilters()"
                  class="block w-full rounded-2xl border border-[#d4a017] bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-[0_10px_30px_rgba(47,27,20,0.04)] outline-none transition focus:border-[#b87912] focus:ring-4 focus:ring-amber-100"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <button
                *ngIf="hasActiveFilters"
                type="button"
                (click)="clearFilters()"
                class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50"
              >
                Reset filters
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                *ngIf="searchQuery.trim()"
                class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
              >
                Search: "{{ searchQuery.trim() }}"
              </span>
              <span
                *ngIf="selectedCategory !== 'all'"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700"
              >
                Category: {{ selectedCategoryLabel }}
              </span>
              <span
                *ngIf="selectedStatus !== 'all'"
                class="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.16em]"
                [ngClass]="selectedStatus === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'"
              >
                Status: {{ selectedStatusLabel }}
              </span>
              <span
                *ngIf="hasActiveFilters"
                class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-rose-700"
              >
                Filters active
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="isLoading" class="px-6 py-20 text-center lg:px-8">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading vendor products...</p>
        </div>

        <div *ngIf="!isLoading && filteredProducts.length === 0" class="px-6 py-20 text-center lg:px-8">
          <h3 class="vendor-empty-title">No products found</h3>
          <p class="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
            Try a different search or filter, or add a new product to start building out your storefront catalog.
          </p>
          <a routerLink="/vendor/products/add" class="btn-primary mt-6 inline-flex !px-6 !py-3">
            Add Product
          </a>
        </div>

        <div *ngIf="!isLoading && filteredProducts.length > 0" class="hidden lg:block">
          <div class="grid grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.5fr)] gap-4 border-b border-slate-200 bg-[#fffaf5] px-6 py-5 text-sm font-semibold text-slate-500">
            <span>Product</span>
            <span>Category</span>
            <span>Variants</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <article
            *ngFor="let product of filteredProducts; trackBy: trackByProductId"
            class="grid grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.5fr)] gap-4 border-b border-slate-200 bg-white px-6 py-5 transition hover:bg-[#fffaf4] last:border-b-0"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div class="h-14 w-14 overflow-hidden rounded-full bg-[#f5ede5]">
                <img *ngIf="imageFor(product)" [src]="imageFor(product)" [alt]="product.productName" class="h-full w-full object-cover" />
                <div *ngIf="!imageFor(product)" class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f2ebe7] to-[#fff7f1] text-xl font-black text-[#7c5646]">
                  {{ product.productName.charAt(0) || 'P' }}
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-base font-black text-slate-900">{{ product.productName }}</h3>
                <p class="mt-1 truncate text-sm font-medium text-[#9c5f39]">{{ product.brand || 'Generic' }}</p>
                <p class="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Added {{ createdLabel(product.createdAt) }}
                </p>
              </div>
            </div>

            <div class="flex items-center text-sm font-medium text-[#9c5f39]">
              {{ product.categoryDetails?.name || 'Uncategorized' }}
            </div>

            <div class="flex items-center text-sm font-black text-slate-900">
              {{ product.variants?.length || 0 }}
            </div>

            <div class="flex items-center text-sm font-black text-slate-900">
              <span class="inline-flex items-center gap-2">
                {{ stockFor(product) }}
                <span
                  *ngIf="isLowStock(product)"
                  class="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800"
                >
                  Low stock
                </span>
              </span>
            </div>

            <div class="flex items-center">
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-black"
                [ngClass]="product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f2ebe7] text-[#8c6c5d]'"
              >
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a [routerLink]="['/vendor/products', product._id, 'view']" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-[#fffaf4]">
                View
              </a>
              <a [routerLink]="['/vendor/products', product._id, 'edit']" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-[#fffaf4]">
                Edit
              </a>
              <div class="relative">
                <button
                  type="button"
                  (click)="toggleActionMenu(product._id)"
                  class="rounded-xl border border-[#7c5646] bg-[#7c5646] px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#6e4b3d]"
                >
                  More
                </button>

                <div
                  *ngIf="openActionMenuId === product._id"
                  class="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <a [routerLink]="['/vendor/products', product._id, 'restock']" (click)="closeActionMenu()" class="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-amber-50">
                    Restock
                  </a>
                  <a [routerLink]="['/vendor/products', product._id, 'variants']" (click)="closeActionMenu()" class="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Variants
                  </a>
                  <button type="button" (click)="openDeleteModal(product)" class="block w-full px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div *ngIf="!isLoading && filteredProducts.length > 0" class="grid gap-4 p-4 lg:hidden">
          <article
            *ngFor="let product of filteredProducts; trackBy: trackByProductId"
            class="rounded-[1.6rem] border border-slate-200 bg-white p-4"
          >
            <div class="flex items-start gap-4">
              <div class="h-14 w-14 overflow-hidden rounded-full bg-[#f5ede5]">
                <img *ngIf="imageFor(product)" [src]="imageFor(product)" [alt]="product.productName" class="h-full w-full object-cover" />
                <div *ngIf="!imageFor(product)" class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f2ebe7] to-[#fff7f1] text-xl font-black text-[#7c5646]">
                  {{ product.productName.charAt(0) || 'P' }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="truncate text-lg font-black text-slate-900">{{ product.productName }}</h3>
                    <p class="mt-1 text-sm font-semibold text-slate-600">{{ product.brand || 'Generic' }}</p>
                  </div>
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                    [ngClass]="product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <div class="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600">
                  <p><span class="font-black text-slate-900">Category:</span> {{ product.categoryDetails?.name || 'Uncategorized' }}</p>
                  <p><span class="font-black text-slate-900">Variants:</span> {{ product.variants?.length || 0 }}</p>
                  <p>
                    <span class="font-black text-slate-900">Stock:</span>
                    {{ stockFor(product) }}
                    <span
                      *ngIf="isLowStock(product)"
                      class="ml-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800"
                    >
                      Low stock
                    </span>
                  </p>
                  <p><span class="font-black text-slate-900">Created:</span> {{ createdLabel(product.createdAt) }}</p>
                </div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <a [routerLink]="['/vendor/products', product._id, 'view']" class="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                View
              </a>
              <a [routerLink]="['/vendor/products', product._id, 'edit']" class="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                Edit
              </a>
              <div class="relative col-span-2 sm:col-span-1">
                <button
                  type="button"
                  (click)="toggleActionMenu(product._id)"
                  class="w-full rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white"
                >
                  More
                </button>

                <div
                  *ngIf="openActionMenuId === product._id"
                  class="absolute right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <a [routerLink]="['/vendor/products', product._id, 'restock']" (click)="closeActionMenu()" class="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-amber-50">
                    Restock
                  </a>
                  <a [routerLink]="['/vendor/products', product._id, 'variants']" (click)="closeActionMenu()" class="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Variants
                  </a>
                  <button type="button" (click)="openDeleteModal(product)" class="block w-full px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div
          *ngIf="!isLoading && totalPages > 1"
          class="flex flex-col gap-4 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8"
        >
          <p class="text-sm font-semibold text-slate-500">
            Showing <span class="font-black text-slate-900">{{ products.length }}</span> of
            <span class="font-black text-slate-900">{{ totalDocs }}</span> products
          </p>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              (click)="loadVendorProducts(currentPage - 1)"
              [disabled]="!hasPrevPage || isLoading"
              class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              *ngFor="let page of visiblePages; trackBy: trackByNumber"
              type="button"
              (click)="loadVendorProducts(page)"
              [disabled]="isLoading"
              class="rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] disabled:opacity-50"
              [ngClass]="page === currentPage ? 'bg-amber-700 text-white' : 'border border-slate-200 bg-white text-slate-700'"
            >
              {{ page }}
            </button>

            <button
              type="button"
              (click)="loadVendorProducts(currentPage + 1)"
              [disabled]="!hasNextPage || isLoading"
              class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div
        *ngIf="pendingDeleteProduct"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-6 backdrop-blur-sm"
        (click)="closeDeleteModal()"
      >
        <div
          class="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <p class="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500">Delete product</p>
          <h3 class="mt-2 text-2xl font-black text-slate-900">Remove "{{ pendingDeleteProduct.productName }}"?</h3>
          <p class="mt-3 text-sm font-medium leading-relaxed text-slate-600">
            This will permanently delete the product and all of its variants. The product will no longer appear in your catalog or storefront.
          </p>

          <div class="mt-5 rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Please confirm only if you are sure. This action cannot be undone.
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              (click)="closeDeleteModal()"
              [disabled]="busyDeleteId === pendingDeleteProduct._id"
              class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmDeleteProduct()"
              [disabled]="busyDeleteId === pendingDeleteProduct._id"
              class="rounded-2xl border border-rose-200 bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {{ busyDeleteId === pendingDeleteProduct._id ? 'Deleting...' : 'Delete Product' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class VendorProductsPageComponent implements OnInit {
  products: VendorProductRecord[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalDocs = 0;
  hasPrevPage = false;
  hasNextPage = false;
  limit = 10;
  visiblePages: number[] = [];
  busyDeleteId = '';
  openActionMenuId: string | null = null;
  pendingDeleteProduct: VendorProductRecord | null = null;
  categoriesTree: VendorCategoryRecord[] = [];
  categoryOptions: FlatCategoryOption[] = [];
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;

  searchQuery = '';
  selectedCategory = 'all';
  selectedStatus = 'all';

  constructor(
    private vendorService: VendorService,
    private appRefreshService: AppRefreshService,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadVendorProducts(1);
    this.appRefreshService.refresh$.subscribe((scope) => {
      if (scope === 'vendor') {
        this.loadVendorProducts(this.currentPage);
      }
    });
  }

  get filteredProducts(): VendorProductRecord[] {
    return this.products;
  }

  get activeCount(): number {
    return this.products.filter((product) => product.isActive !== false).length;
  }

  get lowStockCount(): number {
    return this.products.filter((product) => this.isLowStock(product)).length;
  }

  get hasActiveFilters(): boolean {
    return Boolean(this.searchQuery.trim()) || this.selectedCategory !== 'all' || this.selectedStatus !== 'all';
  }

  get selectedCategoryLabel(): string {
    return this.categoryOptions.find((option) => option._id === this.selectedCategory)?.name || 'All categories';
  }

  get selectedStatusLabel(): string {
    if (this.selectedStatus === 'active') {
      return 'Active';
    }

    if (this.selectedStatus === 'inactive') {
      return 'Inactive';
    }

    return 'All statuses';
  }

  onSearchChange(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.searchDebounceHandle = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    this.closeActionMenu();
    this.loadVendorProducts(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.closeActionMenu();
    this.loadVendorProducts(1);
  }

  loadVendorProducts(page = 1): void {
    this.isLoading = true;
    this.closeActionMenu();
    const normalizedPage = Math.max(1, page);

    this.vendorService.getMyProducts(normalizedPage, this.limit, {
      q: this.searchQuery,
      category: this.selectedCategory,
      status: this.selectedStatus as 'all' | 'active' | 'inactive',
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.products = res?.data?.docs || [];
        this.currentPage = Number(res?.data?.page || normalizedPage);
        this.totalPages = Number(res?.data?.totalPages || 1);
        this.totalDocs = Number(res?.data?.totalDocs || this.products.length);
        this.hasPrevPage = Boolean(res?.data?.hasPrevPage);
        this.hasNextPage = Boolean(res?.data?.hasNextPage);
        this.visiblePages = this.buildVisiblePages(this.currentPage, this.totalPages);
      },
      error: () => {
        this.isLoading = false;
        this.products = [];
        this.totalDocs = 0;
        this.currentPage = 1;
        this.totalPages = 1;
        this.hasPrevPage = false;
        this.hasNextPage = false;
        this.visiblePages = [1];
        this.errorService.showToast('Unable to load products.', 'error');
      },
    });
  }

  openDeleteModal(product: VendorProductRecord): void {
    this.closeActionMenu();
    this.pendingDeleteProduct = product;
  }

  closeDeleteModal(): void {
    if (this.busyDeleteId) {
      return;
    }

    this.pendingDeleteProduct = null;
  }

  confirmDeleteProduct(): void {
    if (!this.pendingDeleteProduct) {
      return;
    }

    const product = this.pendingDeleteProduct;
    this.busyDeleteId = product._id;
    this.vendorService.deleteProduct(product._id).subscribe({
      next: (res) => {
        this.busyDeleteId = '';
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Unable to delete product.', 'error');
          return;
        }

        this.errorService.showToast('Product deleted successfully.', 'success');
        this.appRefreshService.notify('vendor');
        this.closeActionMenu();
        this.pendingDeleteProduct = null;
        this.loadVendorProducts(this.currentPage);
      },
      error: (err) => {
        this.busyDeleteId = '';
        this.errorService.showToast(err?.error?.message || 'Unable to delete product.', 'error');
      },
    });
  }

  imageFor(product: VendorProductRecord): string | undefined {
    return primaryProductImage(product);
  }

  stockFor(product: VendorProductRecord): number {
    return totalProductStock(product);
  }

  createdLabel(value?: string): string {
    return formatVendorDate(value);
  }

  trackByProductId(_: number, product: VendorProductRecord): string {
    return product._id;
  }

  trackByValue(_: number, value: string): string {
    return value;
  }

  trackByCategoryOption(_: number, option: FlatCategoryOption): string {
    return option._id;
  }

  trackByNumber(_: number, value: number): number {
    return value;
  }

  toggleActionMenu(productId: string): void {
    this.openActionMenuId = this.openActionMenuId === productId ? null : productId;
  }

  closeActionMenu(): void {
    this.openActionMenuId = null;
  }

  isLowStock(product: VendorProductRecord): boolean {
    const stock = this.stockFor(product);
    return stock > 0 && stock <= 5;
  }

  private loadCategories(): void {
    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.categoriesTree = res?.data || [];
        this.categoryOptions = buildFlatCategories(this.categoriesTree);
      },
      error: () => {
        this.categoryOptions = [];
      },
    });
  }

  private buildVisiblePages(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 1) {
      return [1];
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    pages.add(currentPage);
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((left, right) => left - right);
  }
}
