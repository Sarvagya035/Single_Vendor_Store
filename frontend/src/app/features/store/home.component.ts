import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartActionService } from '../../core/services/cart-action.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ErrorService } from '../../core/services/error.service';
import { GuestDataService } from '../../core/services/guest-data.service';
import { StoreProductVariantService } from '../../core/services/store-product-variant.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../../core/models/customer.models';
import { VariantModalAddToCartEvent, VariantModalComponent } from './variant-modal/variant-modal.component';
import { ProductCardComponent, ProductCardVariantActionEvent } from './components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VariantModalComponent, ProductCardComponent],
  template: `
    <div class="min-h-[calc(100vh-72px)] bg-slate-50">
      <section class="w-full bg-white">
        <div class="relative min-h-[520px] overflow-hidden bg-[#fff3e8] sm:min-h-[calc(80vh-50px)]">
          <div class="absolute inset-0">
            <div
              *ngFor="let slide of heroSlides; let index = index; trackBy: trackByHeroSlide"
              [ngClass]="heroSlideTransitionClasses(index)"
              class="absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <picture class="block h-full w-full bg-[#fff3e8]">
                <source [attr.media]="'(max-width: 767px)'" [attr.srcset]="slide.mobileImage" />
                <img
                  [src]="slide.image"
                  [alt]="slide.title"
                  loading="eager"
                  decoding="async"
                  class="h-full w-full object-contain md:object-cover"
                />
              </picture>
            </div>
          </div>

          <div class="absolute inset-0 z-20">
            <div class="mx-auto flex h-full w-full max-w-[1480px] items-end px-0 pb-6 sm:px-6 lg:px-8 lg:pb-10">
              <div class="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                <a
                  routerLink="/products"
                  class="inline-flex w-full items-center justify-center rounded-full bg-[#3f2418] px-6 py-3 text-sm font-semibold tracking-[0.04em] text-white shadow-[0_14px_30px_rgba(63,36,24,0.25)] transition hover:-translate-y-0.5 hover:bg-[#2f1b14] sm:w-auto"
                >
                  Shop Now
                </a>
                <a
                  href="#categories"
                  class="inline-flex w-full items-center justify-center rounded-full border border-[#3f2418] bg-white/90 px-6 py-3 text-sm font-semibold tracking-[0.04em] text-[#3f2418] shadow-[0_12px_28px_rgba(63,36,24,0.12)] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                >
                  View Categories
                </a>

                <div class="mx-auto flex items-center gap-2 rounded-full bg-black/10 px-3 py-2 backdrop-blur-sm sm:mx-0 sm:ml-2">
                  <button
                    *ngFor="let slide of heroSlides; let index = index; trackBy: trackByHeroSlide"
                    type="button"
                    class="h-2.5 rounded-full transition-[width,background-color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
      </section>

      <!--
      <section class="storefront-section w-full bg-slate-50 pt-8">
        <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>
      -->

      <section id="categories" class="storefront-section w-full bg-[#fff3e8] py-10 sm:py-12 lg:py-14 scroll-mt-6">
        <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div class="mb-4 text-center">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
            <h3 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Shop by category</h3>
          </div>

          <div class="relative mt-2">
            <button
              type="button"
              class="absolute left-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-1/2 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-white disabled:text-slate-300 sm:left-3 sm:h-11 sm:w-11"
              [class.opacity-0]="!categoryCanScrollPrev"
              [class.pointer-events-none]="!categoryCanScrollPrev"
              [attr.aria-hidden]="!categoryCanScrollPrev"
              [disabled]="!categoryCanScrollPrev"
              aria-label="Previous categories"
              (click)="scrollCategories('prev')"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>

            <div
              #categoryCarousel
              class="category-carousel-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-8 pb-4 pt-1 sm:gap-5 sm:px-10 lg:gap-6"
              (scroll)="updateCategoryCarouselState()"
            >
              <a
                *ngFor="let category of catalogCategories; trackBy: trackByCategoryId"
                [routerLink]="['/products']"
                [queryParams]="{ category: category.slug || category.name }"
                class="group relative w-[min(220px,42vw)] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(47,27,20,0.08)] sm:w-[min(240px,30vw)] lg:w-[220px] xl:w-[240px]"
                [style.border-color]="categoryAccent(category).border"
              >
                <div class="absolute right-3 top-3 z-10 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-orange-700 ring-1 ring-orange-200">
                  {{ categoryCount(category) }} item{{ categoryCount(category) === 1 ? '' : 's' }}
                </div>
                <div class="h-1 w-full" [style.background-color]="categoryAccent(category).accent"></div>
                <div class="aspect-[4/3] overflow-hidden" [style.background]="categoryAccent(category).background">
                  <img
                    [src]="categoryImage(category)"
                    [alt]="category.name"
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div class="space-y-1 p-2 md:p-3">
                  <h4 class="truncate text-sm font-semibold leading-5 text-slate-900 sm:text-base lg:text-base">{{ category.name }}</h4>
                </div>
              </a>
            </div>

            <button
              type="button"
              class="absolute right-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-1/2 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-white disabled:text-slate-300 sm:right-3 sm:h-11 sm:w-11"
              [class.opacity-0]="!categoryCanScrollNext"
              [class.pointer-events-none]="!categoryCanScrollNext"
              [attr.aria-hidden]="!categoryCanScrollNext"
              [disabled]="!categoryCanScrollNext"
              aria-label="Next categories"
              (click)="scrollCategories('next')"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section class="storefront-section w-full bg-white py-10 sm:py-12 lg:py-14 scroll-mt-6">
        <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div class="mb-4 text-center">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Products</p>
            <h3 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">Best selling dry fruits</h3>
          </div>

          <div class="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
            <app-product-card
              *ngFor="let product of featuredProducts(); trackBy: trackByProductId"
              [product]="product"
              [isWishlisted]="isWishlisted(product)"
              [wishlistBusy]="wishlistBusyId === product._id"
              [variantCount]="(product.variants || []).length"
              [isOutOfStock]="isProductOutOfStock(product)"
              (productClick)="openProduct($event)"
              (wishlistToggle)="toggleWishlist($event)"
              (addToCart)="handleProductCardAddToCart($event)"
              (buyNow)="handleProductCardBuyNow($event)"
            />
          </div>

          <div class="mt-6 text-center">
            <a
              routerLink="/products"
              class="btn-primary inline-flex items-center justify-center !px-6 !py-3 text-sm tracking-[0.04em]"
            >
              All Products
            </a>
          </div>

          <app-variant-modal
            [open]="variantModalOpen"
            [product]="selectedVariantProduct"
            [isAdding]="variantModalLoading"
            (close)="closeVariantModal()"
            (addToCart)="handleVariantModalAddToCart($event)"
          />
        </div>
      </section>

      <section id="about" class="storefront-section w-full bg-[#fff3e8] py-10 sm:py-12 lg:py-14 scroll-mt-6">
        <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div class="group rounded-[2rem] border border-[#eadcc9] bg-white px-4 py-8 shadow-[0_20px_60px_rgba(47,27,20,0.08)] sm:px-6 lg:px-8">
          <div class="text-center">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Customer reviews</p>
            <h3 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">What our customers say</h3>
            <p class="mt-3 text-sm font-medium text-slate-500">
              A quick look at the kind of feedback your shoppers could see on the home page.
            </p>
          </div>

          <div class="mt-8 overflow-hidden">
            <div class="review-marquee-pause flex w-max gap-5 animate-review-marquee">
                <article
                  *ngFor="let review of marqueeReviews; trackBy: trackByHomeReview"
                  class="w-[min(320px,78vw)] flex-shrink-0 rounded-[1.6rem] border border-[#eadcc9] bg-[#fffaf5] p-5 shadow-[0_14px_34px_rgba(47,27,20,0.05)]"
                >
                <div class="flex items-start gap-4">
                  <img
                    [src]="review.image"
                    [alt]="review.name"
                    loading="lazy"
                    decoding="async"
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
        </div>
      </section>

      <section class="storefront-section w-full bg-white py-10 sm:py-12 lg:py-14">
  <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(47,27,20,0.08)]">
      <div class="overflow-hidden rounded-[1.5rem] bg-slate-100">
        <picture class="block w-full bg-[#fff3e8]">
          <source media="(max-width: 767px)" srcset="/assets/mobile-bluk.jpg.jpeg" />
          <img
            src="/assets/n%20bulk.png"
            alt="Bulk showcase"
            loading="lazy"
            decoding="async"
            class="h-auto w-full object-contain sm:object-cover"
          />
        </picture>
      </div>

      <!-- Button aligned under text -->
      <div class="absolute left-[9%] top-[64%] flex sm:left-[15%] sm:top-[64%]">
        <a
          routerLink="/contact"
          class="inline-flex items-center justify-center rounded-full bg-[#fff4e6] px-3 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm font-semibold text-[#6f4e37] shadow-[0_14px_30px_rgba(47,27,20,0.12)] ring-1 ring-[#eadcc9] transition hover:-translate-y-0.5 hover:bg-[#fff0dc] sm:px-5 sm:py-3 sm:text-sm"
        >
          Contact Us
        </a>
      </div>

    </div>
  </div>
</section>

      <section class="storefront-section w-full bg-[#fff3e8] py-10 sm:py-12 lg:py-14">
        <div class="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('categoryCarousel') categoryCarousel?: ElementRef<HTMLDivElement>;

  user: any = null;
  searchQuery = '';
  heroSlideIndex = 0;
  heroIsTransitioning = false;
  heroTransitionFromIndex = -1;
  heroTransitionToIndex = -1;
  private heroSlideTimer?: ReturnType<typeof setInterval>;
  private heroTransitionTimer?: ReturnType<typeof setTimeout>;
  loadingProducts = false;
  fadeMode = true;
  loadingCategories = false;
  products: CustomerCatalogProduct[] = [];
  featuredProductLimit = 12;
  wishlistedProductIds = new Set<string>();
  wishlistBusyId = '';
  categoryCanScrollPrev = false;
  categoryCanScrollNext = false;
  variantModalOpen = false;
  variantModalLoading = false;
  selectedVariantProduct: CustomerCatalogProduct | null = null;
  landingCategories: CustomerLandingCategoryGroup[] = [];
  catalogCategories: CustomerLandingCategory[] = [];
  readonly heroSlides = [
    {
      eyebrow: 'Premium dry fruits',
      title: 'Fresh dry fruits for everyday health.',
      subtitle: 'Explore almonds, cashews, pistachios, raisins, dates, seeds, and healthy snack mixes curated for your family.',
      image: '/assets/BEST.png',
      mobileImage: '/assets/mobile-banner-1.jpg.jpeg'
    },
    {
      eyebrow: 'New arrival',
      title: 'Explore our fresh banner showcase.',
      subtitle: 'A new banner highlight added to the landing page carousel.',
      image: '/assets/banner-test.png',
      mobileImage: '/assets/mobile-banner-2.jpg.jpeg'
    },
    {
      eyebrow: 'Featured banner',
      title: 'Discover our new seasonal banner.',
      subtitle: 'Meet the latest hero image now rotating through the landing page slider.',
      image: '/assets/new-one.png',
      mobileImage: '/assets/mobile-banner-3.jpg.jpeg'
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
    private cartActionService: CartActionService,
    private cartService: CartService,
    private catalogService: CatalogService,
    private errorService: ErrorService,
    private guestDataService: GuestDataService,
    private variantService: StoreProductVariantService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (this.isCustomer()) {
        this.loadWishlistState();
      } else {
        this.loadGuestWishlistState();
      }
    });

    this.authService.ensureCurrentUser().subscribe({
      next: () => {},
      error: () => this.authService.clearCurrentUser()
    });

    this.preloadHeroSlides();
    this.updateFeaturedProductLimit();
    this.loadLandingProducts();
    this.loadLandingCategories();
    this.startHeroCarousel();
  }

  ngAfterViewInit(): void {
    this.updateCategoryCarouselState();
  }

  ngOnDestroy(): void {
    if (this.heroSlideTimer) {
      clearInterval(this.heroSlideTimer);
      this.heroSlideTimer = undefined;
    }

    if (this.heroTransitionTimer) {
      clearTimeout(this.heroTransitionTimer);
      this.heroTransitionTimer = undefined;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateCategoryCarouselState();
    this.updateFeaturedProductLimit();
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
        this.scheduleCategoryCarouselStateUpdate();
      },
      error: () => {
        this.loadingCategories = false;
        this.catalogCategories = [];
        this.scheduleCategoryCarouselStateUpdate();
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

  heroSlideTransitionClasses(index: number): string {
    const base = 'absolute inset-0 bg-cover bg-center bg-no-repeat';
    const inactive = `${base} opacity-0 z-0 pointer-events-none transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]`;

    if (this.heroIsTransitioning) {
      if (index === this.heroTransitionToIndex) {
        return `${base} opacity-100 z-10 pointer-events-auto transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]`;
      }

      if (index === this.heroTransitionFromIndex) {
        return `${base} opacity-0 z-0 pointer-events-none transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]`;
      }
    }

    if (index === this.heroSlideIndex) {
      return `${base} opacity-100 z-10 pointer-events-auto transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]`;
    }

    return inactive;
  }

  isHeroSlideVisible(index: number): boolean {
    if (!this.heroSlides.length) {
      return false;
    }

    if (this.heroIsTransitioning) {
      return index === this.heroTransitionFromIndex || index === this.heroTransitionToIndex;
    }

    return index === this.heroSlideIndex;
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
    }, 5200);
  }

  private transitionToSlide(nextIndex: number): void {
    const nextSlide = this.heroSlides[nextIndex];
    if (!nextSlide) {
      return;
    }

    if (this.heroTransitionTimer) {
      clearTimeout(this.heroTransitionTimer);
      this.heroTransitionTimer = undefined;
    }

    this.heroTransitionFromIndex = this.heroSlideIndex;
    this.heroTransitionToIndex = nextIndex;
    this.heroIsTransitioning = true;

    this.heroTransitionTimer = window.setTimeout(() => {
      this.heroSlideIndex = nextIndex;
      this.heroIsTransitioning = false;
      this.heroTransitionFromIndex = -1;
      this.heroTransitionToIndex = -1;
      this.heroTransitionTimer = undefined;
    }, 1000);
  }

  private preloadHeroSlides(): void {
    this.heroSlides.forEach((slide) => {
      if (!slide?.image) {
        return;
      }

      const img = new Image();
      img.src = slide.image;

      if (slide.mobileImage) {
        const mobileImg = new Image();
        mobileImg.src = slide.mobileImage;
      }
    });
  }

  featuredProducts(): CustomerCatalogProduct[] {
    return this.products.slice(0, this.featuredProductLimit);
  }

  private updateFeaturedProductLimit(): void {
    this.featuredProductLimit = window.innerWidth >= 1280 ? 15 : 12;
  }

  openProduct(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    this.router.navigate(['/products', product._id]);
  }

  handleProductCardAddToCart(event: ProductCardVariantActionEvent): void {
    const productId = String(event?.product?._id || '').trim();
    const variantId = String(event?.variant?._id || '').trim();

    if (!productId || !variantId) {
      this.errorService.showToast('Please choose a valid variant.', 'error');
      return;
    }

    this.cartActionService.addToCart(productId, variantId, 1).subscribe({
      next: (result) => {
        if (result.success) {
          this.errorService.showToast(result.message, 'success');
          return;
        }

        this.errorService.showToast(result.message, 'error');
      },
      error: () => {
        this.errorService.showToast('Unable to add this item to the cart right now.', 'error');
      }
    });
  }

  handleProductCardBuyNow(event: ProductCardVariantActionEvent): void {
    const productId = String(event?.product?._id || '').trim();
    const variantId = String(event?.variant?._id || '').trim();

    if (!productId || !variantId) {
      this.errorService.showToast('Please choose a valid variant.', 'error');
      return;
    }

    if (!this.isCustomer()) {
      this.router.navigate(['/login'], {
        queryParams: {
          redirectTo: this.router.url
        }
      });
      return;
    }

    this.cartService.addToCart(productId, variantId, 1).subscribe({
      next: () => {
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to start checkout right now.',
          'error'
        );
      }
    });
  }

  onProductCardAction(product: CustomerCatalogProduct): void {
    if (!product?._id || this.isProductOutOfStock(product)) {
      return;
    }

    if (this.hasSingleVariant(product)) {
      this.addSingleVariantToCart(product);
      return;
    }

    this.openVariantModal(product);
  }

  openVariantModal(product: CustomerCatalogProduct): void {
    if (!product?._id || this.isProductOutOfStock(product)) {
      return;
    }

    this.selectedVariantProduct = product;
    this.variantModalOpen = true;
  }

  closeVariantModal(): void {
    this.variantModalOpen = false;
    this.selectedVariantProduct = null;
    this.variantModalLoading = false;
  }

  handleVariantModalAddToCart(event: VariantModalAddToCartEvent): void {
    this.variantModalLoading = true;
    this.cartActionService.addToCart(event.productId, event.variantId, event.quantity).subscribe({
      next: (result) => {
        this.variantModalLoading = false;

        if (result.success) {
          this.errorService.showToast(result.message, 'success');
          this.closeVariantModal();
          return;
        }

        this.errorService.showToast(result.message, 'error');
      },
      error: () => {
        this.variantModalLoading = false;
        this.errorService.showToast('Unable to add this item to the cart right now.', 'error');
      }
    });
  }

  categoryImage(category: CustomerLandingCategory): string {
    return category.image || 'https://via.placeholder.com/160x160?text=Category';
  }

  scrollCategories(direction: 'prev' | 'next'): void {
    const carousel = this.categoryCarousel?.nativeElement;
    if (!carousel) {
      return;
    }

    const distance = Math.max(240, Math.round(carousel.clientWidth * 0.82));
    carousel.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth'
    });

    window.setTimeout(() => this.updateCategoryCarouselState(), 300);
  }

  updateCategoryCarouselState(): void {
    const carousel = this.categoryCarousel?.nativeElement;
    if (!carousel) {
      this.categoryCanScrollPrev = false;
      this.categoryCanScrollNext = false;
      return;
    }

    const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    this.categoryCanScrollPrev = carousel.scrollLeft > 2;
    this.categoryCanScrollNext = carousel.scrollLeft < maxScrollLeft - 2;
  }

  private scheduleCategoryCarouselStateUpdate(): void {
    window.requestAnimationFrame(() => this.updateCategoryCarouselState());
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
      this.toggleGuestWishlist(product);
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
    return this.variantService.getProductImage(product, product.displayVariant || null);
  }

  isProductOutOfStock(product: CustomerCatalogProduct): boolean {
    return this.variantService.isProductOutOfStock(product);
  }

  hasSingleVariant(product: CustomerCatalogProduct): boolean {
    return this.variantService.hasSingleVariant(product);
  }

  productCardActionLabel(product: CustomerCatalogProduct): string {
    if (this.isProductOutOfStock(product)) {
      return 'Unavailable';
    }

    return this.hasSingleVariant(product) ? 'Add To Cart' : 'Select Options';
  }

  private addSingleVariantToCart(product: CustomerCatalogProduct): void {
    const variant = this.variantService.getDefaultVariant(product);
    if (!product?._id || !variant?._id) {
      return;
    }

    this.variantModalLoading = true;
    this.cartActionService.addToCart(product._id, variant._id, 1).subscribe({
      next: (result) => {
        this.variantModalLoading = false;

        if (result.success) {
          this.errorService.showToast(result.message, 'success');
          return;
        }

        this.errorService.showToast(result.message, 'error');
      },
      error: () => {
        this.variantModalLoading = false;
        this.errorService.showToast('Unable to add this item to the cart right now.', 'error');
      }
    });
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

  private loadGuestWishlistState(): void {
    this.syncWishlistSet(this.guestDataService.getGuestWishlist());
  }

  private syncWishlistSet(products: Array<{ _id?: string; productId?: string }>): void {
    this.wishlistedProductIds = new Set(
      (products || [])
        .map((item) => item?._id || item?.productId)
        .filter((id): id is string => !!id)
    );
  }

  private toggleGuestWishlist(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    const isCurrentlyWishlisted = this.wishlistedProductIds.has(product._id);

    if (isCurrentlyWishlisted) {
      this.guestDataService.removeFromGuestWishlist(product._id);
      this.errorService.showToast('Removed from guest wishlist.', 'success');
    } else {
      this.guestDataService.addToGuestWishlist(product);
      this.errorService.showToast('Saved to guest wishlist.', 'success');
    }

    this.loadGuestWishlistState();
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
