import { Component, OnInit } from '@angular/core';
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
  CustomerCatalogVariant
} from '../../core/models/customer.models';
import { ProductReview, ProductReviewForm, ProductReviewStat } from '../../core/models/review.models';
import { ProductGalleryComponent } from './product-gallery/product-gallery.component';
import { ProductPurchasePanelComponent } from './product-purchase-panel/product-purchase-panel.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductGalleryComponent, ProductPurchasePanelComponent],
  template: `
    <div class="min-h-[calc(100vh-64px)] bg-slate-50">
      <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-slate-900">
          <span>&larr;</span>
          Back to catalog
        </a>

        <div *ngIf="loading" class="mt-8 text-sm font-semibold text-slate-500">Loading product...</div>

        <div *ngIf="successMessage" class="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {{ successMessage }}
        </div>

        <ng-container *ngIf="product && !loading">
          <div class="mt-8 grid gap-8 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
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
              [variantLabels]="variantLabels()"
              [attributes]="attributeEntries(selectedVariant()?.attributes)"
              (variantChanged)="onVariantChange($event)"
              (quantityChanged)="setQuantity($event)"
              (addToCart)="addToCart()"
            />
          </div>

          <section class="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div class="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Ratings & Reviews</p>
                  <h2 class="mt-2 text-2xl font-black text-slate-900">What customers are saying</h2>
                </div>
                <div class="rounded-[1.5rem] border border-amber-100 bg-amber-50 px-4 py-3 text-right">
                  <p class="text-3xl font-black text-slate-900">{{ formatRating(product.averageRating || 0) }}</p>
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{{ product.numberOfReviews || 0 }} reviews</p>
                </div>
              </div>

              <div class="mt-5 grid gap-3">
                <div *ngFor="let row of ratingBreakdown()" class="flex items-center gap-4">
                  <p class="w-12 text-sm font-black text-slate-700">{{ row.star }} star</p>
                  <div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-full rounded-full bg-amber-400 transition-all" [style.width.%]="row.percentage"></div>
                  </div>
                  <p class="w-12 text-right text-sm font-bold text-slate-500">{{ row.count }}</p>
                </div>
              </div>

              <div class="mt-8 space-y-4">
                <article
                  *ngFor="let review of reviews; trackBy: trackByReview"
                  class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div class="flex flex-wrap items-center gap-3">
                        <p class="text-base font-black text-slate-900">{{ review.title || 'Customer review' }}</p>
                        <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
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
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      View image
                    </a>
                  </div>
                </article>

                <div *ngIf="!reviews.length" class="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <h3 class="text-xl font-black text-slate-900">No reviews yet</h3>
                  <p class="mt-3 text-sm font-medium text-slate-500">Be the first customer to share feedback for this product.</p>
                </div>
              </div>
            </div>

            <aside class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <ng-container *ngIf="isCustomer(); else guestReviewPrompt">
                <div class="border-b border-slate-100 pb-5">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Write A Review</p>
                  <h2 class="mt-2 text-2xl font-black text-slate-900">Share your experience</h2>
                  <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                    Reviews are allowed only after this product has been delivered to you.
                  </p>
                </div>

                <form class="mt-6 space-y-4" (ngSubmit)="submitReview()">
                  <label class="block">
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Rating</span>
                    <select
                      [(ngModel)]="reviewForm.rating"
                      name="rating"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                    >
                      <option *ngFor="let star of ratingOptions" [ngValue]="star">{{ star }} / 5</option>
                    </select>
                  </label>

                  <label class="block">
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Title</span>
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
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Review</span>
                    <textarea
                      [(ngModel)]="reviewForm.commentBody"
                      name="commentBody"
                      rows="5"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                      placeholder="What stood out? Quality, packaging, delivery, value..."
                    ></textarea>
                  </label>

                  <label class="block">
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Review image URLs</span>
                    <textarea
                      [(ngModel)]="reviewImageUrls"
                      name="reviewImages"
                      rows="3"
                      class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                      placeholder="Optional. Paste one image URL per line."
                    ></textarea>
                  </label>

                  <button
                    type="submit"
                    [disabled]="isSubmittingReview || !product"
                    class="btn-primary w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {{ isSubmittingReview ? 'Saving Review...' : (existingReview ? 'Update Review' : 'Submit Review') }}
                  </button>
                </form>
              </ng-container>

              <ng-template #guestReviewPrompt>
                <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Review access</p>
                <h2 class="mt-2 text-2xl font-black text-slate-900">Sign in to leave a review</h2>
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
  loading = false;
  successMessage = '';
  selectedVariantId = '';
  selectedImage = '';
  quantity = 1;
  isAdding = false;
  reviews: ProductReview[] = [];
  reviewStats: ProductReviewStat[] = [];
  isSubmittingReview = false;
  reviewImageUrls = '';
  ratingOptions = [5, 4, 3, 2, 1];
  reviewForm: ProductReviewForm = {
    productId: '',
    title: '',
    commentBody: '',
    rating: 5,
    reviewImages: []
  };

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

    this.loadProduct();
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

  loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (!productId) {
      this.errorService.showToast('Product not found.', 'error');
      return;
    }

    this.loading = true;

    forkJoin({
      productResponse: this.catalogService.getProductDetails(productId),
      reviews: this.reviewService.getProductReviews(productId),
      reviewStats: this.reviewService.getReviewStats(productId)
    }).subscribe({
      next: ({ productResponse, reviews, reviewStats }) => {
        this.loading = false;
        this.product = productResponse?.data || null;
        this.reviews = reviews;
        this.reviewStats = reviewStats;

        const initialVariant = this.product?.displayVariant || this.product?.variants?.[0];
        this.selectedVariantId = initialVariant?._id || '';
        this.selectedImage = this.activeImage();
        this.syncReviewForm();
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
      reviewImages: this.reviewImageUrls
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    };

    if (!payload.title || !payload.commentBody || !payload.rating) {
      this.errorService.showToast('Rating, title, and review text are required.', 'error');
      this.successMessage = '';
      return;
    }

    this.isSubmittingReview = true;
    this.successMessage = '';

    this.reviewService.addOrUpdateReview(payload).subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.successMessage = this.existingReview ? 'Review updated successfully.' : 'Review submitted successfully.';
        this.loadProduct();
      },
      error: (error) => {
        this.isSubmittingReview = false;
      }
    });
  }

  trackByReview(index: number, review: ProductReview): string {
    return review._id || String(index);
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

    this.reviewImageUrls = (review?.reviewImages || []).join('\n');
  }
}
