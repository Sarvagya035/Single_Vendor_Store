import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogQueryParams, CatalogService } from '../../core/services/catalog.service';
import { ErrorService } from '../../core/services/error.service';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../../core/models/customer.models';
import { WishlistService } from '../../core/services/wishlist.service';

interface LandingCategoryNode extends CustomerLandingCategory {
  children: LandingCategoryNode[];
}

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="relative min-h-[calc(100vh-72px)] w-full overflow-hidden bg-slate-50">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 left-8 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl"></div>
        <div class="absolute top-32 right-0 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl"></div>
      </div>

      <section class="relative h-full w-full px-3 py-3 sm:px-4 lg:px-6 lg:py-6">
        <div class="h-full min-h-[calc(100vh-88px)] rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">

          <div class="grid min-h-[calc(100vh-150px)] w-full min-w-0 gap-0 lg:grid-cols-[320px_1fr]">
            <aside class="hidden border-b border-slate-200 bg-slate-50/80 px-4 py-5 lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:bg-slate-50/90">
              <div class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Filters</p>
                    <h3 class="mt-1 text-base font-black text-slate-900">Refine results</h3>
                  </div>
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:bg-white"
                    (click)="resetFilters()"
                  >
                    Reset
                  </button>
                </div>

                <div class="mt-4 space-y-4">
                  <label class="block">
                    <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</span>
                    <select
                      [(ngModel)]="selectedCategorySlug"
                      name="selectedCategorySlug"
                      (ngModelChange)="onCatalogFilterChange()"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      <option value="all">All categories</option>
                      <option *ngFor="let category of sidebarCategories; trackBy: trackByCategoryId" [value]="category.slug || category.name">
                        {{ categoryLabel(category) }}
                      </option>
                    </select>
                  </label>

                  <p class="text-[11px] font-semibold leading-5 text-slate-500">
                    Parent categories include all of their child category products.
                  </p>

                  <label class="block">
                    <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</span>
                    <select
                      [(ngModel)]="selectedBrand"
                      name="selectedBrand"
                      (ngModelChange)="onCatalogFilterChange()"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      <option value="all">All brands</option>
                      <option *ngFor="let brand of brandOptions(); trackBy: trackByValue" [value]="brand">
                        {{ brand }}
                      </option>
                    </select>
                  </label>

                  <label class="block">
                    <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sort by</span>
                    <select
                      [(ngModel)]="sortBy"
                      name="sidebarSortBy"
                      (ngModelChange)="onCatalogFilterChange()"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      <option *ngFor="let option of sortOptions; trackBy: trackBySortOption" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label class="block">
                      <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Min price</span>
                      <input
                      [(ngModel)]="minPrice"
                      name="minPrice"
                      (ngModelChange)="onCatalogFilterChange()"
                      type="number"
                        min="0"
                        placeholder="0"
                        class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                      />
                    </label>

                    <label class="block">
                      <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Max price</span>
                      <input
                      [(ngModel)]="maxPrice"
                      name="maxPrice"
                      (ngModelChange)="onCatalogFilterChange()"
                      type="number"
                        min="0"
                        placeholder="Any"
                        class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                      />
                    </label>
                  </div>

                  <label class="block">
                    <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Availability</span>
                    <select
                      [(ngModel)]="availabilityFilter"
                      name="availabilityFilter"
                      (ngModelChange)="onCatalogFilterChange()"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      <option *ngFor="let option of availabilityOptions; trackBy: trackByFilterOption" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <label class="block">
                    <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Minimum rating</span>
                    <select
                      [(ngModel)]="ratingFilter"
                      name="ratingFilter"
                      (ngModelChange)="onCatalogFilterChange()"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      <option *ngFor="let option of ratingOptions; trackBy: trackByFilterOption" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </div>
            </aside>

            <main class="w-full min-w-0 bg-white px-4 py-5 sm:px-6 lg:px-6">
              <div class="mb-5 border-b border-slate-200 pb-5">
                <div>
                  <p class="text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">Dry fruit catalog</p>
                  <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Shop all products</h1>
                  <p class="mt-2 text-sm font-medium text-slate-500">
                    {{ pageSubtitle() }}
                  </p>
                  <p *ngIf="selectedCategoryDescription()" class="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-600">
                    {{ selectedCategoryDescription() }}
                  </p>
                </div>

                <form class="relative mt-4 w-full" (ngSubmit)="searchProducts()">
                  <div class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition focus-within:border-amber-500 focus-within:bg-white">
                    <span class="text-slate-400">
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"></circle>
                        <path d="m20 20-3.5-3.5"></path>
                      </svg>
                    </span>
                    <input
                      name="searchQuery"
                      [(ngModel)]="searchQuery"
                      (ngModelChange)="onSearchQueryChange($event)"
                      type="text"
                      placeholder="Search dry fruits, nuts and healthy packs"
                      class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </form>

                <div class="mt-4 grid gap-3 lg:hidden">
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
                    <button
                      type="button"
                      class="btn-primary justify-between !px-4 !py-3 text-sm"
                      (click)="openFilters()"
                    >
                      <span>Filters</span>
                      <span class="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black tracking-[0.14em]">
                        {{ activeFilterCount() }}
                      </span>
                    </button>

                    <label class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                      <span class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Sort</span>
                      <select
                        [(ngModel)]="sortBy"
                        name="mobileSortBy"
                        (ngModelChange)="onCatalogFilterChange()"
                        class="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      >
                        <option *ngFor="let option of sortOptions; trackBy: trackBySortOption" [value]="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </label>
                  </div>

                  <button
                    *ngIf="hasActiveFilters()"
                    type="button"
                    class="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-left text-xs font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                    (click)="resetFilters()"
                  >
                    Clear active filters
                  </button>
                </div>
              </div>

              <div class="mb-5 flex flex-wrap items-center gap-3 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <label class="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:flex">
                  <span class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Sort</span>
                  <select
                    [(ngModel)]="sortBy"
                    name="sortBy"
                    (ngModelChange)="onCatalogFilterChange()"
                    class="border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  >
                    <option *ngFor="let option of sortOptions; trackBy: trackBySortOption" [value]="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <div class="flex flex-wrap items-center gap-2">
                  <span
                    *ngIf="selectedBrand !== 'all'"
                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
                  >
                    Brand: {{ selectedBrand }}
                  </span>
                  <span
                    *ngIf="minPrice || maxPrice"
                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
                  >
                    Price:
                    {{ minPrice || '0' }} - {{ maxPrice || 'Any' }}
                  </span>
                  <span
                    *ngIf="availabilityFilter !== 'all'"
                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
                  >
                    {{ availabilityFilter === 'in-stock' ? 'In stock only' : 'Out of stock only' }}
                  </span>
                  <span
                    *ngIf="ratingFilter !== 'all'"
                    class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
                  >
                    {{ ratingFilter }}+ rating
                  </span>
                </div>
              </div>

              <div
                *ngIf="catalogMessage"
                class="mb-4 rounded-[1.1rem] border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-slate-900"
              >
                {{ catalogMessage }}
              </div>

              <div *ngIf="loadingProducts" class="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 sm:gap-4 lg:gap-5">
                <div *ngFor="let _ of skeletonCards" class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div class="aspect-square rounded-[1.2rem] bg-slate-200"></div>
                  <div class="mt-4 h-4 w-3/4 rounded-full bg-slate-200"></div>
                  <div class="mt-3 h-4 w-1/2 rounded-full bg-slate-200"></div>
                  <div class="mt-3 h-10 rounded-[1rem] bg-slate-200"></div>
                </div>
              </div>

              <ng-container *ngIf="!loadingProducts">
                <div *ngIf="products.length === 0" class="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                  <h2 class="text-2xl font-black text-slate-900">No products found</h2>
                  <p class="mt-3 text-sm font-medium text-slate-500">
                    Try another dry fruit type, adjust filters, or search for a different pack.
                  </p>
                  <button
                    type="button"
                    class="mt-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    (click)="resetFilters()"
                  >
                    Reset filters
                  </button>
                </div>

                <div *ngIf="products.length > 0" class="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 sm:gap-4 lg:gap-5">
                  <article
                    *ngFor="let product of paginatedProducts(); trackBy: trackByProductId"
                    role="link"
                    tabindex="0"
                    (click)="openProduct(product)"
                    (keydown.enter)="openProduct(product)"
                    (keydown.space)="$event.preventDefault(); openProduct(product)"
                    class="product-card group relative transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                  >
                    <button
                      type="button"
                      class="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-amber-300 hover:bg-white hover:text-rose-600 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
                      [disabled]="wishlistBusyId === product._id"
                      [attr.aria-label]="isWishlisted(product) ? 'Remove from wishlist' : 'Save to wishlist'"
                      (click)="$event.stopPropagation(); toggleWishlist(product)"
                      [ngClass]="isWishlisted(product) ? 'border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_14px_28px_rgba(244,63,94,0.24)] ring-rose-100' : ''"
                    >
                      <svg *ngIf="wishlistBusyId !== product._id && !isWishlisted(product)" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
                      </svg>
                      <svg *ngIf="wishlistBusyId !== product._id && isWishlisted(product)" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                        <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
                      </svg>
                      <span *ngIf="wishlistBusyId === product._id" class="text-[10px] font-black uppercase tracking-[0.18em]">...</span>
                    </button>

                    <div class="overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-100">
                      <img
                        [src]="productImage(product)"
                        [alt]="product.productName"
                        loading="lazy"
                        decoding="async"
                        class="product-card-image transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div class="space-y-2 pt-2">
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
                            {{ product.brand || 'Dry fruit pack' }}
                          </p>
                          <h2 class="product-card-title">
                            {{ product.productName }}
                          </h2>
                        </div>
                        <span class="shrink-0 self-start rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-slate-900 shadow-sm ring-1 ring-amber-200 sm:px-2.5 sm:py-1 sm:text-[10px] lg:px-3 lg:text-xs">
                          {{ formatCurrency(product.displayVariant?.finalPrice || product.basePrice || 0) }}
                        </span>
                      </div>

                      <p class="product-card-meta">
                        {{ product.categoryDetails?.name || 'General Category' }}
                      </p>

                      <div class="flex flex-wrap items-center gap-1 text-xs">
                        <span *ngIf="productOriginalPrice(product)" class="whitespace-nowrap text-[10px] font-bold text-slate-400 line-through sm:text-xs">
                          {{ productOriginalPrice(product) }}
                        </span>
                        <span class="whitespace-nowrap text-[10px] font-black text-slate-900 sm:text-xs lg:text-base">
                          {{ productDiscountedPrice(product) }}
                        </span>
                      </div>

                      <div class="product-card-footer pt-1 text-[10px] font-black sm:text-xs lg:text-sm">
                        <span class="min-w-0 truncate text-slate-500">
                          {{ (product.variants || []).length }} variant{{ (product.variants || []).length === 1 ? '' : 's' }}
                        </span>
                        <div class="flex w-full justify-end sm:w-auto sm:flex-1">
                          <a
                            [routerLink]="['/products', product._id]"
                            (click)="$event.stopPropagation()"
                            class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-amber-300 bg-[#fff8e6] px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#8a4f20] transition hover:bg-[#fff0c2] sm:min-w-[120px] sm:w-auto sm:px-4 sm:py-2 sm:text-center sm:text-xs sm:tracking-[0.12em]"
                          >
                            View Product
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>

              <div *ngIf="catalogTotalItems > pageSize" class="pagination-wrap mt-6">
                <p class="text-sm font-semibold text-slate-500">
                  Showing {{ paginationStartIndex() }}-{{ paginationEndIndex() }} of {{ totalProductCount() }} products
                </p>

                  <div class="pagination-nav mt-4">
                    <button
                      type="button"
                      class="pagination-button pagination-button-mobile"
                      [disabled]="currentPage === 1"
                      (click)="changePage(currentPage - 1)"
                    >
                      Prev
                    </button>

                    <button
                      type="button"
                      class="pagination-button pagination-button-mobile"
                      [disabled]="currentPage === totalPages"
                      (click)="changePage(currentPage + 1)"
                    >
                      Next
                    </button>
                  </div>

                  <div class="pagination-pages">
                      <button
                        *ngFor="let page of visiblePages(); trackBy: trackByPage"
                        type="button"
                        class="pagination-button pagination-button-page"
                        [class.pagination-button-active]="page === currentPage"
                        [class.bg-white]="page !== currentPage"
                        [class.text-slate-600]="page !== currentPage"
                        [class.border-slate-200]="page !== currentPage"
                        (click)="changePage(page)"
                      >
                        {{ page }}
                      </button>
                  </div>
                </div>
              </ng-container>
            </main>
          </div>
        </div>
      </section>

      <div *ngIf="isMobileFiltersOpen" class="fixed inset-0 z-[100] lg:hidden" aria-modal="true" role="dialog">
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          aria-label="Close filters"
          (click)="closeFilters()"
        ></button>

        <aside class="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl">
          <div class="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-slate-200 bg-white pb-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Filters</p>
              <h2 class="text-lg font-black text-slate-900">Refine results</h2>
            </div>

            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              (click)="closeFilters()"
            >
              Close
            </button>
          </div>

          <div class="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
            <div class="space-y-4">
              <label class="block">
                <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</span>
                <select
                  [(ngModel)]="selectedCategorySlug"
                  name="mobileSelectedCategorySlug"
                  (ngModelChange)="onCatalogFilterChange()"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
                  <option value="all">All categories</option>
                  <option *ngFor="let category of sidebarCategories; trackBy: trackByCategoryId" [value]="category.slug || category.name">
                    {{ categoryLabel(category) }}
                  </option>
                </select>
              </label>

              <p class="text-[11px] font-semibold leading-5 text-slate-500">
                Parent categories include all of their child category products.
              </p>

              <label class="block">
                <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</span>
                <select
                  [(ngModel)]="selectedBrand"
                  name="mobileSelectedBrand"
                  (ngModelChange)="onCatalogFilterChange()"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
                  <option value="all">All brands</option>
                  <option *ngFor="let brand of brandOptions(); trackBy: trackByValue" [value]="brand">
                    {{ brand }}
                  </option>
                </select>
              </label>

              <label class="block">
                <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sort by</span>
                <select
                  [(ngModel)]="sortBy"
                  name="mobileSidebarSortBy"
                  (ngModelChange)="onCatalogFilterChange()"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
                  <option *ngFor="let option of sortOptions; trackBy: trackBySortOption" [value]="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label class="block">
                  <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Min price</span>
                  <input
                    [(ngModel)]="minPrice"
                    name="mobileMinPrice"
                    (ngModelChange)="onCatalogFilterChange()"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                </label>

                <label class="block">
                  <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Max price</span>
                  <input
                    [(ngModel)]="maxPrice"
                    name="mobileMaxPrice"
                    (ngModelChange)="onCatalogFilterChange()"
                    type="number"
                    min="0"
                    placeholder="Any"
                    class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                </label>
              </div>

              <label class="block">
                <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Availability</span>
                <select
                  [(ngModel)]="availabilityFilter"
                  name="mobileAvailabilityFilter"
                  (ngModelChange)="onCatalogFilterChange()"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
                  <option *ngFor="let option of availabilityOptions; trackBy: trackByFilterOption" [value]="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <label class="block">
                <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Minimum rating</span>
                <select
                  [(ngModel)]="ratingFilter"
                  name="mobileRatingFilter"
                  (ngModelChange)="onCatalogFilterChange()"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
                  <option *ngFor="let option of ratingOptions; trackBy: trackByFilterOption" [value]="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>

            <div class="mt-5 flex items-center gap-3">
              <button
                type="button"
                class="btn-secondary flex-1 !px-4 !py-3 text-sm"
                (click)="resetFilters()"
              >
                Reset
              </button>
              <button
                type="button"
                class="btn-primary flex-1 !px-4 !py-3 text-sm"
                (click)="closeFilters()"
              >
                Apply
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `
})
export class ProductsPageComponent implements OnInit {
  user: any = null;
  searchQuery = '';
  loadingProducts = false;
  products: CustomerCatalogProduct[] = [];
  wishlistedProductIds = new Set<string>();
  wishlistBusyId = '';
  landingCategories: CustomerLandingCategoryGroup[] = [];
  catalogCategories: CustomerLandingCategory[] = [];
  sidebarCategories: CustomerLandingCategory[] = [];
  catalogCategoryTree: LandingCategoryNode[] = [];
  visibleCatalogCategories: LandingCategoryNode[] = [];
  expandedCategoryIds = new Set<string>();
  selectedCategorySlug = 'all';
  viewMode: 'landing' | 'search' = 'landing';
  catalogMessage = '';
  loadingCategories = false;
  currentPage = 1;
  pageSize = 12;
  catalogTotalItems = 0;
  catalogTotalPages = 1;
  sortBy = 'relevance';
  selectedBrand = 'all';
  availabilityFilter = 'all';
  ratingFilter = 'all';
  minPrice = '';
  maxPrice = '';
  isMobileFiltersOpen = false;
  readonly sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Customer Rating' },
    { value: 'popular', label: 'Popularity' }
  ];
  readonly availabilityOptions = [
    { value: 'all', label: 'All items' },
    { value: 'in-stock', label: 'In stock only' },
    { value: 'out-of-stock', label: 'Out of stock only' }
  ];
  readonly ratingOptions = [
    { value: 'all', label: 'Any rating' },
    { value: '4', label: '4 stars & above' },
    { value: '3', label: '3 stars & above' },
    { value: '2', label: '2 stars & above' }
  ];
  readonly skeletonCards = Array.from({ length: 6 });

  constructor(
    private authService: AuthService,
    private catalogService: CatalogService,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (this.isCustomer()) {
        this.loadWishlistState();
      } else {
        this.wishlistedProductIds = new Set<string>();
      }
    });

    this.authService.ensureCurrentUser().subscribe({
      next: () => {},
      error: () => {
        this.authService.clearCurrentUser();
      }
    });

    this.loadLandingCategories();

    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('q') || '';
      this.selectedCategorySlug = params.get('category') || 'all';
      this.currentPage = 1;

      if (this.searchQuery.trim()) {
        this.viewMode = 'search';
        this.searchProducts();
        return;
      }

      this.viewMode = 'landing';
      this.loadLandingProducts();
    });
  }

  isAdmin(): boolean {
    if (!this.user?.role) return false;
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((role: string) => role.toLowerCase() === 'admin');
    }
    return String(this.user.role).toLowerCase() === 'admin';
  }

  isVendor(): boolean {
    if (!this.user?.role) return false;
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((role: string) => role.toLowerCase() === 'vendor');
    }
    return String(this.user.role).toLowerCase() === 'vendor';
  }

  isCustomer(): boolean {
    return !!this.user && !this.isAdmin() && !this.isVendor();
  }

  openMobileFilters(): void {
    this.openFilters();
  }

  openFilters(): void {
    this.isMobileFiltersOpen = true;
  }

  closeMobileFilters(): void {
    this.closeFilters();
  }

  closeFilters(): void {
    this.isMobileFiltersOpen = false;
  }

  toggleFilters(): void {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeMobileFilters();
  }

  activeFilterCount(): number {
    return [
      this.selectedCategorySlug !== 'all',
      this.selectedBrand !== 'all',
      this.sortBy !== 'relevance',
      this.availabilityFilter !== 'all',
      this.ratingFilter !== 'all',
      this.minPrice !== '',
      this.maxPrice !== ''
    ].filter(Boolean).length;
  }

  openProduct(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    this.router.navigate(['/products', product._id]);
  }

  private refreshCatalogListing(): void {
    this.loadingProducts = true;
    this.catalogMessage = '';

    const query = this.searchQuery.trim();
    const params: CatalogQueryParams = {
      q: query || undefined,
      category: this.selectedCategorySlug !== 'all' ? this.selectedCategorySlug : undefined,
      brand: this.selectedBrand !== 'all' ? this.selectedBrand : undefined,
      availability: this.availabilityFilter as CatalogQueryParams['availability'],
      rating: this.ratingFilter,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      sortBy: this.sortBy
    };

    this.catalogService.getCatalogProducts(this.currentPage, this.pageSize, params).subscribe({
      next: (response) => {
        this.loadingProducts = false;
        const payload = response?.data || {};
        const rawProducts = Array.isArray(payload?.docs) ? payload.docs : Array.isArray(payload) ? payload : [];
        this.products = rawProducts.map((product: CustomerCatalogProduct) => this.attachCatalogContext(product));
        this.catalogTotalItems = Number(payload?.totalDocs || this.products.length || 0);
        this.catalogTotalPages = Math.max(1, Number(payload?.totalPages || 1));
        this.currentPage = Number(payload?.page || this.currentPage || 1);
        this.catalogMessage = this.buildCatalogMessage(query);
      },
      error: () => {
        this.loadingProducts = false;
        this.products = [];
        this.catalogTotalItems = 0;
        this.catalogTotalPages = 1;
        this.catalogMessage = 'No products are available right now.';
      }
    });
  }

  searchProducts(): void {
    this.currentPage = 1;
    this.viewMode = this.searchQuery.trim() ? 'search' : 'landing';
    this.refreshCatalogListing();
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery = value;
    this.catalogMessage = '';

    const query = value.trim();
    if (!query) {
      this.viewMode = 'landing';
      this.selectedCategorySlug = 'all';
      this.currentPage = 1;
      this.refreshCatalogListing();
      return;
    }
  }

  loadLandingProducts(): void {
    this.viewMode = 'landing';
    this.catalogService.getLandingPageProducts().subscribe({
      next: (response) => {
        this.landingCategories = Array.isArray(response?.data) ? response.data : [];
        this.refreshSidebarCategories();
        this.refreshCatalogMessage();
      },
      error: () => {
        this.landingCategories = [];
        this.sidebarCategories = [];
      }
    });
    this.refreshCatalogListing();
  }

  loadLandingCategories(): void {
    this.loadingCategories = true;

    this.catalogService.getLandingCategories().subscribe({
      next: (response) => {
        this.loadingCategories = false;
        this.catalogCategories = Array.isArray(response?.data) ? response.data : [];
        this.catalogCategoryTree = this.buildCategoryTree(this.catalogCategories);
        this.expandedCategoryIds = new Set<string>();
        this.visibleCatalogCategories = this.buildVisibleCategoryList();
        this.catalogCategories = [...this.catalogCategories].sort((a, b) => {
          const levelDiff = Number(a.level || 0) - Number(b.level || 0);
          if (levelDiff !== 0) return levelDiff;
          return String(a.name || '').localeCompare(String(b.name || ''));
        });
        this.refreshSidebarCategories();
        this.refreshCatalogMessage();
      },
      error: (error) => {
        this.loadingCategories = false;
        this.catalogCategories = [];
        this.sidebarCategories = [];
      }
    });
  }

  productImage(product: CustomerCatalogProduct): string {
    return (
      product.displayVariant?.variantImage ||
      product.mainImages?.[0] ||
      'https://via.placeholder.com/640x480?text=Product'
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  isWishlisted(product: CustomerCatalogProduct): boolean {
    return !!product?._id && this.wishlistedProductIds.has(product._id);
  }

  toggleWishlist(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    if (!this.isCustomer()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.wishlistBusyId === product._id) {
      return;
    }

    this.wishlistBusyId = product._id;
    this.wishlistService.toggleWishlist(product._id).subscribe({
      next: (wishlist) => {
        this.wishlistBusyId = '';
        this.syncWishlistSet(wishlist?.products || []);
        this.errorService.showToast(
          this.wishlistedProductIds.has(product._id) ? 'Saved to wishlist.' : 'Removed from wishlist.',
          'success'
        );
      },
      error: (error) => {
        this.wishlistBusyId = '';
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  productOriginalPrice(product: CustomerCatalogProduct): string {
    const original = product.displayVariant?.productPrice || product.basePrice || 0;
    const discounted = product.displayVariant?.finalPrice || product.basePrice || 0;

    if (!original || original === discounted) {
      return '';
    }

    return this.formatCurrency(original);
  }

  productDiscountedPrice(product: CustomerCatalogProduct): string {
    return this.formatCurrency(product.displayVariant?.finalPrice || product.basePrice || 0);
  }

  selectCategory(slug: string): void {
    this.selectedCategorySlug = slug || 'all';
    this.currentPage = 1;
    this.refreshCatalogMessage();
  }

  handleCategoryClick(category: LandingCategoryNode): void {
    if (category.children.length > 0) {
      const isAlreadySelected = this.normalizeCategoryKey(this.selectedCategorySlug) === this.normalizeCategoryKey(category.slug || category.name);

      if (this.expandedCategoryIds.has(category._id) && isAlreadySelected) {
        this.expandedCategoryIds.delete(category._id);
        this.visibleCatalogCategories = this.buildVisibleCategoryList();
        return;
      }

      this.expandedCategoryIds.add(category._id);
      this.visibleCatalogCategories = this.buildVisibleCategoryList();
      this.selectCategory(category.slug);
      return;
    }

    this.selectCategory(category.slug);
  }

  displayProducts(): CustomerCatalogProduct[] {
    return this.products;
  }

  paginatedProducts(): CustomerCatalogProduct[] {
    return this.products;
  }

  get totalPages(): number {
    return this.catalogTotalPages;
  }

  visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    return [1, current - 1, current, current + 1, total]
      .filter((page) => page >= 1 && page <= total)
      .filter((page, index, array) => array.indexOf(page) === index)
      .sort((a, b) => a - b);
  }

  paginationStartIndex(): number {
    const total = this.catalogTotalItems;
    if (!total) {
      return 0;
    }

    return Math.min(total, (this.currentPage - 1) * this.pageSize + 1);
  }

  paginationEndIndex(): number {
    const total = this.catalogTotalItems;
    return Math.min(total, this.currentPage * this.pageSize);
  }

  changePage(page: number): void {
    const normalized = Math.min(Math.max(1, page), this.totalPages);
    if (normalized === this.currentPage) {
      return;
    }

    this.currentPage = normalized;
    this.refreshCatalogListing();
  }

  totalProductCount(): number {
    return this.catalogTotalItems || this.products.length;
  }

  categoryCount(category: CustomerLandingCategory): number {
    const key = this.normalizeCategoryKey(category.slug || category.name);
    const node = this.findCategoryNodeBySlug(key);

    if (!node) {
      return 0;
    }

    return this.countProductsForNode(node);
  }

  categoryImage(category: CustomerLandingCategory): string {
    return category.image || 'https://via.placeholder.com/160x160?text=Category';
  }

  isSelectedCategory(category: CustomerLandingCategory): boolean {
    return this.normalizeCategoryKey(this.selectedCategorySlug) === this.normalizeCategoryKey(category.slug || category.name);
  }

  isExpanded(category: LandingCategoryNode): boolean {
    return this.expandedCategoryIds.has(category._id);
  }

  pageSubtitle(): string {
    if (this.viewMode === 'search' && this.searchQuery.trim()) {
      return this.hasActiveFilters()
        ? `Showing search results for "${this.searchQuery.trim()}" with active filters.`
        : `Showing search results for "${this.searchQuery.trim()}".`;
    }

    if (this.selectedCategorySlug === 'all') {
      return this.hasActiveFilters()
        ? 'Browse premium dry fruits with filters and sorting.'
        : 'Browse premium dry fruits by type or search for a specific pack.';
    }

    const selectedCategory = this.catalogCategories.find(
      (category) => this.normalizeCategoryKey(category.slug || category.name) === this.normalizeCategoryKey(this.selectedCategorySlug)
    );

    return selectedCategory?.name
      ? this.hasActiveFilters()
        ? `Browsing ${selectedCategory.name} with filters applied.`
        : `Browsing ${selectedCategory.name}.`
      : 'Browse premium dry fruits by type or search for a specific pack.';
  }

  selectedCategoryDescription(): string {
    if (this.selectedCategorySlug === 'all' || this.viewMode === 'search') {
      return '';
    }

    const selectedCategory = this.catalogCategories.find(
      (category) => this.normalizeCategoryKey(category.slug || category.name) === this.normalizeCategoryKey(this.selectedCategorySlug)
    );

    return String(selectedCategory?.description || '').trim();
  }

  trackByCategoryId(_: number, category: CustomerLandingCategory): string {
    return category._id;
  }

  trackByProductId(_: number, product: CustomerCatalogProduct): string {
    return product._id;
  }

  trackByCategorySlug(_: number, category: CustomerLandingCategoryGroup): string {
    return category.categorySlug || category.categoryName || '';
  }

  trackByVisibleCategoryId(_: number, category: LandingCategoryNode): string {
    return category._id;
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  trackByValue(_: number, value: string): string {
    return value;
  }

  trackBySortOption(_: number, option: { value: string; label: string }): string {
    return option.value;
  }

  trackByFilterOption(_: number, option: { value: string; label: string }): string {
    return option.value;
  }

  categoryLabel(category: CustomerLandingCategory): string {
    const level = Number(category.level || 0);
    const indent = level > 0 ? `${'  '.repeat(level)}- ` : '';
    return `${indent}${category.name}`;
  }

  private normalizeCategoryKey(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  onCatalogFilterChange(): void {
    this.currentPage = 1;
    this.refreshCatalogListing();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.sortBy = 'relevance';
    this.selectedCategorySlug = 'all';
    this.selectedBrand = 'all';
    this.availabilityFilter = 'all';
    this.ratingFilter = 'all';
    this.minPrice = '';
    this.maxPrice = '';
    this.currentPage = 1;
    this.viewMode = 'landing';
    this.refreshCatalogListing();
  }

  brandOptions(): string[] {
    const seen = new Set<string>();
    const brands: string[] = [];

    const sourceProducts = this.landingCategories.length
      ? this.flattenLandingProducts(this.landingCategories)
      : this.products;

    sourceProducts.forEach((product) => {
      const brand = String(product.brand || '').trim();
      const normalized = this.normalizeCatalogKey(brand);

      if (!brand || seen.has(normalized)) {
        return;
      }

      seen.add(normalized);
      brands.push(brand);
    });

    return brands.sort((a, b) => a.localeCompare(b));
  }

  private attachCatalogContext(product: CustomerCatalogProduct): CustomerCatalogProduct {
    const normalized = this.normalizeCatalogKey(product.categoryDetails?.slug || product.categoryDetails?.name || '');
    const matchedCategory = this.catalogCategories.find((category) => {
      const slug = this.normalizeCatalogKey(category.slug || '');
      const name = this.normalizeCatalogKey(category.name || '');
      return slug === normalized || name === normalized;
    });

    if (!matchedCategory) {
      return {
        ...product,
        catalogCategoryName: product.catalogCategoryName || product.categoryDetails?.name || ''
      };
    }

    return {
      ...product,
      catalogCategorySlug: matchedCategory.slug,
      catalogCategoryName: matchedCategory.name
    };
  }

  private flattenLandingProducts(groups: CustomerLandingCategoryGroup[]): CustomerCatalogProduct[] {
    const catalogProducts: CustomerCatalogProduct[] = [];

    groups.forEach((group) => {
      (group.products || []).forEach((product) => {
        catalogProducts.push({
          ...this.attachCatalogContext({
            ...product,
            catalogCategorySlug: group.categorySlug || product.categoryDetails?.slug || '',
            catalogCategoryName: group.categoryName || product.categoryDetails?.name || ''
          }),
          catalogCategorySlug: group.categorySlug || product.categoryDetails?.slug || '',
          catalogCategoryName: group.categoryName || product.categoryDetails?.name || ''
        });
      });
    });

    return catalogProducts;
  }

  hasActiveFilters(): boolean {
    return [
      this.sortBy !== 'relevance',
      this.selectedBrand !== 'all',
      this.availabilityFilter !== 'all',
      this.ratingFilter !== 'all',
      this.minPrice !== '',
      this.maxPrice !== '',
      this.selectedCategorySlug !== 'all'
    ].some(Boolean);
  }

  private normalizeCatalogKey(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private loadWishlistState(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.syncWishlistSet(wishlist?.products || []);
      },
      error: () => {
        this.wishlistedProductIds = new Set<string>();
      }
    });
  }

  private syncWishlistSet(products: { _id?: string }[]): void {
    this.wishlistedProductIds = new Set(
      (products || [])
        .map((item) => item?._id)
        .filter((id): id is string => !!id)
    );
  }

  private toTimestamp(value?: string): number {
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private buildCategoryTree(categories: CustomerLandingCategory[]): LandingCategoryNode[] {
    const nodeMap = new Map<string, LandingCategoryNode>();

    categories.forEach((category) => {
      nodeMap.set(category._id, {
        ...category,
        children: []
      });
    });

    const roots: LandingCategoryNode[] = [];

    nodeMap.forEach((node) => {
      const parentId = node.parentCategory ? String(node.parentCategory) : '';
      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (nodes: LandingCategoryNode[]): LandingCategoryNode[] => {
      return nodes
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        .map((node) => ({
          ...node,
          children: sortNodes(node.children || [])
        }));
    };

    return sortNodes(roots);
  }

  private buildVisibleCategoryList(): LandingCategoryNode[] {
    const visible: LandingCategoryNode[] = [];

    const visit = (nodes: LandingCategoryNode[], depth = 0): void => {
      nodes.forEach((node) => {
        visible.push({
          ...node,
          level: depth
        });

        if (node.children.length > 0 && this.expandedCategoryIds.has(node._id)) {
          visit(node.children, depth + 1);
        }
      });
    };

    visit(this.catalogCategoryTree);
    return visible;
  }

  private toggleCategoryExpansion(category: LandingCategoryNode): void {
    if (this.expandedCategoryIds.has(category._id)) {
      this.expandedCategoryIds.delete(category._id);
    } else {
      this.expandedCategoryIds.add(category._id);
    }

    this.visibleCatalogCategories = this.buildVisibleCategoryList();
  }

  private findCategoryNodeBySlug(slug: string): LandingCategoryNode | null {
    const targetSlug = this.normalizeCategoryKey(slug);
    const stack = [...this.catalogCategoryTree];

    while (stack.length > 0) {
      const current = stack.shift();
      if (!current) continue;

      if (this.normalizeCategoryKey(current.slug || current.name) === targetSlug) {
        return current;
      }

      stack.unshift(...(current.children || []));
    }

    return null;
  }

  private getSelectedCategoryKeys(): Set<string> {
    const selectedNode = this.findCategoryNodeBySlug(this.selectedCategorySlug);
    if (!selectedNode) {
      return new Set<string>();
    }

    return this.collectCategoryKeys(selectedNode);
  }

  private collectCategoryKeys(node: LandingCategoryNode): Set<string> {
    const keys = new Set<string>();
    const visit = (current: LandingCategoryNode): void => {
      const slug = this.normalizeCatalogKey(current.slug || '');
      const name = this.normalizeCatalogKey(current.name || '');

      if (slug) keys.add(slug);
      if (name) keys.add(name);

      (current.children || []).forEach(visit);
    };

    visit(node);
    return keys;
  }

  private countProductsForNode(node: LandingCategoryNode): number {
    const directCount = this.productsForNode(node).length;

    if (!node.children.length) {
      return directCount;
    }

    return node.children.reduce((total, child) => total + this.countProductsForNode(child), directCount);
  }

  private refreshSidebarCategories(): void {
    if (!this.catalogCategories.length || !this.catalogCategoryTree.length) {
      this.sidebarCategories = [];
      return;
    }

    this.sidebarCategories = this.catalogCategories.filter((category) => this.categoryCount(category) > 0);
  }

  private buildCatalogMessage(query: string): string {
    const trimmedQuery = String(query || '').trim();
    const totalItems = this.totalProductCount();

    if (trimmedQuery) {
      return totalItems
        ? `${totalItems} product${totalItems === 1 ? '' : 's'} found for "${trimmedQuery}".`
        : `No products matched "${trimmedQuery}".`;
    }

    const selectedCategory = this.findCategoryNodeBySlug(this.selectedCategorySlug);

    if (this.selectedCategorySlug === 'all') {
      if (this.hasActiveFilters()) {
        return `Showing ${totalItems} filtered product${totalItems === 1 ? '' : 's'} across the catalog.`;
      }

      return this.landingCategories.length
        ? `Showing ${totalItems} curated product${totalItems === 1 ? '' : 's'} across ${this.landingCategories.length} categorie${this.landingCategories.length === 1 ? 'y' : 's'}.`
        : 'Browse premium dry fruits by type or search for a specific pack.';
    }

    if (selectedCategory?.name) {
      return this.hasActiveFilters()
        ? `Browsing ${selectedCategory.name} with ${totalItems} filtered product${totalItems === 1 ? '' : 's'}.`
        : `Browsing ${selectedCategory.name} with ${totalItems} product${totalItems === 1 ? '' : 's'}.`;
    }

    return 'Browse premium dry fruits by type or search for a specific pack.';
  }

  private refreshCatalogMessage(): void {
    this.catalogMessage = this.buildCatalogMessage(this.searchQuery.trim());
  }

  private collectProductsForNode(node: LandingCategoryNode): CustomerCatalogProduct[] {
    const products = new Map<string, CustomerCatalogProduct>();

    const addProducts = (targetNode: LandingCategoryNode): void => {
      this.productsForNode(targetNode).forEach((product) => {
        if (product?._id) {
          products.set(product._id, product);
        }
      });

      targetNode.children.forEach(addProducts);
    };

    addProducts(node);
    return Array.from(products.values());
  }

  private productsForNode(node: LandingCategoryNode): CustomerCatalogProduct[] {
    return this.landingCategories.find(
      (group) => this.normalizeCategoryKey(group.categorySlug || group.categoryName || '') === this.normalizeCategoryKey(node.slug || node.name)
    )?.products || [];
  }
}


