import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../../core/models/customer.models';

interface LandingCategoryNode extends CustomerLandingCategory {
  children: LandingCategoryNode[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="relative min-h-[calc(100vh-72px)] w-full overflow-hidden bg-slate-50">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 left-8 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl"></div>
        <div class="absolute top-32 right-0 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl"></div>
      </div>

      <section class="relative h-full w-full px-3 py-3 sm:px-4 lg:px-6 lg:py-6">
        <div class="h-full min-h-[calc(100vh-88px)] overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">

          <div class="grid min-h-[calc(100vh-150px)] gap-0 lg:grid-cols-[320px_1fr]">
            <aside class="border-b border-slate-200 bg-slate-50/80 px-4 py-5 lg:sticky lg:top-6 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:bg-slate-50/90">
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
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="all">All categories</option>
                      <option *ngFor="let category of catalogCategories; trackBy: trackByCategoryId" [value]="category.slug || category.name">
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
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
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
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    >
                      <option *ngFor="let option of sortOptions; trackBy: trackBySortOption" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <div class="grid grid-cols-2 gap-3">
                    <label class="block">
                      <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Min price</span>
                      <input
                      [(ngModel)]="minPrice"
                      name="minPrice"
                      (ngModelChange)="onCatalogFilterChange()"
                      type="number"
                        min="0"
                        placeholder="0"
                        class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
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
                        class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                      />
                    </label>
                  </div>

                  <label class="block">
                    <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Availability</span>
                    <select
                      [(ngModel)]="availabilityFilter"
                      name="availabilityFilter"
                      (ngModelChange)="onCatalogFilterChange()"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
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
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    >
                      <option *ngFor="let option of ratingOptions; trackBy: trackByFilterOption" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>
                </div>
              </div>
            </aside>

            <main class="bg-white px-4 py-5 sm:px-6 lg:px-6">
              <div class="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">Landing page</p>
                  <h1 class="mt-1 text-3xl font-black tracking-tight text-slate-900">Products</h1>
                  <p class="mt-2 text-sm font-medium text-slate-500">
                    {{ pageSubtitle() }}
                  </p>
                </div>

                <form class="relative w-full md:max-w-xl" (ngSubmit)="searchProducts()">
                  <div class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition focus-within:border-sky-400 focus-within:bg-white">
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
                      placeholder="Search for products, brands and more"
                      class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>

                </form>
              </div>

              <div class="mb-5 flex flex-wrap items-center gap-3 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <label class="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
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
                    class="rounded-full bg-sky-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-sky-700"
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
                    class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700"
                  >
                    {{ availabilityFilter === 'in-stock' ? 'In stock only' : 'Out of stock only' }}
                  </span>
                  <span
                    *ngIf="ratingFilter !== 'all'"
                    class="rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-violet-700"
                  >
                    {{ ratingFilter }}+ rating
                  </span>
                </div>
              </div>

              <div
                *ngIf="catalogMessage"
                class="mb-4 rounded-[1.1rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
              >
                {{ catalogMessage }}
              </div>

              <div *ngIf="loadingProducts" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div *ngFor="let _ of skeletonCards" class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div class="aspect-square rounded-[1.2rem] bg-slate-200"></div>
                  <div class="mt-4 h-4 w-3/4 rounded-full bg-slate-200"></div>
                  <div class="mt-3 h-4 w-1/2 rounded-full bg-slate-200"></div>
                  <div class="mt-3 h-10 rounded-[1rem] bg-slate-200"></div>
                </div>
              </div>

              <ng-container *ngIf="!loadingProducts">
                <div *ngIf="displayProducts().length === 0" class="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                  <h2 class="text-2xl font-black text-slate-900">No products found</h2>
                  <p class="mt-3 text-sm font-medium text-slate-500">
                    Try a different search, adjust filters, or switch to another category.
                  </p>
                  <button
                    type="button"
                    class="mt-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    (click)="resetFilters()"
                  >
                    Reset filters
                  </button>
                </div>

                <div *ngIf="displayProducts().length > 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <a
                    *ngFor="let product of paginatedProducts(); trackBy: trackByProductId"
                    [routerLink]="['/products', product._id]"
                    class="group rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                  >
                    <div class="aspect-square overflow-hidden rounded-[1.3rem] border border-slate-200 bg-slate-100">
                      <img
                        [src]="productImage(product)"
                        [alt]="product.productName"
                        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div class="mt-4 space-y-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="truncate text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {{ product.brand || 'Generic Brand' }}
                          </p>
                          <h2 class="mt-1 line-clamp-2 text-lg font-black text-slate-900">
                            {{ product.productName }}
                          </h2>
                        </div>
                        <span class="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-slate-900 shadow-sm ring-1 ring-amber-200">
                          {{ formatCurrency(product.displayVariant?.finalPrice || product.basePrice || 0) }}
                        </span>
                      </div>

                      <p class="text-sm font-semibold text-slate-500">
                        {{ product.categoryDetails?.name || 'General Category' }}
                      </p>

                      <div class="flex items-center gap-2">
                        <span *ngIf="productOriginalPrice(product)" class="text-sm font-bold text-slate-400 line-through">
                          {{ productOriginalPrice(product) }}
                        </span>
                        <span class="text-base font-black text-slate-900">
                          {{ productDiscountedPrice(product) }}
                        </span>
                      </div>

                      <div class="flex items-center justify-between pt-1 text-sm font-black">
                        <span class="text-slate-500">
                          {{ (product.variants || []).length }} variant{{ (product.variants || []).length === 1 ? '' : 's' }}
                        </span>
                        <span class="text-sky-700 transition group-hover:translate-x-1 group-hover:text-sky-800">
                          View Product
                        </span>
                      </div>
                    </div>
                  </a>
                </div>

                <div *ngIf="displayProducts().length > pageSize" class="mt-6 flex flex-col gap-4 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-sm font-semibold text-slate-500">
                    Showing {{ paginationStartIndex() }}-{{ paginationEndIndex() }} of {{ displayProducts().length }} products
                  </p>

                  <div class="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-xs sm:tracking-[0.16em]"
                      [disabled]="currentPage === 1"
                      (click)="changePage(currentPage - 1)"
                    >
                      Prev
                    </button>

                    <ng-container *ngIf="visiblePages().length <= 5; else compactPager">
                      <button
                        *ngFor="let page of visiblePages(); trackBy: trackByPage"
                        type="button"
                        class="min-w-9 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition sm:min-w-10 sm:px-4 sm:text-xs sm:tracking-[0.16em]"
                        [class.bg-sky-600]="page === currentPage"
                        [class.text-white]="page === currentPage"
                        [class.bg-white]="page !== currentPage"
                        [class.text-slate-600]="page !== currentPage"
                        [class.border]="page !== currentPage"
                        [class.border-slate-200]="page !== currentPage"
                        (click)="changePage(page)"
                      >
                        {{ page }}
                      </button>
                    </ng-container>

                    <ng-template #compactPager>
                      <button
                        type="button"
                        class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 sm:px-4 sm:text-xs sm:tracking-[0.16em]"
                        [class.border-sky-300]="currentPage > 2"
                        [class.bg-sky-50]="currentPage > 2"
                        [class.text-sky-700]="currentPage > 2"
                        [disabled]="currentPage <= 2"
                        (click)="changePage(currentPage - 2)"
                      >
                        ...
                      </button>

                      <button
                        *ngFor="let page of visiblePages(); trackBy: trackByPage"
                        type="button"
                        class="min-w-9 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition sm:min-w-10 sm:px-4 sm:text-xs sm:tracking-[0.16em]"
                        [class.bg-sky-600]="page === currentPage"
                        [class.text-white]="page === currentPage"
                        [class.bg-white]="page !== currentPage"
                        [class.text-slate-600]="page !== currentPage"
                        [class.border]="page !== currentPage"
                        [class.border-slate-200]="page !== currentPage"
                        (click)="changePage(page)"
                      >
                        {{ page }}
                      </button>

                      <button
                        type="button"
                        class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 sm:px-4 sm:text-xs sm:tracking-[0.16em]"
                        [class.border-sky-300]="currentPage < totalPages - 1"
                        [class.bg-sky-50]="currentPage < totalPages - 1"
                        [class.text-sky-700]="currentPage < totalPages - 1"
                        [disabled]="currentPage >= totalPages - 1"
                        (click)="changePage(currentPage + 2)"
                      >
                        ...
                      </button>
                    </ng-template>

                    <button
                      type="button"
                      class="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-xs sm:tracking-[0.16em]"
                      [disabled]="currentPage === totalPages"
                      (click)="changePage(currentPage + 1)"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </ng-container>
            </main>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit {
  user: any = null;
  searchQuery = '';
  loadingProducts = false;
  products: CustomerCatalogProduct[] = [];
  landingCategories: CustomerLandingCategoryGroup[] = [];
  catalogCategories: CustomerLandingCategory[] = [];
  catalogCategoryTree: LandingCategoryNode[] = [];
  visibleCatalogCategories: LandingCategoryNode[] = [];
  expandedCategoryIds = new Set<string>();
  selectedCategorySlug = 'all';
  viewMode: 'landing' | 'search' = 'landing';
  catalogMessage = '';
  loadingCategories = false;
  currentPage = 1;
  pageSize = 12;
  sortBy = 'relevance';
  selectedBrand = 'all';
  availabilityFilter = 'all';
  ratingFilter = 'all';
  minPrice = '';
  maxPrice = '';
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
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });

