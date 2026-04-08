import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../../core/models/customer.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-72px)] bg-slate-50">
      <div class="w-full">
        <div
          class="relative min-h-[calc(100vh-72px)] overflow-hidden border-b border-slate-200 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
          [style.background-image]="'linear-gradient(90deg, rgba(12,17,36,0.72), rgba(12,17,36,0.34)), url(https://images.pexels.com/photos/3872425/pexels-photo-3872425.jpeg)'"
          style="background-size: cover; background-position: center; background-repeat: no-repeat;"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950/15 via-transparent to-slate-950/5"></div>

          <div class="absolute inset-0 flex items-center">
            <div class="relative mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
              <div class="grid w-full gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                <div class="max-w-2xl text-left">
                  <p class="text-[11px] font-black uppercase tracking-[0.34em] text-white/70">Premium dry fruits</p>
                  <h2 class="mt-3 max-w-2xl text-left text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Fresh dry fruits for everyday health.
                  </h2>
                  <p class="mt-4 max-w-xl text-left text-sm font-medium leading-7 text-white/82 sm:text-base">
                    Explore almonds, cashews, pistachios, raisins, dates, seeds, and healthy snack mixes curated for your family.
                  </p>

                  <form class="mt-7 w-full max-w-2xl" (ngSubmit)="goToProducts()">
                    <div class="flex items-center gap-3 rounded-full border border-white/20 bg-white/18 px-4 py-3 backdrop-blur-md">
                      <span class="text-white/75">
                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="7"></circle>
                          <path d="m20 20-3.5-3.5"></path>
                        </svg>
                      </span>
                      <input
                        name="searchQuery"
                        [(ngModel)]="searchQuery"
                        type="text"
                        placeholder="Search dry fruits, nuts and healthy mixes"
                        class="w-full border-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/60"
                      />
                      <button
                        type="submit"
                        class="shrink-0 rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-900 transition hover:-translate-y-0.5"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </div>

                <div class="grid gap-4 sm:grid-cols-2 lg:justify-self-end">
                  <div class="rounded-[1.4rem] border border-white/15 bg-white/12 p-5 backdrop-blur-md">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Dry fruit categories</p>
                    <p class="mt-3 text-3xl font-black text-white">{{ catalogCategories.length }}</p>
                  </div>
                  <div class="rounded-[1.4rem] border border-white/15 bg-white/12 p-5 backdrop-blur-md">
                    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-white/65">Featured items</p>
                    <p class="mt-3 text-3xl font-black text-white">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] mt-6">
          <div class="px-3 pb-6 pt-5 sm:px-4">
            <div class="mt-6">
              <div class="mb-4 text-center">
                <p class="text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">All categories</p>
                <h3 class="mt-1 text-2xl font-black tracking-tight text-slate-900">Shop dry fruits by type</h3>
              </div>

              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <a
                  *ngFor="let category of catalogCategories; trackBy: trackByCategoryId"
                  [routerLink]="['/products']"
                  [queryParams]="{ category: category.slug || category.name }"
                  class="group overflow-hidden rounded-[1.35rem] border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(47,27,20,0.08)]"
                  [style.border-color]="categoryAccent(category).border"
                >
                  <div class="h-1 w-full" [style.background-color]="categoryAccent(category).accent"></div>
                  <div class="aspect-[4/3] overflow-hidden" [style.background]="categoryAccent(category).background">
                    <img
                      [src]="categoryImage(category)"
                      [alt]="category.name"
                      class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div class="space-y-1 p-4">
                    <p class="inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white" [style.background-color]="categoryAccent(category).accent">
                      Dry fruit category
                    </p>
                    <h4 class="truncate text-lg font-black text-slate-900">{{ category.name }}</h4>
                    <p class="text-sm font-medium text-slate-500">{{ categoryCount(category) }} item{{ categoryCount(category) === 1 ? '' : 's' }}</p>
                  </div>
                </a>
              </div>
            </div>

            <div class="mt-8">
              <div class="mb-4 text-center">
                <p class="text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">Products</p>
                <h3 class="mt-1 text-2xl font-black tracking-tight text-slate-900">Best selling dry fruits</h3>
              </div>

              <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <a
                  *ngFor="let product of featuredProducts(); trackBy: trackByProductId"
                  [routerLink]="['/products', product._id]"
                  class="group rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                >
                  <div class="aspect-square overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-100">
                    <img
                      [src]="productImage(product)"
                      [alt]="product.productName"
                      class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div class="mt-4 space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{{ product.brand || 'Premium Pack' }}</p>
                        <h4 class="mt-1 line-clamp-2 text-lg font-black text-slate-900">{{ product.productName }}</h4>
                      </div>
                      <span class="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-slate-900 shadow-sm ring-1 ring-amber-200">
                        {{ formatCurrency(product.displayVariant?.finalPrice || product.basePrice || 0) }}
                      </span>
                    </div>

                    <p class="text-sm font-semibold text-slate-500">{{ product.categoryDetails?.name || 'Dry fruits & nuts' }}</p>
                  </div>
                </a>
              </div>

              <div class="mt-6 text-center">
                <a
                  routerLink="/products"
                  class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  All Products
                </a>
              </div>
            </div>
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
  loadingCategories = false;
  products: CustomerCatalogProduct[] = [];
  landingCategories: CustomerLandingCategoryGroup[] = [];
  catalogCategories: CustomerLandingCategory[] = [];

  constructor(
    private authService: AuthService,
    private catalogService: CatalogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });

    this.authService.ensureCurrentUser().subscribe({
      next: () => {},
      error: () => this.authService.clearCurrentUser()
    });

    this.loadLandingProducts();
    this.loadLandingCategories();
  }

  loadLandingProducts(): void {
    this.loadingProducts = true;
    this.products = [];
    this.landingCategories = [];

    this.catalogService.getLandingPageProducts().subscribe({
      next: (response) => {
        this.loadingProducts = false;
        this.landingCategories = Array.isArray(response?.data) ? response.data : [];
        this.products = this.flattenLandingProducts(this.landingCategories);
      },
      error: () => {
        this.loadingProducts = false;
        this.products = [];
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
        this.catalogCategories = [...this.catalogCategories].sort((a, b) => {
          const levelDiff = Number(a.level || 0) - Number(b.level || 0);
          if (levelDiff !== 0) return levelDiff;
          return String(a.name || '').localeCompare(String(b.name || ''));
        });
      },
      error: () => {
        this.loadingCategories = false;
        this.catalogCategories = [];
      }
    });
  }

  goToProducts(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      this.router.navigate(['/products']);
      return;
    }

    this.router.navigate(['/products'], { queryParams: { q: query } });
  }

  featuredProducts(): CustomerCatalogProduct[] {
    return this.products.slice(0, 12);
  }

  categoryImage(category: CustomerLandingCategory): string {
    return category.image || 'https://via.placeholder.com/160x160?text=Category';
  }

  categoryAccent(category: CustomerLandingCategory): { accent: string; border: string; background: string } {
    const key = this.normalizeCategoryKey(category.slug || category.name);
    const palette: Record<string, { accent: string; border: string; background: string }> = {
      almonds: { accent: '#C68642', border: '#E7CBA8', background: 'linear-gradient(180deg, rgba(198,134,66,0.08), rgba(255,255,255,1))' },
      cashews: { accent: '#E6C79C', border: '#EADFCF', background: 'linear-gradient(180deg, rgba(230,199,156,0.15), rgba(255,255,255,1))' },
      pistachio: { accent: '#A3B18A', border: '#DCE4D3', background: 'linear-gradient(180deg, rgba(163,177,138,0.12), rgba(255,255,255,1))' },
      walnuts: { accent: '#8D6E63', border: '#DCCFC8', background: 'linear-gradient(180deg, rgba(141,110,99,0.12), rgba(255,255,255,1))' },
      raisins: { accent: '#6D4C41', border: '#D7C7C1', background: 'linear-gradient(180deg, rgba(109,76,65,0.12), rgba(255,255,255,1))' },
      dates: { accent: '#D4A017', border: '#F1DC9C', background: 'linear-gradient(180deg, rgba(212,160,23,0.12), rgba(255,255,255,1))' },
      default: { accent: '#6F4E37', border: '#E7DACF', background: 'linear-gradient(180deg, rgba(111,78,55,0.08), rgba(255,255,255,1))' }
    };

    const matched = Object.keys(palette).find((name) => key.includes(name));
    return palette[matched || 'default'];
  }

  categoryCount(category: CustomerLandingCategory): number {
    const key = this.normalizeCategoryKey(category.slug || category.name);
    const landingGroup = this.landingCategories.find(
      (group) => this.normalizeCategoryKey(group.categorySlug || group.categoryName || '') === key
    );

    return landingGroup?.products?.length || 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  productImage(product: CustomerCatalogProduct): string {
    return product.displayVariant?.variantImage || product.mainImages?.[0] || 'https://via.placeholder.com/640x480?text=Product';
  }

  trackByCategoryId(_: number, category: CustomerLandingCategory): string {
    return category._id;
  }

  trackByProductId(_: number, product: CustomerCatalogProduct): string {
    return product._id;
  }

  private normalizeCategoryKey(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private flattenLandingProducts(groups: CustomerLandingCategoryGroup[]): CustomerCatalogProduct[] {
    const catalogProducts: CustomerCatalogProduct[] = [];

    groups.forEach((group) => {
      (group.products || []).forEach((product) => {
        catalogProducts.push({
          ...product,
          catalogCategorySlug: group.categorySlug || product.categoryDetails?.slug || '',
          catalogCategoryName: group.categoryName || product.categoryDetails?.name || ''
        });
      });
    });

    return catalogProducts;
  }
}
