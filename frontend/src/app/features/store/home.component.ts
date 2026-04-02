import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../../core/models/customer.models';

interface LandingCategoryNode extends CustomerLandingCategory {
  children: LandingCategoryNode[];
}

interface ProductSuggestion {
  _id: string;
  productName: string;
  brand?: string;
  basePrice?: number;
  averageRating?: number;
  numberOfReviews?: number;
  mainImage?: string;
  categoryDetails?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
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
              

              <div class="mt-5 space-y-3">
                <button
                  type="button"
                  class="w-full rounded-[1.4rem] border px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  [class.border-blue-600]="selectedCategorySlug === 'all'"
                  [class.bg-blue-50]="selectedCategorySlug === 'all'"
                  [class.text-blue-900]="selectedCategorySlug === 'all'"
                  [class.border-slate-200]="selectedCategorySlug !== 'all'"
                  [class.bg-white]="selectedCategorySlug !== 'all'"
                  [class.text-slate-900]="selectedCategorySlug !== 'all'"
                  (click)="selectCategory('all')"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-[11px] font-black uppercase tracking-[0.22em]" [class.text-blue-700]="selectedCategorySlug === 'all'" [class.text-slate-400]="selectedCategorySlug !== 'all'">
                        All categories
                      </p>
                      <p class="mt-1 text-base font-black">Shop everything</p>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-black" [class.bg-blue-600]="selectedCategorySlug === 'all'" [class.text-white]="selectedCategorySlug === 'all'" [class.bg-slate-100]="selectedCategorySlug !== 'all'" [class.text-slate-600]="selectedCategorySlug !== 'all'">
                      {{ totalProductCount() }}
                    </span>
                  </div>
                </button>

                <div *ngIf="loadingCategories" class="space-y-3">
                  <div *ngFor="let _ of skeletonCards" class="h-20 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm"></div>
                </div>

                <button
                  *ngFor="let category of visibleCatalogCategories; trackBy: trackByVisibleCategoryId"
                  type="button"
                  class="w-full rounded-[1.4rem] border px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  [class.border-sky-300]="isSelectedCategory(category)"
                  [class.bg-sky-50]="isSelectedCategory(category)"
                  [class.text-slate-900]="!isSelectedCategory(category)"
                  [class.border-slate-200]="!isSelectedCategory(category)"
                  [class.bg-white]="!isSelectedCategory(category)"
                  (click)="handleCategoryClick(category)"
                  [style.paddingLeft.px]="16 + ((category.level || 0) * 18)"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <div class="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <img
                          [src]="categoryImage(category)"
                          [alt]="category.name"
                          class="h-full w-full object-cover"
                        />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-base font-black">{{ category.name }}</p>
                        <p class="mt-0.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {{ category.children.length ? 'Parent category' : 'Child category' }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span
                        *ngIf="category.children.length"
                        class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600"
                      >
                        {{ isExpanded(category) ? '−' : '+' }}
                      </span>
                      <span class="shrink-0 rounded-full px-3 py-1 text-xs font-black" [class.bg-sky-600]="isSelectedCategory(category)" [class.text-white]="isSelectedCategory(category)" [class.bg-slate-100]="!isSelectedCategory(category)" [class.text-slate-600]="!isSelectedCategory(category)">
                      {{ categoryCount(category) }}
                    </span>
                    </div>
                  </div>
                </button>
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

                <form class="w-full md:max-w-xl" (ngSubmit)="searchProducts()">
                  <div class="relative">
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
                        (focus)="onSearchFocus()"
                        (blur)="onSearchBlur()"
                        type="text"
                        placeholder="Search for products, brands and more"
                        class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    <div
                      *ngIf="showSuggestions && (loadingSuggestions || searchSuggestions.length > 0)"
                      class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
                    >
                      <div *ngIf="loadingSuggestions" class="px-4 py-4 text-sm font-semibold text-slate-500">
                        Loading suggestions...
                      </div>

