import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ErrorService } from '../../core/services/error.service';
import { ReviewService } from '../../core/services/review.service';
import {
  CustomerCatalogProduct,
  CustomerCatalogVariant,
  CustomerLandingCategoryGroup
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
          <div class="mt-8 rounded-[2rem] border border-[#eadcc9] bg-white/90 p-4 shadow-[0_24px_60px_rgba(47,27,20,0.08)] sm:p-6 lg:p-7">
            <div class="grid gap-8 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
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
              [variantLabels]="variantLabels()"
              [attributes]="attributeEntries(selectedVariant()?.attributes)"
              (variantChanged)="onVariantChange($event)"
              (quantityChanged)="setQuantity($event)"
              (addToCart)="addToCart()"
              (buyNow)="buyNow()"
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

            <div *ngIf="relatedProducts.length; else noRelatedProducts" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <a
                *ngFor="let related of relatedProducts; trackBy: trackByProductId"
                [routerLink]="['/products', related._id]"
                class="group rounded-[1.6rem] border border-[#e7dac9] bg-[#fff7ed]/50 p-4 shadow-[0_16px_40px_rgba(111,78,55,0.05)] transition hover:-translate-y-1 hover:border-[#d4a017] hover:bg-white hover:shadow-[0_24px_60px_rgba(111,78,55,0.1)]"
              >
                <div class="aspect-square overflow-hidden rounded-[1.25rem] border border-[#e7dac9] bg-white">
                  <img
                    [src]="productImage(related)"
                    [alt]="related.productName"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div class="mt-4 space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                        {{ related.brand || 'Dry fruit pack' }}
                      </p>
                      <h3 class="mt-1 line-clamp-2 text-lg font-extrabold text-slate-900">
                        {{ related.productName }}
                      </h3>
                    </div>
                    <span class="shrink-0 rounded-full bg-[#f5e6d3] px-3 py-1 text-xs font-extrabold text-[#6f4e37] shadow-sm ring-1 ring-[#e7dac9]">
                      {{ formatCurrency(related.displayVariant?.finalPrice || related.basePrice || 0) }}
                    </span>
                  </div>

                  <p class="text-sm font-semibold text-slate-500">
                    {{ related.categoryDetails?.name || 'Dry fruits & nuts' }}
                  </p>
                </div>
              </a>
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

          <section class="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-[2rem] border border-[#e7dac9] bg-white p-6 shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
              <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Ratings & Reviews</p>
                  <h2 class="mt-2 text-2xl font-extrabold text-slate-900">What customers are saying</h2>
                </div>
                <div class="rounded-[1.5rem] border border-amber-100 bg-[#fff7ed] px-4 py-3 text-right">
                  <p class="text-3xl font-extrabold text-slate-900">{{ formatRating(product.averageRating || 0) }}</p>
                  <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">{{ product.numberOfReviews || 0 }} reviews</p>
                </div>
              </div>

              <div class="mt-5 grid gap-3">
                <div *ngFor="let row of ratingBreakdown()" class="flex items-center gap-4">
                  <p class="w-12 text-sm font-extrabold text-slate-700">{{ row.star }} star</p>
                  <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-amber-400 transition-all" [style.width.%]="row.percentage"></div>
                  </div>
                  <p class="w-12 text-right text-sm font-bold text-slate-500">{{ row.count }}</p>
                </div>
              </div>

              <div class="mt-8 space-y-4">
                <article
                  *ngFor="let review of reviews; trackBy: trackByReview"
                  class="rounded-[1.75rem] border border-[#e7dac9] bg-gradient-to-br from-white to-[#fff7ed]/80 p-5 shadow-[0_10px_30px_rgba(111,78,55,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(111,78,55,0.07)]"
                >
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div class="flex flex-wrap items-center gap-3">
                        <p class="text-base font-extrabold text-slate-900">{{ review.title || 'Customer review' }}</p>
                        <span class="rounded-full bg-[#f5e6d3] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#6f4e37]">
                          {{ formatRating(review.rating || 0) }}/5
                        </span>
                      </div>
                      <p class="mt-2 text-sm font-semibold text-slate-600">{{ reviewAuthor(review) }}</p>
                    </div>
                    <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{{ formatDate(review.updatedAt || review.createdAt) }}</p>
                  </div>

                  <p class="mt-4 text-sm leading-7 text-slate-600">{{ review.commentBody || 'No review text provided.' }}</p>

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

                  <div *ngIf="isOwnReview(review)" class="mt-5 flex items-center gap-3">
                    <button
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
            </div>

            <aside #reviewFormSection class="rounded-[2rem] border border-[#e7dac9] bg-white p-6 shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
              <ng-container *ngIf="isCustomer(); else guestReviewPrompt">
                <div class="border-b border-[#f1e4d4] pb-5">
                  <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Write A Review</p>
                  <h2 class="mt-2 text-2xl font-extrabold text-slate-900">Share your experience</h2>
                  <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                    Reviews are allowed only after this product has been delivered to you.
                  </p>
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
                <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Review access</p>
                <h2 class="mt-2 text-2xl font-extrabold text-slate-900">Sign in to leave a review</h2>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                  Guest visitors can read product details and reviews, but only signed-in customers can write one.
                </p>
                <a routerLink="/login" class="btn-primary mt-6 inline-flex !px-6 !py-3">Go To Login</a>
              </ng-template>
            </aside>
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
  loading = false;
  successMessage = '';
  selectedVariantId = '';
  selectedImage = '';
  quantity = 1;
  isAdding = false;
  isBuying = false;
  reviews: ProductReview[] = [];
  reviewStats: ProductReviewStat[] = [];
  isSubmittingReview = false;
  isEditingReview = false;
  reviewImageFiles: File[] = [];
  ratingOptions = [5, 4, 3, 2, 1];
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
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
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
      reviewStats: this.reviewService.getReviewStats(productId)
    }).subscribe({
      next: ({ productResponse, catalogProducts, landingProducts, reviews, reviewStats }) => {
        this.loading = false;
        this.product = productResponse?.data || null;
        this.reviews = reviews;
        this.reviewStats = reviewStats;
        this.relatedProducts = this.product
          ? this.findSimilarProducts(this.product, catalogProducts?.data || [], landingProducts?.data || [])
          : [];

        const initialVariant = this.product?.displayVariant || this.product?.variants?.[0];
        this.selectedVariantId = initialVariant?._id || '';
        this.selectedImage = this.activeImage();
        this.resetReviewForm();
      },
      error: (error) => {
        this.loading = false;
      }
    });
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
      error: () => {
        this.isBuying = false;
      }
    });
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

  ratingBreakdown(): Array<{ star: number; count: number; percentage: number }> {
    const total = this.reviews.length || 1;

    return [5, 4, 3, 2, 1].map((star) => {
      const count = this.reviewCountForStar(star);
      return {
        star,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
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
        this.errorService.showToast('Review submitted and form cleared.', 'success');
        if (this.product?._id) {
          this.loadProduct(this.product._id, true);
        }
      },
      error: (error) => {
        this.isSubmittingReview = false;
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

  onReviewImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.reviewImageFiles = files.slice(0, 5);
  }

  editReview(review: ProductReview): void {
    this.isEditingReview = true;
    this.successMessage = '';
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