    this.authService.ensureCurrentUser().subscribe({
      next: () => {},
      error: () => {
        this.authService.clearCurrentUser();
      }
    });

    this.loadLandingProducts();
    this.loadLandingCategories();
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

  searchProducts(): void {
    const query = this.searchQuery.trim();
    this.catalogMessage = '';

    if (!query) {
      this.viewMode = 'landing';
      this.loadLandingProducts();
      return;
    }

    this.loadingProducts = true;
    this.viewMode = 'search';
    this.currentPage = 1;
    this.products = [];
    this.catalogService.searchProducts(query, 1, 1000).subscribe({
      next: (response) => {
        this.loadingProducts = false;
        const rawProducts = Array.isArray(response?.data) ? response.data : response?.data?.docs || [];
        this.products = rawProducts.map((product: CustomerCatalogProduct) => this.attachCatalogContext(product));
        this.currentPage = 1;
        this.catalogMessage = this.displayProducts().length
          ? `${this.displayProducts().length} product${this.displayProducts().length === 1 ? '' : 's'} found for "${query}".`
          : `No products matched "${query}".`;
      },
      error: (error) => {
        this.loadingProducts = false;
        this.products = [];
      }
    });
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery = value;
    this.catalogMessage = '';

    const query = value.trim();
    if (!query) {
      this.viewMode = 'landing';
      this.selectedCategorySlug = 'all';
      this.catalogMessage = '';
      this.currentPage = 1;
      this.loadLandingProducts();
      return;
    }
  }