                      <button
                        *ngFor="let suggestion of searchSuggestions; trackBy: trackBySuggestionId"
                        type="button"
                        class="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                        (mousedown)="$event.preventDefault(); selectSuggestion(suggestion)"
                      >
                        <div class="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          <img
                            [src]="suggestion.mainImage || 'https://via.placeholder.com/120x120?text=Product'"
                            [alt]="suggestion.productName"
                            class="h-full w-full object-cover"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-sm font-black text-slate-900">{{ suggestion.productName }}</p>
                          <p class="mt-0.5 truncate text-xs font-semibold text-slate-500">
                            {{ suggestion.brand || 'Generic Brand' }} · {{ suggestion.categoryDetails?.name || 'General Category' }}
                          </p>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-black text-slate-900">
                            {{ formatCurrency(suggestion.basePrice || 0) }}
                          </p>
                          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            {{ (suggestion.averageRating || 0).toFixed(1) }} rating
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <section class="mb-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div class="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label class="space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</span>
                      <select
                        [(ngModel)]="selectedCategorySlug"
                        name="categoryFilter"
                        (ngModelChange)="onCategoryFilterChange($event)"
                        class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                      >
                        <option value="all">All categories</option>
                        <option *ngFor="let category of catalogCategories; trackBy: trackByCategoryId" [value]="category.slug">
                          {{ category.name }}
                        </option>
                      </select>
                    </label>

                    <label class="space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sort</span>
                      <select
                        [(ngModel)]="selectedSort"
                        name="sortFilter"
                        (ngModelChange)="onSortChange($event)"
                        class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                      >
                        <option value="featured">Featured</option>
                        <option value="rating-desc">Highest rating</option>
                        <option value="price-asc">Price: low to high</option>
                        <option value="price-desc">Price: high to low</option>
                        <option value="newest">Newest first</option>
                      </select>
                    </label>

                    <label class="space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Min price</span>
                      <input
                        [(ngModel)]="minPriceFilter"
                        name="minPriceFilter"
                        type="number"
                        min="0"
                        placeholder="0"
                        (ngModelChange)="onPriceFilterChange()"
                        class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                      />
                    </label>

                    <label class="space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Max price</span>
                      <input
                        [(ngModel)]="maxPriceFilter"
                        name="maxPriceFilter"
                        type="number"
                        min="0"
                        placeholder="Any"
                        (ngModelChange)="onPriceFilterChange()"
                        class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100"
                      />
                    </label>
                  </div>

                  <div class="flex flex-wrap items-center gap-3">
                    <label class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                      <input
                        [(ngModel)]="inStockOnly"
                        name="inStockOnly"
                        type="checkbox"
                        class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        (ngModelChange)="onInStockToggle()"
                      />
                      In stock only
                    </label>

                    <button
                      type="button"
                      class="rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50"
                      (click)="clearFilters()"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              </section>

              <div
                *ngIf="catalogMessage"
                class="mb-4 rounded-[1.1rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
              >
                {{ catalogMessage }}
              </div>

              <div
                *ngIf="catalogError"
                class="mb-4 rounded-[1.1rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900"
              >
                {{ catalogError }}
              </div>

              <div *ngIf="loadingProducts" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div *ngFor="let _ of skeletonCards" class="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div class="aspect-square rounded-[1.2rem] bg-slate-200"></div>
                  <div class="mt-4 h-4 w-3/4 rounded-full bg-slate-200"></div>
                  <div class="mt-3 h-4 w-1/2 rounded-full bg-slate-200"></div>
                  <div class="mt-3 h-10 rounded-[1rem] bg-slate-200"></div>
                </div>
              </div>

              <ng-container *ngIf="!loadingProducts">
                <div *ngIf="filteredProducts.length === 0" class="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                  <h2 class="text-2xl font-black text-slate-900">No products found</h2>
                  <p class="mt-3 text-sm font-medium text-slate-500">
                    Try a different search or switch to another category.
                  </p>
                </div>

                <div *ngIf="filteredProducts.length > 0" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  <a
                    *ngFor="let product of filteredProducts; trackBy: trackByProductId"
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
              </ng-container>
            </main>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  user: any = null;
  searchQuery = '';
  loadingProducts = false;
  products: CustomerCatalogProduct[] = [];
  filteredProducts: CustomerCatalogProduct[] = [];
  searchSuggestions: ProductSuggestion[] = [];
  catalogCategories: CustomerLandingCategory[] = [];
  catalogCategoryTree: LandingCategoryNode[] = [];
  visibleCatalogCategories: LandingCategoryNode[] = [];
  expandedCategoryIds = new Set<string>();
  selectedCategorySlug = 'all';
  catalogMessage = '';
  catalogError = '';
  loadingCategories = false;
  loadingSuggestions = false;
  showSuggestions = false;
  selectedSort = 'featured';
  minPriceFilter = '';
  maxPriceFilter = '';
  inStockOnly = false;
  private suggestionDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private suggestionBlurHandle: ReturnType<typeof setTimeout> | null = null;
  readonly skeletonCards = Array.from({ length: 6 });

