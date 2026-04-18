import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ErrorService } from '../../core/services/error.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../../core/models/customer.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-72px)] bg-slate-50">
      <div class="w-full">
        <div
          class="relative min-h-[calc(80vh-50px)]"
          style="background-size: cover; background-position: center; background-repeat: no-repeat;"
        >
          <div
            class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out"
            [style.background-image]="'url(' + currentHeroSlide().image + ')'"
            [class.opacity-0]="heroIsTransitioning"
            [class.opacity-100]="!heroIsTransitioning"
          ></div>

          <div
            *ngIf="transitionHeroSlide"
            class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-500 ease-in-out"
            [class.opacity-100]="heroIsTransitioning"
            [style.background-image]="'url(' + transitionHeroSlide.image + ')'"
          ></div>

          <div class="absolute inset-0">
            <div class="mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8 lg:pb-10">
              <div class="flex flex-wrap items-center gap-3">
                <a
                  routerLink="/products"
                  class="inline-flex items-center justify-center rounded-full bg-[#3f2418] px-6 py-3 text-sm font-semibold tracking-[0.04em] text-white shadow-[0_14px_30px_rgba(63,36,24,0.25)] transition hover:-translate-y-0.5 hover:bg-[#2f1b14]"
                >
                  Shop Now
                </a>
                <a
                  href="#categories"
                  class="inline-flex items-center justify-center rounded-full border border-[#3f2418] bg-white/90 px-6 py-3 text-sm font-semibold tracking-[0.04em] text-[#3f2418] shadow-[0_12px_28px_rgba(63,36,24,0.12)] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  View Categories
                </a>

                <div class="ml-2 flex items-center gap-2 rounded-full bg-black/10 px-3 py-2 backdrop-blur-sm">
                  <button
                    *ngFor="let slide of heroSlides; let index = index; trackBy: trackByHeroSlide"
                    type="button"
                    class="h-2.5 rounded-full transition-all duration-300"
                    [class.w-10]="index === heroSlideIndex"
                    [class.w-2.5]="index !== heroSlideIndex"
                    [class.bg-white]="index === heroSlideIndex"
                    [class.bg-white/45]="index !== heroSlideIndex"
                    [attr.aria-label]="'Go to banner slide ' + (index + 1)"
                    (click)="setHeroSlide(index)"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div class="grid gap-3 rounded-[2rem] border border-[#eadcc9] bg-white px-4 py-4 shadow-[0_20px_60px_rgba(47,27,20,0.08)] sm:grid-cols-2 lg:grid-cols-4">
          <div *ngFor="let highlight of trustHighlights; trackBy: trackByHighlight" class="flex items-center gap-3 rounded-[1.35rem] bg-[#fff9f2] px-4 py-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6f4e37,#8b5e3c)] text-white shadow-[0_12px_24px_rgba(111,78,55,0.18)]">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path [attr.d]="highlight.icon"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-black tracking-tight text-slate-900">{{ highlight.title }}</p>
              <p class="text-xs font-medium text-slate-500">{{ highlight.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" class="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 scroll-mt-6">
        <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div class="px-4 pb-6 pt-8 sm:px-6 lg:px-8">
            <div>
              <div class="mb-4 text-center">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
                <h3 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Shop by category</h3>
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
                    <h4 class="truncate text-lg font-semibold text-slate-900">{{ category.name }}</h4>
                    <p class="text-sm font-medium text-slate-500">{{ categoryCount(category) }} item{{ categoryCount(category) === 1 ? '' : 's' }}</p>
                  </div>
                </a>
              </div>
            </div>

            <div class="mt-8">
              <div class="mb-4 text-center">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Products</p>
                <h3 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Best selling dry fruits</h3>
              </div>

              <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <article
                  *ngFor="let product of featuredProducts(); trackBy: trackByProductId"
                  role="link"
                  tabindex="0"
                  (click)="openProduct(product)"
                  (keydown.enter)="openProduct(product)"
                  (keydown.space)="$event.preventDefault(); openProduct(product)"
                  class="group relative rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                >
                  <button
                    type="button"
                    class="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-amber-300 hover:bg-white hover:text-rose-600"
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
                        <p class="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{{ product.brand || 'Premium Pack' }}</p>
                        <h4 class="mt-1 line-clamp-2 text-lg font-semibold text-slate-900">{{ product.productName }}</h4>
                      </div>
                      <span class="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-amber-200">
                        {{ formatCurrency(product.displayVariant?.finalPrice || product.basePrice || 0) }}
                      </span>
                    </div>

                    <p class="text-sm font-semibold text-slate-500">{{ product.categoryDetails?.name || 'Dry fruits & nuts' }}</p>
                  </div>
                </article>
              </div>

              <div class="mt-6 text-center">
                <a
                  routerLink="/products"
                  class="btn-primary inline-flex items-center justify-center !px-6 !py-3 text-sm tracking-[0.04em]"
                >
                  All Products
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section id="about" class="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 scroll-mt-6">
        <div class="rounded-[2rem] border border-[#eadcc9] bg-white px-4 py-8 shadow-[0_20px_60px_rgba(47,27,20,0.08)] sm:px-6 lg:px-8">
          <div class="text-center">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Customer reviews</p>
            <h3 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">What our customers say</h3>
            <p class="mt-3 text-sm font-medium text-slate-500">
              A quick look at the kind of feedback your shoppers could see on the home page.
            </p>
          </div>

          <div class="mt-8 overflow-hidden">
            <div class="flex w-max gap-5 animate-review-marquee hover:[animation-play-state:paused]">
              <article
                *ngFor="let review of marqueeReviews; trackBy: trackByHomeReview"
                class="w-[320px] flex-shrink-0 rounded-[1.6rem] border border-[#eadcc9] bg-[#fffaf5] p-5 shadow-[0_14px_34px_rgba(47,27,20,0.05)]"
              >
                <div class="flex items-start gap-4">
                  <img
                    [src]="review.image"
                    [alt]="review.name"
                    class="h-14 w-14 rounded-full border-2 border-[#eadcc9] object-cover shadow-sm"
                  />

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-base font-semibold text-slate-900">{{ review.name }}</p>
                        <p class="mt-1 truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#8b5e3c]">{{ review.product }}</p>
                      </div>
                      <div class="rounded-full bg-[#f5e6d3] px-3 py-1 text-xs font-semibold text-[#6f4e37]">
                        {{ review.rating }}/5
                      </div>
                    </div>

                    <p class="mt-4 text-sm font-medium leading-7 text-slate-600">
                      "{{ review.comment }}"
                    </p>

                    <div class="mt-5 flex items-center gap-1 text-[#d4a017]">
                      <span *ngFor="let _ of reviewStars(review.rating); trackBy: trackByStar" class="text-sm">★</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div class="overflow-hidden rounded-[2rem] border border-[#eadcc9] bg-white shadow-[0_20px_60px_rgba(47,27,20,0.08)]">
          <img
            src="/assets/banner%20-2%20.png"
            alt="Dry fruits banner"
            class="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section class="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div class="grid gap-6 overflow-hidden rounded-[2rem] border border-[#eadcc9] bg-white shadow-[0_24px_60px_rgba(47,27,20,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <div class="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">About Us</p>
            <h3 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">About Divya Dryfruit House</h3>
            <p class="mt-4 max-w-2xl text-sm font-medium leading-8 text-slate-500">
              We believe better wellness starts with what you bring home. Our focus is on premium dry fruits, spices, herbs, and fresh bakery items, all selected with care for quality, freshness, and family-friendly everyday use.
            </p>
            <p class="mt-3 max-w-2xl text-sm font-medium leading-8 text-slate-500">
              From almonds, cashews, and walnuts to traditional herbs and wholesome bakery treats, we aim to make one trusted place for taste, health, and convenience.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <span class="rounded-full bg-[#fff7ed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f4e37]">Fresh selection</span>
              <span class="rounded-full bg-[#fff7ed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f4e37]">Wide variety</span>
              <span class="rounded-full bg-[#fff7ed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f4e37]">Customer focused</span>
            </div>
          </div>

          <div class="grid gap-4 bg-[#fffaf5] px-6 py-8 sm:grid-cols-2 sm:px-8 lg:px-10">
            <div class="rounded-[1.5rem] border border-[#eadcc9] bg-white p-5 shadow-[0_12px_30px_rgba(47,27,20,0.05)]">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Quality first</p>
              <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                Carefully chosen products that support a healthy lifestyle and reliable everyday shopping.
              </p>
            </div>
            <div class="rounded-[1.5rem] border border-[#eadcc9] bg-white p-5 shadow-[0_12px_30px_rgba(47,27,20,0.05)]">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">One roof</p>
              <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                Dry fruits, spices, herbs, and bakery essentials brought together for simple, convenient buying.
              </p>
            </div>
            <div class="rounded-[1.5rem] border border-[#eadcc9] bg-white p-5 shadow-[0_12px_30px_rgba(47,27,20,0.05)] sm:col-span-2">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Trusted by customers</p>
              <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                Friendly service, fair pricing, and a focus on freshness help us build trust with every order.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  user: any = null;
  searchQuery = '';
  heroSlideIndex = 0;
  heroIsTransitioning = false;
  transitionHeroSlide: { eyebrow: string; title: string; subtitle: string; image: string } | null = null;
  private heroSlideTimer?: ReturnType<typeof setInterval>;
  loadingProducts = false;
  loadingCategories = false;
  products: CustomerCatalogProduct[] = [];
  wishlistedProductIds = new Set<string>();
  wishlistBusyId = '';
  landingCategories: CustomerLandingCategoryGroup[] = [];
  catalogCategories: CustomerLandingCategory[] = [];
  readonly heroSlides = [
    {
      eyebrow: 'Premium dry fruits',
      title: 'Fresh dry fruits for everyday health.',
      subtitle: 'Explore almonds, cashews, pistachios, raisins, dates, seeds, and healthy snack mixes curated for your family.',
      image: '/assets/banner-1.webp'
    },
    {
      eyebrow: 'Gift ready packs',
      title: 'Beautifully packed for gifting and sharing.',
      subtitle: 'Choose elegant collections that are ready for festivals, celebrations, and thoughtful gifting.',
      image: '/assets/banner-3.webp'
    },
    {
      eyebrow: 'Healthy snacking',
      title: 'Premium nuts and mixes for daily wellness.',
      subtitle: 'Discover clean, tasty, and wholesome dry fruit packs made for everyday enjoyment.',
      image: '/assets/banner-4.webp'
    }
  ];
  readonly homeReviews = [
    {
      name: 'Aarav Mehta',
      product: 'Mixed Dry Fruits Pack',
      rating: 5,
      comment: 'Fresh packing, great taste, and the almonds were excellent.',
      image: 'https://i.pravatar.cc/120?img=12'
    },
    {
      name: 'Neha Sharma',
      product: 'Premium Cashews',
      rating: 5,
      comment: 'Quality is very consistent and the delivery came on time.',
      image: 'https://i.pravatar.cc/120?img=32'
    },
    {
      name: 'Rahul Verma',
      product: 'Gift Box Collection',
      rating: 4,
      comment: 'Perfect for gifting. The packaging looked premium and neat.',
      image: 'https://i.pravatar.cc/120?img=45'
    },
    {
      name: 'Priya Nair',
      product: 'Pistachio Mix',
      rating: 5,
      comment: 'Very fresh stock and the flavor was much better than expected.',
      image: 'https://i.pravatar.cc/120?img=47'
    },
    {
      name: 'Karan Joshi',
      product: 'Roasted Nuts Combo',
      rating: 4,
      comment: 'Good value for money and the site made shopping simple.',
      image: 'https://i.pravatar.cc/120?img=56'
    },
    {
      name: 'Simran Kaur',
      product: 'Healthy Snack Pack',
      rating: 5,
      comment: 'Loved the variety. Will definitely order again for home use.',
      image: 'https://i.pravatar.cc/120?img=68'
    }
  ];
  readonly marqueeReviews = [...this.homeReviews, ...this.homeReviews];
  readonly trustHighlights = [
    {
      title: 'Fresh packing',
      description: 'Packed with care for better freshness.',
      icon: 'M5 13l4 4L19 7'
    },
    {
      title: 'Premium quality',
      description: 'Selected dry fruits and nuts only.',
      icon: 'M12 2l3 7h7l-5.5 4.1L18 20l-6-3.7L6 20l1.5-6.9L2 9h7l3-7z'
    },
    {
      title: 'Fast shipping',
      description: 'Quick dispatch on every order.',
      icon: 'M3 13h13M13 5l7 8-7 8'
    },
    {
      title: 'Secure checkout',
      description: 'Safe payment and order flow.',
      icon: 'M12 2l7 4v6c0 5-3.5 9.7-7 10-3.5-.3-7-5-7-10V6l7-4z'
    }
  ];

  constructor(
    private authService: AuthService,
    private catalogService: CatalogService,
    private errorService: ErrorService,
    private wishlistService: WishlistService,
    private router: Router
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
      error: () => this.authService.clearCurrentUser()
    });

    this.loadLandingProducts();
    this.loadLandingCategories();
    this.startHeroCarousel();
  }

  ngOnDestroy(): void {
    if (this.heroSlideTimer) {
      clearInterval(this.heroSlideTimer);
      this.heroSlideTimer = undefined;
    }
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

  currentHeroSlide(): { eyebrow: string; title: string; subtitle: string; image: string } {
    return this.heroSlides[this.heroSlideIndex] || this.heroSlides[0];
  }

  setHeroSlide(index: number): void {
    const total = this.heroSlides.length;
    if (!total) {
      return;
    }

    const normalized = ((index % total) + total) % total;
    if (normalized === this.heroSlideIndex || this.heroIsTransitioning) {
      return;
    }

    this.transitionToSlide(normalized);
  }

  private startHeroCarousel(): void {
    if (this.heroSlideTimer) {
      clearInterval(this.heroSlideTimer);
    }

    this.heroSlideTimer = setInterval(() => {
      this.setHeroSlide(this.heroSlideIndex + 1);
    }, 4200);
  }

  private transitionToSlide(nextIndex: number): void {
    const nextSlide = this.heroSlides[nextIndex];
    if (!nextSlide) {
      return;
    }

    this.transitionHeroSlide = nextSlide;
    this.heroIsTransitioning = true;

    window.setTimeout(() => {
      this.heroSlideIndex = nextIndex;
      this.heroIsTransitioning = false;
      this.transitionHeroSlide = null;
    }, 520);
  }

  featuredProducts(): CustomerCatalogProduct[] {
    return this.products.slice(0, 12);
  }

  openProduct(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    this.router.navigate(['/products', product._id]);
  }

  categoryImage(category: CustomerLandingCategory): string {
    return category.image || 'https://via.placeholder.com/160x160?text=Category';
  }

  categoryAccent(category: CustomerLandingCategory): { accent: string; border: string; background: string } {
    return {
      accent: '#6F4E37',
      border: '#E7DACF',
      background: 'linear-gradient(180deg, rgba(111,78,55,0.08), rgba(255,255,255,1))'
    };
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

  isWishlisted(product: CustomerCatalogProduct): boolean {
    return !!product?._id && this.wishlistedProductIds.has(product._id);
  }

  toggleWishlist(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    if (!this.isCustomer()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: this.router.url } });
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
          this.isWishlisted(product) ? 'Saved to wishlist.' : 'Removed from wishlist.',
          'success'
        );
      },
      error: (error) => {
        this.wishlistBusyId = '';
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
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

  trackByHighlight(_: number, highlight: { title: string; description: string }): string {
    return highlight.title;
  }

  trackByHeroSlide(_: number, slide: { image: string }): string {
    return slide.image;
  }

  trackByHomeReview(_: number, review: { name: string; product: string; rating: number; comment: string; image: string }): string {
    return `${review.name}-${review.product}`;
  }

  trackByStar(_: number, star: number): number {
    return star;
  }

  reviewStars(rating: number): number[] {
    return Array.from({ length: Math.max(0, Math.min(5, Number(rating) || 0)) }, (_, index) => index);
  }

  private normalizeCategoryKey(value: string): string {
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