  loadLandingProducts(): void {
    this.loadingProducts = true;
    this.catalogMessage = '';
    this.products = [];
    this.landingCategories = [];
    this.currentPage = 1;

    this.catalogService.getLandingPageProducts().subscribe({
      next: (response) => {
        this.loadingProducts = false;
        this.landingCategories = Array.isArray(response?.data) ? response.data : [];
        this.products = this.flattenLandingProducts(this.landingCategories);
        this.viewMode = 'landing';
        this.currentPage = 1;
        if (!this.landingCategories.some((category) => this.normalizeCategoryKey(category.categorySlug || category.categoryName || '') === this.normalizeCategoryKey(this.selectedCategorySlug))) {
          this.selectedCategorySlug = 'all';
        }
        this.refreshCatalogMessage();
      },
      error: (error) => {
        this.loadingProducts = false;
        this.landingCategories = [];
      }
    });
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
        this.products = this.products.map((product) => this.attachCatalogContext(product));
        this.catalogCategories = [...this.catalogCategories].sort((a, b) => {
          const levelDiff = Number(a.level || 0) - Number(b.level || 0);
          if (levelDiff !== 0) return levelDiff;
          return String(a.name || '').localeCompare(String(b.name || ''));
        });
        this.refreshCatalogMessage();
      },
      error: (error) => {
        this.loadingCategories = false;
        this.catalogCategories = [];
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
    return this.applyCatalogFilters(this.products);
  }

