import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ErrorService } from '../../core/services/error.service';
import { ReviewService } from '../../core/services/review.service';
import { WishlistService } from '../../core/services/wishlist.service';
import {
  CustomerCatalogProduct,
  CustomerCatalogVariant,
  CustomerLandingCategoryGroup,
  CustomerWishlistProduct
} from '../../core/models/customer.models';
import { ProductReview, ProductReviewForm, ProductReviewStat } from '../../core/models/review.models';
import { ProductGalleryComponent } from './product-gallery/product-gallery.component';
import { ProductPurchasePanelComponent } from './product-purchase-panel/product-purchase-panel.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductGalleryComponent, ProductPurchasePanelComponent],
  template: `
    <div class="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(111,78,55,0.12),transparent_24%),#fff9f2]">
      <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <a routerLink="/products" class="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-slate-900">
          <span>&larr;</span>
          Back to products
        </a>

        <div *ngIf="loading" class="mt-8 text-sm font-semibold text-slate-500">Loading product...</div>

        <div *ngIf="successMessage" class="mt-8 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {{ successMessage }}
        </div>

        <ng-container *ngIf="product && !loading">
          <div class="mt-8 rounded-[2rem] border border-[#eadcc9] bg-white/90 p-3 shadow-[0_24px_60px_rgba(47,27,20,0.08)] sm:p-6 lg:p-7">
            <div class="grid gap-6 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:gap-8">
              <app-product-gallery
                [productName]="product.productName"
                [activeImage]="activeImage()"
                [selectedImage]="selectedImage"
                [images]="galleryImages()"
                (imageSelected)="selectedImage = $event"
              />

              <app-product-purchase-panel
                [product]="product"
                [variants]="product.variants || []"
                [selectedVariant]="selectedVariant()"
                [selectedVariantId]="selectedVariantId"
                [priceLabel]="formatCurrency(selectedVariant()?.finalPrice || product.basePrice || 0)"
                [originalPriceLabel]="originalPriceLabel()"
                [discountedPriceLabel]="discountedPriceLabel()"
                [quantity]="quantity"
                [isAdding]="isAdding"
                [isBuying]="isBuying"
                [isWishlisted]="isWishlisted"
                [isWishlistBusy]="isWishlistBusy"
                [variantLabels]="variantLabels()"
                [attributes]="attributeEntries(selectedVariant()?.attributes)"
                (variantChanged)="onVariantChange($event)"
                (quantityChanged)="setQuantity($event)"
                (addToCart)="addToCart()"
                (buyNow)="buyNow()"
                (toggleWishlist)="toggleWishlist()"
              />
            </div>
          </div>

          <section class="mt-10 rounded-[2rem] border border-[#e7dac9] bg-white p-6 shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
            <div class="flex flex-col gap-2 border-b border-[#f1e4d4] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Similar products</p>
                <h2 class="mt-2 text-2xl font-extrabold text-slate-900">You may also like</h2>
              </div>
              <p class="text-sm font-medium text-slate-500">
                Handpicked from the same dry fruit family and flavor profile.
              </p>
            </div>

            <div *ngIf="visibleRelatedProducts().length; else noRelatedProducts" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <article
                *ngFor="let related of visibleRelatedProducts(); trackBy: trackByProductId"
                role="link"
                tabindex="0"
                (click)="openProduct(related)"
                (keydown.enter)="openProduct(related)"
                (keydown.space)="$event.preventDefault(); openProduct(related)"
                class="group relative rounded-[1.6rem] border border-[#e7dac9] bg-[#fff7ed]/50 p-3 shadow-[0_16px_40px_rgba(111,78,55,0.05)] transition hover:-translate-y-1 hover:border-[#d4a017] hover:bg-white hover:shadow-[0_24px_60px_rgba(111,78,55,0.1)] sm:p-4"
              >
                <button
                  type="button"
                  class="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-amber-300 hover:bg-white hover:text-rose-600 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
                  [disabled]="wishlistBusyId === related._id"
                  [attr.aria-label]="isWishlistedProduct(related) ? 'Remove from wishlist' : 'Save to wishlist'"
                  (click)="$event.stopPropagation(); toggleRelatedWishlist(related)"
                  [ngClass]="isWishlistedProduct(related) ? 'border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_14px_28px_rgba(244,63,94,0.24)] ring-rose-100' : ''"
                >
                  <svg *ngIf="wishlistBusyId !== related._id && !isWishlistedProduct(related)" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
                  </svg>
                  <svg *ngIf="wishlistBusyId !== related._id && isWishlistedProduct(related)" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
                  </svg>
                  <span *ngIf="wishlistBusyId === related._id" class="text-[10px] font-black uppercase tracking-[0.18em]">...</span>
                </button>

                <div class="aspect-square overflow-hidden rounded-[1.25rem] border border-[#e7dac9] bg-white">
                  <img
                    [src]="productImage(related)"
                    [alt]="related.productName"
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div class="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">
                        {{ related.brand || 'Dry fruit pack' }}
                      </p>
                      <h3 class="mt-1 line-clamp-2 text-[11px] font-extrabold text-slate-900 sm:text-lg">
                        {{ related.productName }}
                      </h3>
                    </div>
                    <span class="shrink-0 rounded-full bg-[#f5e6d3] px-2 py-0.5 text-[10px] font-extrabold text-[#6f4e37] shadow-sm ring-1 ring-[#e7dac9] sm:px-3 sm:py-1 sm:text-xs">
                      {{ formatCurrency(related.displayVariant?.finalPrice || related.basePrice || 0) }}
                    </span>
                  </div>

                  <p class="text-[10px] font-semibold text-slate-500 sm:text-sm">
                    {{ related.categoryDetails?.name || 'Dry fruits & nuts' }}
                  </p>
                </div>
              </article>
            </div>
            <ng-template #noRelatedProducts>
              <div class="mt-6 rounded-[1.4rem] border border-dashed border-[#e7dac9] bg-[#fff7ed] px-6 py-10 text-center">
                <h3 class="text-xl font-extrabold text-slate-900">More dry fruits coming soon</h3>
                <p class="mt-3 text-sm font-medium text-slate-500">
                  We’re still building out similar item suggestions for this product.
                </p>
              </div>
            </ng-template>
          </section>

          <section class="mt-10 rounded-[2rem] border border-[#e7dac9] bg-white p-6 shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
            <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Ratings & Reviews</p>
                <h2 class="mt-2 text-2xl font-extrabold text-slate-900">Customer Reviews</h2>
              </div>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-[#f08a00] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(240,138,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e07d00]"
                [attr.aria-expanded]="showReviewForm"
                (click)="toggleReviewForm()"
              >
                {{ showReviewForm ? 'Hide Review Form' : 'Write a Review' }}
              </button>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-[170px_1fr]">
              <div class="rounded-[1.75rem] border border-[#f1e4d4] bg-[#fffaf0] px-5 py-6 text-center lg:text-left">
                <p class="text-4xl font-extrabold leading-none text-[#d97706] sm:text-5xl">{{ formatRating(product.averageRating || 0) }}</p>
                <div class="mt-2 flex items-center gap-1 text-amber-400">
                  <span
                    *ngFor="let star of reviewStarSlots; trackBy: trackByNumber"
                    class="text-sm"
                    [class.text-amber-400]="isStarFilled(product.averageRating || 0, star)"
                    [class.text-slate-300]="!isStarFilled(product.averageRating || 0, star)"
                  >
                    ★
                  </span>
                </div>
                <p class="mt-2 text-sm font-medium text-slate-500">{{ reviewTotalCount() }} reviews</p>
              </div>

              <div class="space-y-3 pt-1">
                <div *ngFor="let row of ratingBreakdown()" class="grid grid-cols-[44px_minmax(0,1fr)_28px] items-center gap-2 sm:grid-cols-[52px_1fr_32px] sm:gap-3">
                  <p class="text-sm font-medium text-slate-600">{{ row.star }} star</p>
                  <div class="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div class="h-full rounded-full bg-amber-400 transition-all" [style.width.%]="row.percentage"></div>
                  </div>
                  <p class="text-right text-sm font-medium text-slate-500">{{ row.count }}</p>
                </div>
              </div>
            </div>

            <div class="mt-8 space-y-6">
              <article
                *ngFor="let review of reviews; trackBy: trackByReview"
                class="border-t border-[#f1e4d4] pt-6 first:border-t-0 first:pt-0"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div class="flex items-center gap-1 text-amber-400">
                      <span
                        *ngFor="let star of reviewStarSlots; trackBy: trackByNumber"
                        class="text-sm"
                        [class.text-amber-400]="isStarFilled(review.rating || 0, star)"
                        [class.text-slate-300]="!isStarFilled(review.rating || 0, star)"
                      >
                        ★
                      </span>
                    </div>
                    <p class="mt-2 text-base font-semibold text-slate-900">{{ review.title || 'Customer review' }}</p>
                    <p class="mt-1 text-sm text-slate-600">by {{ reviewAuthor(review) }}</p>
                  </div>
                  <p class="text-xs font-medium text-slate-500">{{ formatDate(review.updatedAt || review.createdAt) }}</p>
                </div>

                <p class="mt-3 text-sm leading-7 text-slate-700">{{ review.commentBody || 'No review text provided.' }}</p>

                <div *ngIf="review.reviewImages?.length" class="mt-4 flex flex-wrap gap-3">
                  <a
                    *ngFor="let image of review.reviewImages"
                    [href]="image"
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-2 rounded-full border border-[#e7dac9] bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#d4a017] hover:text-slate-900"
                  >
                    <span class="h-2 w-2 rounded-full bg-[#d4a017]"></span>
                    View image
                  </a>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <button type="button" class="transition hover:text-slate-900">Helpful</button>
                  <span *ngIf="isOwnReview(review)" class="text-slate-300">|</span>
                  <button
                    *ngIf="isOwnReview(review)"
                    type="button"
                    class="rounded-full border border-[#e7dac9] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700 transition hover:border-[#d4a017] hover:text-slate-900"
                    (click)="editReview(review)"
                  >
                    Edit Review
                  </button>
                </div>
              </article>

              <div *ngIf="!reviews.length" class="rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-[#fff7ed] px-6 py-10 text-center">
                <h3 class="text-xl font-extrabold text-slate-900">No reviews yet</h3>
                <p class="mt-3 text-sm font-medium text-slate-500">Be the first customer to share feedback for this product.</p>
              </div>
            </div>
          </section>

          <section *ngIf="showReviewForm" #reviewFormSection class="mt-10 rounded-[2rem] border border-[#e7dac9] bg-white p-6 shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
            <ng-container *ngIf="isCustomer(); else guestReviewPrompt">
              <div class="border-b border-[#f1e4d4] pb-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Write A Review</p>
                    <h2 class="mt-2 text-2xl font-extrabold text-slate-900">Share your experience</h2>
                    <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                      Reviews are allowed only after this product has been delivered to you.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    (click)="toggleReviewForm()"
                  >
                    Hide
                  </button>
                </div>
              </div>

              <form class="mt-6 space-y-4" (ngSubmit)="submitReview()">
                <div *ngIf="isEditingReview" class="rounded-2xl border border-amber-100 bg-[#fff7ed] px-4 py-3">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Edit mode</p>
                      <p class="mt-1 text-sm font-semibold text-slate-700">You are updating your existing review.</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700 transition hover:border-amber-300 hover:text-amber-800"
                      (click)="cancelReviewEdit()"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <label class="block">
                  <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Rating</span>
                  <select
                    [(ngModel)]="reviewForm.rating"
                    name="rating"
                    class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  >
                    <option *ngFor="let star of ratingOptions" [ngValue]="star">{{ star }} / 5</option>
                  </select>
                </label>

                <label class="block">
                  <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Title</span>
                  <input
                    [(ngModel)]="reviewForm.title"
                    name="title"
                    type="text"
                    maxlength="120"
                    class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    placeholder="Summarize your experience"
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Review</span>
                  <textarea
                    [(ngModel)]="reviewForm.commentBody"
                    name="commentBody"
                    rows="5"
                    class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    placeholder="What stood out? Quality, packaging, delivery, value..."
                  ></textarea>
                </label>

                <label class="block">
                  <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Review images</span>
                  <input
                    #reviewImagesInput
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    (change)="onReviewImagesSelected($event)"
                    class="mt-2 w-full cursor-pointer rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                  />
                  <p class="mt-2 text-xs font-semibold text-slate-500">
                    Upload up to 5 images. JPG, PNG, and WEBP only.
                  </p>
                  <div *ngIf="reviewImageFiles.length" class="mt-3 flex flex-wrap gap-2">
                    <span
                      *ngFor="let file of reviewImageFiles; trackBy: trackByReviewFile"
                      class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {{ file.name }}
                    </span>
                  </div>
                  <div *ngIf="reviewForm.reviewImages?.length" class="mt-3 flex flex-wrap gap-2">
                    <span
                      *ngFor="let image of reviewForm.reviewImages"
                      class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Existing image
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  [disabled]="isSubmittingReview || !product"
                  class="btn-primary w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {{ isSubmittingReview ? 'Saving Review...' : (isEditingReview ? 'Update Review' : 'Submit Review') }}
                </button>
              </form>
            </ng-container>

            <ng-template #guestReviewPrompt>
              <div class="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-[#fffaf5] px-6 py-10 text-center">
                <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Review access</p>
                <h2 class="mt-2 text-2xl font-extrabold text-slate-900">Sign in to leave a review</h2>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                  Guest visitors can read product details and reviews, but only signed-in customers can write one.
                </p>
                <a routerLink="/login" class="btn-primary mt-6 inline-flex !px-6 !py-3">Go To Login</a>
              </div>
            </ng-template>
          </section>
        </ng-container>
      </section>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  user: any = null;
  product: CustomerCatalogProduct | null = null;
  relatedProducts: CustomerCatalogProduct[] = [];
  wishlistedProductIds = new Set<string>();
  loading = false;
  successMessage = '';
  isMobileViewport = false;
  selectedVariantId = '';
  selectedImage = '';
  quantity = 1;
  isAdding = false;
  isBuying = false;
  isWishlisted = false;
  wishlistBusyId = '';
  isWishlistBusy = false;
  reviews: ProductReview[] = [];
  reviewStats: ProductReviewStat[] = [];
  isSubmittingReview = false;
  isEditingReview = false;
  reviewImageFiles: File[] = [];
  ratingOptions = [5, 4, 3, 2, 1];
  reviewStarSlots = [1, 2, 3, 4, 5];
  showReviewForm = false;
  reviewForm: ProductReviewForm = {
    productId: '',
    title: '',
    commentBody: '',
    rating: 5,
    reviewImages: []
  };
  @ViewChild('reviewImagesInput') reviewImagesInput?: ElementRef<HTMLInputElement>;
  @ViewChild('reviewFormSection') reviewFormSection?: ElementRef<HTMLElement>;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private catalogService: CatalogService,
    private errorService: ErrorService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateViewportState();

    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (this.isCustomer()) {
        this.loadWishlistState();
      } else {
        this.wishlistedProductIds = new Set<string>();
        this.isWishlisted = false;
      }
      if (this.product?._id) {
        this.syncWishlistState(this.product._id);
      }
    });

    this.authService.getCurrentUser().subscribe({
      next: () => {},
      error: () => this.authService.clearCurrentUser()
    });

    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');
      if (!productId) {
        this.errorService.showToast('Product not found.', 'error');
        return;
      }

      this.loadProduct(productId);
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

  loadProduct(productId: string, preserveBlankReviewForm = false): void {
    this.loading = true;

    forkJoin({
      productResponse: this.catalogService.getProductDetails(productId),
      catalogProducts: this.catalogService.getCatalogProducts(1, 1000),
      landingProducts: this.catalogService.getLandingPageProducts(),
      reviews: this.reviewService.getProductReviews(productId),
      reviewStats: this.reviewService.getReviewStats(productId),
      wishlist: this.isCustomer() ? this.wishlistService.getWishlist() : of(null)
    }).subscribe({
      next: ({ productResponse, catalogProducts, landingProducts, reviews, reviewStats, wishlist }) => {
        this.loading = false;
        this.product = productResponse?.data || null;
        this.reviews = reviews;
        this.reviewStats = reviewStats;
        this.relatedProducts = this.product
          ? this.findSimilarProducts(
              this.product,
              Array.isArray(catalogProducts?.data?.docs)
                ? catalogProducts.data.docs
                : Array.isArray(catalogProducts?.data)
                  ? catalogProducts.data
                  : [],
              Array.isArray(landingProducts?.data)
                ? landingProducts.data
                : []
            )
          : [];

        const initialVariant = this.product?.displayVariant || this.product?.variants?.[0];
        this.selectedVariantId = initialVariant?._id || '';
        this.selectedImage = this.activeImage();
        this.syncWishlistState(this.product?._id, wishlist);
        this.resetReviewForm();
      },
      error: (error) => {
        this.loading = false;
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to load the product right now.',
          'error'
        );
      }
    });
  }

  @HostListener('window:resize')
  handleResize(): void {
    this.updateViewportState();
  }

  selectedVariant(): CustomerCatalogVariant | undefined {
    return (
      this.product?.variants?.find((variant) => variant._id === this.selectedVariantId) ||
      this.product?.displayVariant ||
      this.product?.variants?.[0]
    );
  }

  onVariantChange(variantId: string): void {
    this.selectedVariantId = variantId;
    this.selectedImage = this.activeImage();
  }

  galleryImages(): string[] {
    const images = [
      ...(this.product?.mainImages || []),
      ...((this.product?.variants || []).map((variant) => variant.variantImage).filter(Boolean) as string[])
    ];

    return [...new Set(images)];
  }

  productImage(product: CustomerCatalogProduct): string {
    return (
      product.displayVariant?.variantImage ||
      product.mainImages?.[0] ||
      'https://via.placeholder.com/640x480?text=Product'
    );
  }

  openProduct(product: CustomerCatalogProduct): void {
    if (!product?._id) {
      return;
    }

    this.router.navigate(['/products', product._id]);
  }

  activeImage(): string {
    return (
      this.selectedImage ||
      this.selectedVariant()?.variantImage ||
      this.product?.mainImages?.[0] ||
      'https://via.placeholder.com/800x600?text=Product'
    );
  }

  setQuantity(value: number | string): void {
    this.quantity = Math.max(1, Number(value) || 1);
  }

  changeQuantity(delta: number): void {
    this.setQuantity(this.quantity + delta);
  }

  addToCart(): void {
    const variant = this.selectedVariant();
    if (!this.product?._id || !variant?._id) {
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

    this.isAdding = true;
    this.successMessage = '';

    this.cartService.addToCart(this.product._id, variant._id, this.quantity).subscribe({
      next: (response) => {
        this.isAdding = false;
        this.successMessage = response?.message || 'Item added to cart.';
        this.quantity = 1;
      },
      error: (error) => {
        this.isAdding = false;
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to add this item to the cart right now.',
          'error'
        );
      }
    });
  }

  buyNow(): void {
    const variant = this.selectedVariant();
    if (!this.product?._id || !variant?._id) {
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

    this.isBuying = true;
    this.successMessage = '';

    this.cartService.addToCart(this.product._id, variant._id, this.quantity).subscribe({
      next: () => {
        this.isBuying = false;
        this.quantity = 1;
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        this.isBuying = false;
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to start checkout right now.',
          'error'
        );
      }
    });
  }

  toggleWishlist(): void {
    if (!this.product?._id) {
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

    this.isWishlistBusy = true;
    this.wishlistService.toggleWishlist(this.product._id).subscribe({
      next: (wishlist) => {
        this.isWishlistBusy = false;
        this.syncWishlistState(this.product?._id, wishlist);
        this.errorService.showToast(
          this.isWishlisted ? 'Saved to wishlist.' : 'Removed from wishlist.',
          'success'
        );
      },
      error: (error) => {
        this.isWishlistBusy = false;
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to update wishlist right now.',
          'error'
        );
      }
    });
  }

  toggleRelatedWishlist(product: CustomerCatalogProduct): void {
    if (!product?._id) {
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

    if (this.wishlistBusyId === product._id) {
      return;
    }

    this.wishlistBusyId = product._id;
    this.wishlistService.toggleWishlist(product._id).subscribe({
      next: (wishlist) => {
        this.wishlistBusyId = '';
        this.syncWishlistSet(wishlist?.products || []);
        this.errorService.showToast(
          this.isWishlistedProduct(product) ? 'Saved to wishlist.' : 'Removed from wishlist.',
          'success'
        );
      },
      error: () => {
        this.wishlistBusyId = '';
        this.errorService.showToast('Unable to update wishlist right now.', 'error');
      }
    });
  }

  isWishlistedProduct(product: CustomerCatalogProduct): boolean {
    return !!product?._id && this.wishlistedProductIds.has(product._id);
  }

  variantLabel(variant?: CustomerCatalogVariant): string {
    if (!variant) {
      return 'Variant';
    }

    const attributes = this.attributeEntries(variant.attributes).map(
      (entry) => `${entry.key}: ${entry.value}`
    );

    return attributes.length ? attributes.join(' | ') : variant.sku || 'Variant';
  }

  variantLabels(): Record<string, string> {
    return (this.product?.variants || []).reduce((labels, variant) => {
      if (variant._id) {
        labels[variant._id] = `${this.variantLabel(variant)} - ${this.formatCurrency(variant.finalPrice || variant.productPrice || 0)}`;
      }
      return labels;
    }, {} as Record<string, string>);
  }

  attributeEntries(attributes?: Record<string, string>): Array<{ key: string; value: string }> {
    return Object.entries(attributes || {}).map(([key, value]) => ({ key, value }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  originalPriceLabel(): string {
    const variant = this.selectedVariant();
    if (!this.product) {
      return '';
    }

    const original = variant?.productPrice || this.product.basePrice || 0;
    const discounted = variant?.finalPrice || this.product.basePrice || 0;

    if (!original || original === discounted) {
      return '';
    }

    return this.formatCurrency(original);
  }

  discountedPriceLabel(): string {
    if (!this.product) {
      return '';
    }

    return this.formatCurrency(this.selectedVariant()?.finalPrice || this.product.basePrice || 0);
  }

  get existingReview(): ProductReview | null {
    if (!this.user?._id) {
      return null;
    }

    return this.reviews.find((review) => review.user?._id === this.user._id) || null;
  }

  reviewAuthor(review: ProductReview): string {
    return review.user?.username || review.user?.email || 'Customer';
  }

  reviewCountForStar(star: number): number {
    return this.reviewStats.find((entry) => entry._id === star)?.count || 0;
  }

  reviewTotalCount(): number {
    const statsTotal = this.reviewStats.reduce((sum, entry) => sum + (entry.count || 0), 0);
    return statsTotal || this.reviews.length || this.product?.numberOfReviews || 0;
  }

  ratingBreakdown(): Array<{ star: number; count: number; percentage: number }> {
    const total = this.reviewTotalCount() || 1;

    return [5, 4, 3, 2, 1].map((star) => {
      const count = this.reviewCountForStar(star);
      return {
        star,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
  }

  isStarFilled(rating: number, star: number): boolean {
    return star <= Math.round(Number(rating || 0));
  }

  trackByNumber(_: number, value: number): number {
    return value;
  }

  formatRating(value: number): string {
    return Number(value || 0).toFixed(1);
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  scrollToReviewForm(): void {
    this.showReviewForm = true;
    setTimeout(() => {
      this.reviewFormSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      setTimeout(() => {
        this.reviewFormSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  submitReview(): void {
    if (!this.product?._id) {
      return;
    }

    const payload: ProductReviewForm = {
      productId: this.product._id,
      title: this.reviewForm.title.trim(),
      commentBody: this.reviewForm.commentBody.trim(),
      rating: Number(this.reviewForm.rating),
      reviewImages: []
    };

    if (!payload.title || !payload.commentBody || !payload.rating) {
      this.errorService.showToast('Rating, title, and review text are required.', 'error');
      this.successMessage = '';
      return;
    }

    this.isSubmittingReview = true;
    this.successMessage = '';

    const formData = new FormData();
    formData.append('productId', payload.productId);
    formData.append('title', payload.title);
    formData.append('commentBody', payload.commentBody);
    formData.append('rating', String(payload.rating));

    if (this.reviewImageFiles.length > 0) {
      this.reviewImageFiles.forEach((file) => {
        formData.append('reviewImages', file);
      });
    } else if (this.reviewForm.reviewImages?.length) {
      formData.append('reviewImages', JSON.stringify(this.reviewForm.reviewImages));
    }

    this.reviewService.addOrUpdateReview(formData).subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.successMessage = this.isEditingReview ? 'Review updated successfully.' : 'Review submitted successfully.';
        this.resetReviewForm();
        this.showReviewForm = false;
        this.errorService.showToast('Review submitted and form cleared.', 'success');
        if (this.product?._id) {
          this.loadProduct(this.product._id, true);
        }
      },
      error: () => {
        this.isSubmittingReview = false;
        this.errorService.showToast('Unable to save your review right now.', 'error');
      }
    });
  }

  trackByReview(index: number, review: ProductReview): string {
    return review._id || String(index);
  }

  isOwnReview(review: ProductReview): boolean {
    return !!this.user?._id && review.user?._id === this.user._id;
  }

  trackByReviewFile(_: number, file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  trackByProductId(_: number, product: CustomerCatalogProduct): string {
    return product._id;
  }

  visibleRelatedProducts(): CustomerCatalogProduct[] {
    return this.isMobileViewport ? this.relatedProducts.slice(0, 3) : this.relatedProducts;
  }

  onReviewImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.reviewImageFiles = files.slice(0, 5);
  }

  private updateViewportState(): void {
    this.isMobileViewport = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  }

  editReview(review: ProductReview): void {
    this.isEditingReview = true;
    this.successMessage = '';
    this.showReviewForm = true;
    this.reviewForm = {
      productId: this.product?._id || '',
      title: review.title || '',
      commentBody: review.commentBody || '',
      rating: Number(review.rating || 5),
      reviewImages: review.reviewImages || []
    };
    this.reviewImageFiles = [];
    if (this.reviewImagesInput?.nativeElement) {
      this.reviewImagesInput.nativeElement.value = '';
    }

    setTimeout(() => {
      this.reviewFormSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  cancelReviewEdit(): void {
    this.resetReviewForm();
    this.successMessage = '';
    this.errorService.showToast('Edit cancelled.', 'success');
  }

  private syncReviewForm(): void {
    const review = this.existingReview;

    this.reviewForm = {
      productId: this.product?._id || '',
      title: review?.title || '',
      commentBody: review?.commentBody || '',
      rating: Number(review?.rating || 5),
      reviewImages: review?.reviewImages || []
    };
    this.reviewImageFiles = [];
  }

  private resetReviewForm(): void {
    this.isEditingReview = false;
    this.reviewForm = {
      productId: this.product?._id || '',
      title: '',
      commentBody: '',
      rating: 5,
      reviewImages: []
    };
    this.reviewImageFiles = [];
    if (this.reviewImagesInput?.nativeElement) {
      this.reviewImagesInput.nativeElement.value = '';
    }
  }

  private syncWishlistState(productId?: string, wishlist?: { products?: CustomerWishlistProduct[] } | null): void {
    if (!productId || !this.isCustomer()) {
      this.isWishlisted = false;
      return;
    }

    if (wishlist !== undefined && wishlist !== null) {
      const wishlistProducts = Array.isArray(wishlist.products) ? wishlist.products : [];
      this.syncWishlistSet(wishlistProducts);
      this.isWishlisted = this.wishlistedProductIds.has(productId);
      return;
    }

    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        const wishlistProducts = Array.isArray(response?.products) ? response.products : [];
        this.syncWishlistSet(wishlistProducts);
        this.isWishlisted = this.wishlistedProductIds.has(productId);
      },
      error: () => {
        this.isWishlisted = false;
      }
    });
  }

  private loadWishlistState(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.syncWishlistSet(wishlist?.products || []);
        if (this.product?._id) {
          this.isWishlisted = this.wishlistedProductIds.has(this.product._id);
        }
      },
      error: () => {
        this.wishlistedProductIds = new Set<string>();
        this.isWishlisted = false;
      }
    });
  }

  private syncWishlistSet(products: CustomerWishlistProduct[]): void {
    this.wishlistedProductIds = new Set(
      (products || [])
        .map((item) => item?._id)
        .filter((id): id is string => !!id)
    );
  }

  private findSimilarProducts(
    currentProduct: CustomerCatalogProduct,
    catalogProducts: CustomerCatalogProduct[],
    groups: CustomerLandingCategoryGroup[]
  ): CustomerCatalogProduct[] {
    const landingProducts = this.flattenLandingProducts(groups);
    const combinedProducts = [...catalogProducts, ...landingProducts];
    const uniqueProducts = Array.from(
      new Map(
        combinedProducts
          .filter((product) => product?._id && product._id !== currentProduct._id)
          .map((product) => [product._id, product] as const)
      ).values()
    );
    const allProducts = uniqueProducts;
    const currentCategoryKey = this.normalizeKey(
      currentProduct.catalogCategorySlug || currentProduct.categoryDetails?.slug || currentProduct.categoryDetails?.name || ''
    );
    const currentBrandKey = this.normalizeKey(currentProduct.brand || '');

    const scoredProducts = allProducts
      .map((product) => {
        let score = 0;
        const productCategoryKey = this.normalizeKey(
          product.catalogCategorySlug || product.categoryDetails?.slug || product.categoryDetails?.name || ''
        );
        const productBrandKey = this.normalizeKey(product.brand || '');

        if (currentCategoryKey && productCategoryKey === currentCategoryKey) {
          score += 3;
        }

        if (currentBrandKey && productBrandKey === currentBrandKey) {
          score += 2;
        }

        if (
          currentProduct.categoryDetails?.name &&
          product.categoryDetails?.name &&
          this.normalizeKey(product.categoryDetails.name) === this.normalizeKey(currentProduct.categoryDetails.name)
        ) {
          score += 1;
        }

        return { product, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);

    const fallbackProducts = allProducts.slice(0, 4);
    const selectedProducts = scoredProducts.length ? scoredProducts : fallbackProducts;

    return selectedProducts.slice(0, 4);
  }

  private flattenLandingProducts(groups: CustomerLandingCategoryGroup[]): CustomerCatalogProduct[] {
    const products: CustomerCatalogProduct[] = [];

    groups.forEach((group) => {
      (group.products || []).forEach((product) => {
        products.push({
          ...product,
          catalogCategorySlug: group.categorySlug || product.categoryDetails?.slug || '',
          catalogCategoryName: group.categoryName || product.categoryDetails?.name || ''
        });
      });
    });

    return products;
  }

  private normalizeKey(value: string): string {
    return String(value || '').trim().toLowerCase();
  }
}

