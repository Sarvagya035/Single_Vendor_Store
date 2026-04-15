import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorCategoryRecord, VendorProductRecord } from '../../../core/models/vendor.models';
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
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="space-y-8">
      <div class="vendor-page-hero">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl">
            <p class="app-page-eyebrow">Vendor Products</p>
            <h1 class="app-page-title">Product Management Dashboard</h1>
            <p class="app-page-description">
              Review your catalog, filter product records quickly, and jump into dedicated view, edit, restock, and variant workflows.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a routerLink="/vendor/products/add" class="btn-primary !px-7 !py-3.5">
              Add Product
            </a>
          </div>
        </div>

        <div class="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.7fr))]">
          <label class="block">
            <span class="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search by name, brand, SKU, or category"
              class="block w-full rounded-2xl border border-white/70 bg-white px-5 py-4 text-sm font-medium text-slate-900 shadow-inner outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <label class="block">
            <span class="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</span>
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="applyFilters()"
              class="block w-full rounded-2xl border border-white/70 bg-white px-5 py-4 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            >
              <option value="all">All categories</option>
              <option *ngFor="let category of categoryOptions; trackBy: trackByCategoryOption" [value]="category._id">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</span>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="applyFilters()"
              class="block w-full rounded-2xl border border-white/70 bg-white px-5 py-4 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <article class="vendor-stat-card">
          <p class="vendor-stat-label">Total Products</p>
          <p class="vendor-stat-value">{{ totalDocs }}</p>
          <p class="vendor-stat-copy">Catalog entries under your vendor account.</p>
        </article>
        <article class="vendor-stat-card">
          <p class="vendor-stat-label">Active Listings</p>
          <p class="vendor-stat-value">{{ activeCount }}</p>
          <p class="vendor-stat-copy">Products currently visible to customers.</p>
        </article>
        <article class="vendor-stat-card">
          <p class="vendor-stat-label">Filtered Results</p>
          <p class="vendor-stat-value">{{ filteredProducts.length }}</p>
          <p class="vendor-stat-copy">Products matching the current dashboard filters.</p>
        </article>
      </div>

      <div class="vendor-page-shell">
        <div class="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p class="vendor-stat-label">Control Center</p>
            <h2 class="vendor-panel-title">Products Dashboard</h2>
          </div>
          <p class="text-sm font-semibold text-slate-500">
            Page <span class="font-black text-slate-900">{{ currentPage }}</span>
            of <span class="font-black text-slate-900">{{ totalPages }}</span>
          </p>
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
          <div class="grid grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.5fr)] gap-4 border-b border-slate-200 bg-slate-50/80 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>Product</span>
            <span>Category</span>
            <span>Variants</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <article
            *ngFor="let product of filteredProducts; trackBy: trackByProductId"
            class="grid grid-cols-[minmax(0,2.2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.5fr)] gap-4 border-b border-slate-100 px-8 py-5 last:border-b-0"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div class="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                <img *ngIf="imageFor(product)" [src]="imageFor(product)" [alt]="product.productName" class="h-full w-full object-cover" />
                <div *ngIf="!imageFor(product)" class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-xl font-black text-slate-500">
                  {{ product.productName.charAt(0) || 'P' }}
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-base font-black text-slate-900">{{ product.productName }}</h3>
                <p class="mt-1 truncate text-sm font-semibold text-slate-600">{{ product.brand || 'Generic' }}</p>
                <p class="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Added {{ createdLabel(product.createdAt) }}
                </p>
              </div>
            </div>

            <div class="flex items-center text-sm font-bold text-slate-700">
              {{ product.categoryDetails?.name || 'Uncategorized' }}
            </div>

            <div class="flex items-center text-sm font-black text-slate-900">
              {{ product.variants?.length || 0 }}
            </div>

            <div class="flex items-center text-sm font-black text-slate-900">
              {{ stockFor(product) }}
            </div>

            <div class="flex items-center">
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
                [ngClass]="product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
              >
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a [routerLink]="['/vendor/products', product._id, 'view']" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50">
                View
              </a>
              <a [routerLink]="['/vendor/products', product._id, 'edit']" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50">
                Edit
              </a>
              <a [routerLink]="['/vendor/products', product._id, 'restock']" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-800 transition hover:bg-amber-100">
                Restock
              </a>
              <a [routerLink]="['/vendor/products', product._id, 'variants']" class="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-slate-700">
                Variants
              </a>
              <button
                type="button"
                (click)="deleteProduct(product)"
                [disabled]="busyDeleteId === product._id"
                class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
              >
                {{ busyDeleteId === product._id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </article>
        </div>

        <div *ngIf="!isLoading && filteredProducts.length > 0" class="grid gap-4 p-4 lg:hidden">
          <article
            *ngFor="let product of filteredProducts; trackBy: trackByProductId"
            class="rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-4"
          >
            <div class="flex items-start gap-4">
              <div class="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                <img *ngIf="imageFor(product)" [src]="imageFor(product)" [alt]="product.productName" class="h-full w-full object-cover" />
                <div *ngIf="!imageFor(product)" class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-50 text-xl font-black text-slate-500">
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
                  <p><span class="font-black text-slate-900">Stock:</span> {{ stockFor(product) }}</p>
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
              <a [routerLink]="['/vendor/products', product._id, 'restock']" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-amber-800">
                Restock
              </a>
              <a [routerLink]="['/vendor/products', product._id, 'variants']" class="rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white">
                Variants
              </a>
              <button
                type="button"
                (click)="deleteProduct(product)"
                [disabled]="busyDeleteId === product._id"
                class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-rose-700 disabled:opacity-60"
              >
                {{ busyDeleteId === product._id ? 'Deleting...' : 'Delete' }}
              </button>
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

  onSearchChange(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.searchDebounceHandle = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    this.loadVendorProducts(1);
  }

  loadVendorProducts(page = 1): void {
    this.isLoading = true;
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

  deleteProduct(product: VendorProductRecord): void {
    const confirmed = window.confirm(`Delete "${product.productName}" and all of its variants?`);
    if (!confirmed) {
      return;
    }

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