  paginatedProducts(): CustomerCatalogProduct[] {
    const allProducts = this.displayProducts();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return allProducts.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.displayProducts().length / this.pageSize));
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
    const total = this.displayProducts().length;
    if (!total) {
      return 0;
    }

    return Math.min(total, (this.currentPage - 1) * this.pageSize + 1);
  }

  paginationEndIndex(): number {
    const total = this.displayProducts().length;
    return Math.min(total, this.currentPage * this.pageSize);
  }

  changePage(page: number): void {
    const normalized = Math.min(Math.max(1, page), this.totalPages);
    this.currentPage = normalized;
  }

  totalProductCount(): number {
    return this.products.length;
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
        ? 'Browse featured products with marketplace-style filters and sorting.'
        : 'Browse featured products by category or search for a specific item.';
    }

    const selectedCategory = this.catalogCategories.find(
      (category) => this.normalizeCategoryKey(category.slug || category.name) === this.normalizeCategoryKey(this.selectedCategorySlug)
    );

    return selectedCategory?.name
      ? this.hasActiveFilters()
        ? `Browsing ${selectedCategory.name} with filters applied.`
        : `Browsing ${selectedCategory.name}.`
      : 'Browse featured products by category or search for a specific item.';
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
    const typeLabel = level > 0 ? 'Child' : 'Parent';
    return `${indent}${category.name} (${typeLabel})`;
  }

  private normalizeCategoryKey(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  onCatalogFilterChange(): void {
    this.currentPage = 1;
    this.refreshCatalogMessage();
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
    this.loadLandingProducts();
  }

  brandOptions(): string[] {
    const seen = new Set<string>();
    const brands: string[] = [];

    this.products.forEach((product) => {
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

  private applyCatalogFilters(products: CustomerCatalogProduct[]): CustomerCatalogProduct[] {
    const filtered = products.filter((product) => {
      if (!this.matchesCategory(product)) {
        return false;
      }

      if (!this.matchesBrand(product)) {
        return false;
      }

      if (!this.matchesPrice(product)) {
        return false;
      }

      if (!this.matchesAvailability(product)) {
        return false;
      }

      if (!this.matchesRating(product)) {
        return false;
      }

      return true;
    });

    return this.sortCatalogProducts(filtered);
  }

  private matchesCategory(product: CustomerCatalogProduct): boolean {
    if (this.selectedCategorySlug === 'all') {
      return true;
    }

    const selectedKeys = this.getSelectedCategoryKeys();
    if (selectedKeys.size === 0) {
      return true;
    }

    const productCategory = this.normalizeCatalogKey(product.catalogCategorySlug || product.categoryDetails?.slug || product.categoryDetails?.name || '');
    const productCategoryName = this.normalizeCatalogKey(product.catalogCategoryName || product.categoryDetails?.name || '');

    return selectedKeys.has(productCategory) || selectedKeys.has(productCategoryName);
  }

  private matchesBrand(product: CustomerCatalogProduct): boolean {
    if (this.selectedBrand === 'all') {
      return true;
    }

    return this.normalizeCatalogKey(product.brand || '') === this.normalizeCatalogKey(this.selectedBrand);
  }

  private matchesPrice(product: CustomerCatalogProduct): boolean {
    const price = this.productDisplayPrice(product);

    if (this.minPrice !== '' && price < Number(this.minPrice)) {
      return false;
    }

    if (this.maxPrice !== '' && price > Number(this.maxPrice)) {
      return false;
    }

    return true;
  }

  private matchesAvailability(product: CustomerCatalogProduct): boolean {
    if (this.availabilityFilter === 'all') {
      return true;
    }

    const inStock = (product.variants || []).some((variant) => Number(variant.productStock || 0) > 0 || !!variant.isAvailable);
    return this.availabilityFilter === 'in-stock' ? inStock : !inStock;
  }

  private matchesRating(product: CustomerCatalogProduct): boolean {
    if (this.ratingFilter === 'all') {
      return true;
    }

    return Number(product.averageRating || 0) >= Number(this.ratingFilter);
  }

  private sortCatalogProducts(products: CustomerCatalogProduct[]): CustomerCatalogProduct[] {
    const sorted = [...products];

    switch (this.sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => this.productDisplayPrice(a) - this.productDisplayPrice(b));
      case 'price-desc':
        return sorted.sort((a, b) => this.productDisplayPrice(b) - this.productDisplayPrice(a));
      case 'rating-desc':
        return sorted.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
      case 'newest':
        return sorted.sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt));
      case 'popular':
        return sorted.sort((a, b) => {
          const reviewDiff = Number(b.numberOfReviews || 0) - Number(a.numberOfReviews || 0);
          if (reviewDiff !== 0) return reviewDiff;
          return Number(b.averageRating || 0) - Number(a.averageRating || 0);
        });
      default:
        return sorted;
    }
  }

  private productDisplayPrice(product: CustomerCatalogProduct): number {
    return Number(product.displayVariant?.finalPrice || product.basePrice || 0);
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

  private hasActiveFilters(): boolean {
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

  private refreshCatalogMessage(): void {
    if (this.viewMode === 'search') {
      if (!this.searchQuery.trim()) {
        this.catalogMessage = '';
        return;
      }

      const count = this.displayProducts().length;
      this.catalogMessage = count
        ? `${count} product${count === 1 ? '' : 's'} found for "${this.searchQuery.trim()}".`
        : `No products matched "${this.searchQuery.trim()}".`;
      return;
    }

    const selectedCategory = this.findCategoryNodeBySlug(this.selectedCategorySlug);

    if (this.selectedCategorySlug === 'all') {
      if (this.hasActiveFilters()) {
        const filteredCount = this.displayProducts().length;
        this.catalogMessage = `Showing ${filteredCount} filtered product${filteredCount === 1 ? '' : 's'} across ${this.products.length} available item${this.products.length === 1 ? '' : 's'}.`;
        return;
      }

      this.catalogMessage = this.landingCategories.length
        ? `Showing ${this.totalProductCount()} curated product${this.totalProductCount() === 1 ? '' : 's'} across ${this.landingCategories.length} categorie${this.landingCategories.length === 1 ? 'y' : 's'}.`
        : 'No active product categories are available in the catalog yet.';
      return;
    }

    const count = this.displayProducts().length;
    this.catalogMessage = selectedCategory?.name
      ? this.hasActiveFilters()
        ? `Browsing ${selectedCategory.name} with ${count} filtered product${count === 1 ? '' : 's'}.`
        : `Browsing ${selectedCategory.name} with ${count} product${count === 1 ? '' : 's'}.`
      : 'Browse featured products by category or search for a specific item.';
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
