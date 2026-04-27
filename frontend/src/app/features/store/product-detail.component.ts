import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ErrorService } from '../../core/services/error.service';
import { GuestDataService } from '../../core/services/guest-data.service';
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
import { ProductRelatedProductsSectionComponent } from './components/product-related-products-section/product-related-products-section.component';
import { ProductReviewsSummaryComponent } from './components/product-reviews-summary/product-reviews-summary.component';
import { ProductReviewsListComponent } from './components/product-reviews-list/product-reviews-list.component';
import { ProductReviewFormComponent } from './components/product-review-form/product-review-form.component';
import { ProductPurchasePanelComponent } from './product-purchase-panel/product-purchase-panel.component';
import {
  buildActiveImage,
  buildAttributeEntries,
  buildDiscountedPriceLabel,
  buildGalleryImages,
  buildOriginalPriceLabel,
  buildVariantLabel,
  buildVariantLabels
} from './utils/product-detail-variants.helpers';
import {
  ratingBreakdown as buildRatingBreakdown,
  reviewTotalCount as getReviewTotalCount
} from './utils/product-detail-reviews.helpers';
import { findSimilarProducts as buildSimilarProducts } from './utils/product-detail-related.helpers';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductGalleryComponent, ProductPurchasePanelComponent, ProductRelatedProductsSectionComponent, ProductReviewsSummaryComponent, ProductReviewsListComponent, ProductReviewFormComponent],
  template: `
    <div class="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(111,78,55,0.12),transparent_24%),#fff9f2]">
      <section class="storefront-section py-8 lg:py-10">
        <div class="storefront-container">
        <a routerLink="/products" class="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-slate-900">
          <span>&larr;</span>
          Back to products
        </a>

        <div *ngIf="loading" class="mt-8 text-sm font-semibold text-slate-500">Loading product...</div>

        <div *ngIf="successMessage" class="mt-8 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {{ successMessage }}
        </div>

        <ng-container *ngIf="product && !loading">
          <div class="mt-8 rounded-[2rem] border border-[#eadcc9] bg-white/90 app-card-tight shadow-[0_24px_60px_rgba(47,27,20,0.08)]">
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

          <app-product-related-products-section
            [relatedProducts]="visibleRelatedProducts()"
            [wishlistBusyId]="wishlistBusyId"
            [wishlistedProductIds]="wishlistedProductIds"
            (productClick)="openProduct($event)"
            (wishlistToggle)="toggleRelatedWishlist($event)"
          />

          <section class="mt-10 rounded-[2rem] border border-[#e7dac9] bg-white app-card-body shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
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

            <app-product-reviews-summary
              [averageRating]="product.averageRating || 0"
              [reviewTotalCount]="reviewTotalCount()"
              [ratingBreakdown]="ratingBreakdown()"
              [starSlots]="reviewStarSlots"
            />

            <app-product-reviews-list
              [reviews]="reviews"
              [currentUserId]="user?._id || ''"
              [starSlots]="reviewStarSlots"
              (editReview)="editReview($event)"
            />
          </section>

          <section *ngIf="showReviewForm" #reviewFormSection class="mt-10 rounded-[2rem] border border-[#e7dac9] bg-white app-card-body shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
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
              <app-product-review-form
                [reviewForm]="reviewForm"
                [reviewImageFiles]="reviewImageFiles"
                [isEditingReview]="isEditingReview"
                [isSubmittingReview]="isSubmittingReview"
                [canSubmit]="!!product"
                [ratingOptions]="ratingOptions"
                (submitReview)="submitReview()"
                (cancelEdit)="cancelReviewEdit()"
                (imagesSelected)="onReviewImagesSelected($event)"
              />
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
        </div>
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
  @ViewChild('reviewFormSection') reviewFormSection?: ElementRef<HTMLElement>;
  @ViewChild(ProductReviewFormComponent) reviewFormComponent?: ProductReviewFormComponent;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private catalogService: CatalogService,
    private errorService: ErrorService,
    private guestDataService: GuestDataService,
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
        this.loadGuestWishlistState();
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
    return buildGalleryImages(this.product);
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
    return buildActiveImage(this.selectedImage, this.selectedVariant(), this.product);
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
      this.guestDataService.addToGuestCart(this.product._id, variant._id, this.quantity);
      this.successMessage = 'Item saved to this device. Sign in to sync your cart.';
      this.quantity = 1;
      this.errorService.showToast(this.successMessage, 'success');
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
      this.toggleGuestWishlist(this.product);
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
    return buildVariantLabel(variant, this.attributeEntries.bind(this));
  }

  variantLabels(): Record<string, string> {
    return buildVariantLabels(this.product?.variants, this.variantLabel.bind(this), this.formatCurrency.bind(this));
  }

  attributeEntries(attributes?: Record<string, string>): Array<{ key: string; value: string }> {
    return buildAttributeEntries(attributes);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  originalPriceLabel(): string {
    return buildOriginalPriceLabel(this.product, this.selectedVariant(), this.formatCurrency.bind(this));
  }

  discountedPriceLabel(): string {
    return buildDiscountedPriceLabel(this.product, this.selectedVariant(), this.formatCurrency.bind(this));
  }

  get existingReview(): ProductReview | null {
    if (!this.user?._id) {
      return null;
    }

    return this.reviews.find((review) => review.user?._id === this.user._id) || null;
  }

  reviewTotalCount(): number {
    return getReviewTotalCount(this.reviewStats, this.reviews, this.product);
  }

  ratingBreakdown(): Array<{ star: number; count: number; percentage: number }> {
    return buildRatingBreakdown(this.reviewStats, this.reviews, this.product);
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
    this.reviewFormComponent?.clearReviewImagesInput();

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
    this.reviewFormComponent?.clearReviewImagesInput();
  }

  private syncWishlistState(productId?: string, wishlist?: { products?: CustomerWishlistProduct[] } | null): void {
    if (!productId || !this.isCustomer()) {
      this.syncWishlistSet(this.guestDataService.getGuestWishlist());
      this.isWishlisted = this.wishlistedProductIds.has(productId || '');
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

  private loadGuestWishlistState(): void {
    this.syncWishlistSet(this.guestDataService.getGuestWishlist());
    if (this.product?._id) {
      this.isWishlisted = this.wishlistedProductIds.has(this.product._id);
    }
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

  private findSimilarProducts(
    currentProduct: CustomerCatalogProduct,
    catalogProducts: CustomerCatalogProduct[],
    groups: CustomerLandingCategoryGroup[]
  ): CustomerCatalogProduct[] {
    return buildSimilarProducts(currentProduct, catalogProducts, groups);
  }
}