  constructor(
    private authService: AuthService,
    private catalogService: CatalogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });

    this.authService.getCurrentUser().subscribe({
      next: () => {},
      error: () => {
        this.authService.clearCurrentUser();
      }
    });

    this.loadCatalogProducts();
    this.loadLandingCategories();
  }

  ngOnDestroy(): void {
    if (this.suggestionDebounceHandle) {
      clearTimeout(this.suggestionDebounceHandle);
      this.suggestionDebounceHandle = null;
    }
    if (this.suggestionBlurHandle) {
      clearTimeout(this.suggestionBlurHandle);
      this.suggestionBlurHandle = null;
    }
  }

  isAdmin(): boolean {
    if (!this.user?.role) return false;
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((role: string) => role.toLowerCase() === 'admin');
    }
    return String(this.user.role).toLowerCase() === 'admin';
  }

  isCustomer(): boolean {
    return !!this.user && !this.isAdmin();
  }

  searchProducts(): void {
    this.showSuggestions = false;
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery = value;
    this.refreshFilteredProducts();

    if (this.suggestionDebounceHandle) {
      clearTimeout(this.suggestionDebounceHandle);
      this.suggestionDebounceHandle = null;
    }

    const query = value.trim();
    if (query.length < 2) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      this.loadingSuggestions = false;
      this.catalogError = '';
      this.catalogMessage = '';
      this.refreshCatalogMessage();
      return;
    }

    this.loadingSuggestions = true;
    this.suggestionDebounceHandle = setTimeout(() => {
      if (this.searchQuery.trim() !== query) {
        this.loadingSuggestions = false;
        return;
      }

      this.catalogService.getProductSuggestions(query, 8).subscribe({
        next: (response) => {
          this.loadingSuggestions = false;
          const rawSuggestions = Array.isArray(response?.data) ? response.data : [];
          this.searchSuggestions = rawSuggestions;
          this.showSuggestions = true;
        },
        error: () => {
          this.loadingSuggestions = false;
          this.searchSuggestions = [];
          this.showSuggestions = false;
        }
      });
    }, 180);
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim().length >= 2 && this.searchSuggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    if (this.suggestionBlurHandle) {
      clearTimeout(this.suggestionBlurHandle);
    }

    this.suggestionBlurHandle = setTimeout(() => {
      this.showSuggestions = false;
    }, 150);
  }

  selectSuggestion(suggestion: ProductSuggestion): void {
    this.searchQuery = suggestion.productName || '';
    this.showSuggestions = false;
    this.searchSuggestions = [];
    this.router.navigate(['/products', suggestion._id]);
  }

  onCategoryFilterChange(_: string): void {
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }

  onSortChange(_: string): void {
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }

  onPriceFilterChange(): void {
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }

  onInStockToggle(): void {
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }

  loadCatalogProducts(): void {
    this.loadingProducts = true;
    this.catalogError = '';
    this.catalogMessage = '';
    this.products = [];

    this.catalogService.getCatalogProducts().subscribe({
      next: (response) => {
        this.loadingProducts = false;
        const rawProducts = Array.isArray(response?.data) ? response.data : response?.data?.docs || [];
        this.products = rawProducts;
        this.refreshFilteredProducts();
        this.refreshCatalogMessage();
      },
      error: (error) => {
        this.loadingProducts = false;
        this.catalogError = error.error?.message || 'Unable to load the catalog right now.';
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
        if (
          this.selectedCategorySlug !== 'all' &&
          !this.catalogCategories.some((category) => this.normalizeCategoryKey(category.slug || category.name) === this.normalizeCategoryKey(this.selectedCategorySlug))
        ) {
          this.selectedCategorySlug = 'all';
        }
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
        this.catalogError = error.error?.message || 'Unable to load categories right now.';
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
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }

  handleCategoryClick(category: LandingCategoryNode): void {
    if (category.children.length > 0) {
      this.toggleCategoryExpansion(category);
      return;
    }

    this.selectCategory(category.slug);
  }

  displayProducts(): CustomerCatalogProduct[] {
    return this.filteredProducts;
  }

  totalProductCount(): number {
    return this.products.filter((product) => product.isActive).length;
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
    const selectedCategory = this.catalogCategories.find(
      (category) => this.normalizeCategoryKey(category.slug || category.name) === this.normalizeCategoryKey(this.selectedCategorySlug)
    );

    const query = this.searchQuery.trim();
    const filters = this.buildFilterSummary();

    if (query && filters) {
      return `Searching "${query}" with ${filters}.`;
    }

    if (query) {
      return `Showing results for "${query}".`;
    }

    if (filters) {
      return `Browsing products with ${filters}.`;
    }

    return selectedCategory?.name
      ? `Browsing ${selectedCategory.name}.`
      : 'Browse products by category, price, rating, or stock status.';
  }

  trackByCategoryId(_: number, category: CustomerLandingCategory): string {
    return category._id;
  }

  trackByProductId(_: number, product: CustomerCatalogProduct): string {
    return product._id;
  }

  trackBySuggestionId(_: number, suggestion: ProductSuggestion): string {
    return suggestion._id;
  }

  trackByCategorySlug(_: number, category: CustomerLandingCategoryGroup): string {
    return category.categorySlug || category.categoryName || '';
  }

  trackByVisibleCategoryId(_: number, category: LandingCategoryNode): string {
    return category._id;
  }

  private normalizeCategoryKey(value: string): string {
    return String(value || '').trim().toLowerCase();
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

  private countProductsForNode(node: LandingCategoryNode): number {
    const keys = new Set<string>();

    const collectKeys = (current: LandingCategoryNode): void => {
      keys.add(this.normalizeCategoryKey(current.slug || current.name));
      (current.children || []).forEach(collectKeys);
    };

    collectKeys(node);

    return this.products.filter((product) => {
      if (!product.isActive) {
        return false;
      }

      const categoryKey = this.normalizeCategoryKey(product.categoryDetails?.slug || product.categoryDetails?.name || '');
      return keys.has(categoryKey);
    }).length;
  }

  private refreshCatalogMessage(): void {
    const visibleCount = this.filteredProducts.length;
    const filters = this.buildFilterSummary();
    const query = this.searchQuery.trim();

    if (!this.products.length && !this.loadingProducts) {
      this.catalogMessage = 'No active products are available in the store yet.';
      return;
    }

    if (query && filters) {
      this.catalogMessage = `${visibleCount} product${visibleCount === 1 ? '' : 's'} match "${query}" and ${filters}.`;
      return;
    }

    if (query) {
      this.catalogMessage = `${visibleCount} product${visibleCount === 1 ? '' : 's'} found for "${query}".`;
      return;
    }

    if (filters) {
      this.catalogMessage = `${visibleCount} product${visibleCount === 1 ? '' : 's'} match ${filters}.`;
      return;
    }

    const selectedCategory = this.findCategoryNodeBySlug(this.selectedCategorySlug);
    if (this.selectedCategorySlug === 'all') {
      this.catalogMessage = `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'} across ${this.catalogCategories.length || 0} categories.`;
      return;
    }

    this.catalogMessage = selectedCategory?.name
      ? `Browsing ${selectedCategory.name} with ${visibleCount} product${visibleCount === 1 ? '' : 's'}.`
      : `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'}.`;
  }

  private refreshFilteredProducts(): void {
    const query = this.searchQuery.trim();
    const minPrice = this.parsePrice(this.minPriceFilter);
    const maxPrice = this.parsePrice(this.maxPriceFilter);

    const filtered = this.products.filter((product) => {
      if (!product.isActive) {
        return false;
      }

      if (!this.productMatchesSelectedCategory(product)) {
        return false;
      }

      if (query && !this.productMatchesQuery(product, query)) {
        return false;
      }

      if (this.inStockOnly && !this.isProductInStock(product)) {
        return false;
      }

      const price = this.productDisplayPrice(product);
      if (minPrice !== null && price < minPrice) {
        return false;
      }
      if (maxPrice !== null && price > maxPrice) {
        return false;
      }

      return true;
    });

    this.filteredProducts = this.sortProducts(filtered);
  }

  private sortProducts(products: CustomerCatalogProduct[]): CustomerCatalogProduct[] {
    const sorted = [...products];

    switch (this.selectedSort) {
      case 'rating-desc':
        sorted.sort((a, b) => this.compareNumber(b.averageRating, a.averageRating) || this.compareNumber(b.numberOfReviews, a.numberOfReviews) || this.compareDate(b.createdAt, a.createdAt));
        break;
      case 'price-asc':
        sorted.sort((a, b) => this.compareNumber(this.productDisplayPrice(a), this.productDisplayPrice(b)));
        break;
      case 'price-desc':
        sorted.sort((a, b) => this.compareNumber(this.productDisplayPrice(b), this.productDisplayPrice(a)));
        break;
      case 'newest':
        sorted.sort((a, b) => this.compareDate(b.createdAt, a.createdAt));
        break;
      default:
        sorted.sort((a, b) => this.compareNumber(b.averageRating, a.averageRating) || this.compareDate(b.createdAt, a.createdAt));
        break;
    }

    return sorted;
  }

  private compareNumber(a?: number, b?: number): number {
    return Number(a || 0) - Number(b || 0);
  }

  private compareDate(a?: string, b?: string): number {
    return new Date(String(a || 0)).getTime() - new Date(String(b || 0)).getTime();
  }

  private productDisplayPrice(product: CustomerCatalogProduct): number {
    return Number(product.displayVariant?.finalPrice || product.basePrice || 0);
  }

  private isProductInStock(product: CustomerCatalogProduct): boolean {
    return (product.variants || []).some((variant) => Number(variant.productStock || 0) > 0);
  }

  private productMatchesSelectedCategory(product: CustomerCatalogProduct): boolean {
    if (this.selectedCategorySlug === 'all') {
      return true;
    }

    const selectedNode = this.findCategoryNodeBySlug(this.selectedCategorySlug);
    if (selectedNode) {
      return this.productMatchesCategory(product, selectedNode);
    }

    const selectedKey = this.normalizeCategoryKey(this.selectedCategorySlug);
    const categoryKey = this.normalizeCategoryKey(product.categoryDetails?.slug || product.categoryDetails?.name || '');
    return categoryKey === selectedKey;
  }

  private productMatchesQuery(product: CustomerCatalogProduct, query: string): boolean {
    const normalizedQuery = this.normalizeCategoryKey(query);
    if (!normalizedQuery) {
      return true;
    }

    const searchable = [
      product.productName,
      product.productDescription,
      product.brand,
      product.categoryDetails?.name,
      product.categoryDetails?.slug,
      product.displayVariant?.sku
    ]
      .filter(Boolean)
      .map((value) => this.normalizeCategoryKey(String(value)))
      .join(' ');

    return searchable.includes(normalizedQuery);
  }

  private productMatchesCategory(product: CustomerCatalogProduct, node: LandingCategoryNode): boolean {
    const categoryKey = this.normalizeCategoryKey(product.categoryDetails?.slug || product.categoryDetails?.name || '');
    const nodeKey = this.normalizeCategoryKey(node.slug || node.name);

    if (categoryKey === nodeKey) {
      return true;
    }

    return (node.children || []).some((child) => this.productMatchesCategory(product, child));
  }

  private parsePrice(value: string): number | null {
    const cleaned = String(value || '').trim();
    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private buildFilterSummary(): string {
    const parts: string[] = [];

    if (this.selectedCategorySlug !== 'all') {
      const selectedCategory = this.catalogCategories.find(
        (category) => this.normalizeCategoryKey(category.slug || category.name) === this.normalizeCategoryKey(this.selectedCategorySlug)
      );
      parts.push(selectedCategory?.name || 'selected category');
    }

    if (this.inStockOnly) {
      parts.push('in-stock items only');
    }

    if (this.minPriceFilter || this.maxPriceFilter) {
      const rangeStart = this.minPriceFilter ? this.formatCurrency(Number(this.minPriceFilter)) : 'any';
      const rangeEnd = this.maxPriceFilter ? this.formatCurrency(Number(this.maxPriceFilter)) : 'any';
      parts.push(`prices between ${rangeStart} and ${rangeEnd}`);
    }

    if (this.selectedSort === 'rating-desc') {
      parts.push('highest rated first');
    } else if (this.selectedSort === 'price-asc') {
      parts.push('lowest price first');
    } else if (this.selectedSort === 'price-desc') {
      parts.push('highest price first');
    } else if (this.selectedSort === 'newest') {
      parts.push('newest first');
    }

    if (parts.length === 0) {
      return '';
    }

    if (parts.length === 1) {
      return parts[0];
    }

    const last = parts.pop();
    return `${parts.join(', ')} and ${last}`;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.searchSuggestions = [];
    this.showSuggestions = false;
    this.loadingSuggestions = false;
    this.selectedCategorySlug = 'all';
    this.selectedSort = 'featured';
    this.minPriceFilter = '';
    this.maxPriceFilter = '';
    this.inStockOnly = false;
    this.refreshFilteredProducts();
    this.refreshCatalogMessage();
  }
}
