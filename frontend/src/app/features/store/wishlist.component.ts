import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { GuestDataService } from '../../core/services/guest-data.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ErrorService } from '../../core/services/error.service';
import { CustomerCatalogProduct, CustomerCatalogVariant, CustomerWishlist, CustomerWishlistProduct } from '../../core/models/customer.models';

interface GuestWishlistDisplayItem {
  productId: string;
  variantId?: string;
  product: CustomerCatalogProduct | null;
  variant: CustomerCatalogVariant | null;
  available: boolean;
  warning: string;
  priceLabel: number;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container *ngIf="isCustomer(); else guestState">
      <section class="storefront-section min-h-[calc(100vh-72px)] py-8 lg:py-10">
        <div class="storefront-container">
        <div class="rounded-[2rem] border border-[#eadcc9] bg-white/90 app-card-body shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.26em] text-amber-700">Saved items</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">My Wishlist</h1>
          </div>

          <a routerLink="/products" class="btn-secondary w-full justify-center !px-5 !py-3 sm:w-auto">
            Continue Shopping
          </a>
        </div>

        <div *ngIf="loading" class="py-16 text-center text-sm font-semibold text-slate-500">
          Loading your wishlist...
        </div>

        <div *ngIf="!loading && wishlistItems.length === 0" class="py-16 text-center">
          <h2 class="text-2xl font-black text-slate-900">Your wishlist is empty</h2>
          <p class="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-500">
            Save products from product pages to compare them later or come back when you're ready to buy.
          </p>
          <a routerLink="/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">
            Browse Products
          </a>
        </div>

        <div *ngIf="!loading && wishlistItems.length > 0" class="mt-8 grid gap-4">
          <article
            *ngFor="let item of wishlistItems; trackBy: trackByWishlistItem"
            [routerLink]="['/products', item._id]"
            role="link"
            tabindex="0"
            class="cursor-pointer overflow-hidden rounded-[1.4rem] border border-[#e7dac9] bg-[#fffaf5] shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.06)]"
          >
            <div class="flex flex-col gap-4 app-card-tight sm:flex-row sm:items-center">
              <div class="block shrink-0">
                <div class="h-24 w-full overflow-hidden rounded-[1.2rem] bg-slate-100 sm:h-20 sm:w-20">
                  <img
                    [src]="productImage(item)"
                    [alt]="item.productName || 'Wishlist product'"
                    class="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      {{ item.brand || 'Product' }}
                    </p>
                    <h2 class="mt-1 line-clamp-1 text-base font-black text-slate-900 sm:text-lg">
                      {{ item.productName || 'Wishlist item' }}
                    </h2>
                  </div>

                  <span class="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-slate-900">
                    {{ formatCurrency(item.basePrice || 0) }}
                  </span>
                </div>

                <p class="mt-2 text-sm font-semibold text-slate-500">
                  {{ item.categoryDetails?.name || 'General Category' }}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {{ (item.variants || []).length }} variant{{ (item.variants || []).length === 1 ? '' : 's' }}
                  </span>
                  <span
                    class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]"
                    [ngClass]="item.isActive === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ item.isActive === false ? 'Inactive' : 'Active' }}
                  </span>
                </div>
              </div>

            </div>

            <div class="border-t border-[#f1e4d4] px-4 py-3">
              <button
                type="button"
                class="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="busyId === item._id"
                (click)="$event.stopPropagation(); removeItem(item)"
              >
                {{ busyId === item._id ? 'Removing...' : 'Remove' }}
              </button>
            </div>
          </article>
        </div>
      </div>
        </div>
      </section>
    </ng-container>

    <ng-template #guestState>
      <section class="storefront-section min-h-[calc(100vh-72px)] py-8 lg:py-10">
        <div class="storefront-container">
          <div class="rounded-[2rem] border border-[#eadcc9] bg-white/90 app-card-body shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
            <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.26em] text-amber-700">Saved items</p>
                <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Guest wishlist</h1>
                <p class="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                  Items saved on this device will merge into your account after login or registration.
                </p>
              </div>
            </div>

            <div *ngIf="guestWishlistLoading" class="py-16 text-center text-sm font-semibold text-slate-500">
              Loading saved items...
            </div>

            <div *ngIf="guestWishlistMessage" class="mt-4 rounded-[1.5rem] border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-800">
              {{ guestWishlistMessage }}
            </div>

            <div *ngIf="!guestWishlistLoading && guestWishlistItems.length === 0" class="py-16 text-center">
              <h2 class="text-2xl font-black text-slate-900">Your guest wishlist is empty</h2>
              <p class="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-500">
                Save products from product pages to compare them later or come back when you're ready to buy.
              </p>
              <a routerLink="/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">
                Browse Products
              </a>
            </div>

            <div *ngIf="!guestWishlistLoading && guestWishlistItems.length > 0" class="mt-8 grid gap-4">
              <article
                *ngFor="let item of guestWishlistItems; trackBy: trackByGuestWishlistItem"
                class="overflow-hidden rounded-[1.4rem] border border-[#e7dac9] bg-[#fffaf5] shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
              >
                <div class="flex flex-col gap-4 app-card-tight sm:flex-row sm:items-center">
                  <div class="block shrink-0">
                    <div class="h-24 w-full overflow-hidden rounded-[1.2rem] bg-slate-100 sm:h-20 sm:w-20">
                      <img
                        [src]="guestWishlistItemImage(item)"
                        [alt]="guestWishlistItemName(item)"
                        class="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                          {{ item.product?.brand || 'Product' }}
                        </p>
                        <h2 class="mt-1 line-clamp-1 text-base font-black text-slate-900 sm:text-lg">
                          {{ guestWishlistItemName(item) }}
                        </h2>
                      </div>

                      <span class="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-slate-900">
                        {{ formatCurrency(item.priceLabel || 0) }}
                      </span>
                    </div>

                    <p class="mt-2 text-sm font-semibold text-slate-500">
                      {{ item.product?.categoryDetails?.name || 'General Category' }}
                    </p>

                    <div class="mt-3 flex flex-wrap items-center gap-2">
                      <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                        {{ guestWishlistVariantLabel(item) }}
                      </span>
                      <span
                        class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]"
                        [ngClass]="item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
                      >
                        {{ item.available ? 'Active' : 'Unavailable' }}
                      </span>
                    </div>

                    <p *ngIf="item.warning" class="mt-3 text-sm font-medium text-amber-700">
                      {{ item.warning }}
                    </p>
                  </div>
                </div>

                <div class="border-t border-[#f1e4d4] px-4 py-3">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      class="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      [disabled]="!item.available"
                      (click)="moveGuestWishlistItemToCart(item)"
                    >
                      Move To Cart
                    </button>
                    <button
                      type="button"
                      class="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      [disabled]="busyId === guestWishlistItemKey(item)"
                      (click)="removeGuestItem(item)"
                    >
                      {{ busyId === guestWishlistItemKey(item) ? 'Removing...' : 'Remove' }}
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div *ngIf="!guestWishlistLoading && guestWishlistItems.length > 0" class="mt-6 flex justify-center">
              <a routerLink="/login" class="btn-primary inline-flex !px-6 !py-3">Go To Login</a>
            </div>
          </div>
        </div>
      </section>
    </ng-template>
  `
})
export class WishlistComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  user: any = null;
  loading = true;
  busyId = '';
  wishlist: CustomerWishlist | null = null;
  wishlistItems: CustomerWishlistProduct[] = [];
  guestWishlistLoading = false;
  guestWishlistMessage = '';
  guestWishlistItems: GuestWishlistDisplayItem[] = [];

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private catalogService: CatalogService,
    private guestDataService: GuestDataService,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (this.isCustomer()) {
        this.loadWishlist();
      } else {
        this.loading = false;
        this.wishlist = null;
        this.wishlistItems = [];
        this.loadGuestWishlist();
      }
    });

    fromEvent(window, 'guestWishlistUpdated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isCustomer()) {
          this.loadGuestWishlist();
        }
      });

    this.authService.getCurrentUser().subscribe({
      next: () => {},
      error: () => this.authService.clearCurrentUser()
    });
  }

  loadWishlist(): void {
    this.loading = true;
    this.guestWishlistLoading = false;
    this.guestWishlistItems = [];
    this.guestWishlistMessage = '';

    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.loading = false;
        this.wishlist = wishlist;
        this.wishlistItems = Array.isArray(wishlist?.products) ? wishlist.products : [];
      },
      error: (error) => {
        this.loading = false;
        this.wishlist = null;
        this.wishlistItems = [];
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  loadGuestWishlist(): void {
    this.guestWishlistLoading = true;
    this.loading = false;
    this.wishlist = null;
    this.guestWishlistMessage = '';

    const guestItems = this.guestDataService.getGuestWishlist();

    if (guestItems.length === 0) {
      this.guestWishlistItems = [];
      this.guestWishlistLoading = false;
      return;
    }

    this.catalogService.getProductsByIds(guestItems.map((item) => item.productId)).subscribe({
      next: (response) => {
        const products = Array.isArray(response?.data) ? response.data : [];
        this.guestWishlistItems = this.buildGuestWishlistItems(products, guestItems);
        this.guestWishlistLoading = false;
      },
      error: (error) => {
        this.guestWishlistLoading = false;
        this.guestWishlistItems = [];
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to load your guest wishlist right now.',
          'error'
        );
      }
    });
  }

  removeItem(item: CustomerWishlistProduct): void {
    if (!item?._id) {
      return;
    }

    this.busyId = item._id;
    this.wishlistService.toggleWishlist(item._id).subscribe({
      next: () => {
        this.busyId = '';
        this.errorService.showToast('Wishlist updated successfully.', 'success');
        this.loadWishlist();
      },
      error: (error) => {
        this.busyId = '';
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  removeGuestItem(item: GuestWishlistDisplayItem): void {
    const key = this.guestWishlistItemKey(item);
    this.busyId = key;

    this.guestDataService.removeFromGuestWishlist(item.productId, item.variantId);
    this.busyId = '';
    this.guestWishlistMessage = 'Item removed from guest wishlist.';
    this.errorService.showToast('Item removed from guest wishlist.', 'success');
  }

  moveGuestWishlistItemToCart(item: GuestWishlistDisplayItem): void {
    if (!item.available || !item.productId) {
      return;
    }

    this.guestDataService.addToGuestCart(item.productId, item.variantId, 1);
    this.errorService.showToast('Item added to guest cart.', 'success');
  }

  productImage(item: CustomerWishlistProduct): string {
    return item.mainImages?.[0] || 'https://via.placeholder.com/640x640?text=Wishlist';
  }

  guestWishlistItemImage(item: GuestWishlistDisplayItem): string {
    return (
      item.variant?.variantImage ||
      item.product?.mainImages?.[0] ||
      'https://via.placeholder.com/640x640?text=Wishlist'
    );
  }

  guestWishlistItemName(item: GuestWishlistDisplayItem): string {
    return item.product?.productName || 'Product unavailable';
  }

  guestWishlistVariantLabel(item: GuestWishlistDisplayItem): string {
    if (!item.variant) {
      return item.variantId ? 'Variant unavailable' : 'No variant';
    }

    const attributes = Object.entries(item.variant.attributes || {}).map(([key, value]) => `${key}: ${value}`);
    return attributes.length ? attributes.join(' | ') : item.variant.sku || 'Variant';
  }

  guestWishlistItemKey(item: GuestWishlistDisplayItem): string {
    return `${item.productId}-${item.variantId || ''}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  trackByWishlistItem(_: number, item: CustomerWishlistProduct): string {
    return item._id || item.productName || '';
  }

  trackByGuestWishlistItem(index: number, item: GuestWishlistDisplayItem): string {
    return `${item.productId}-${item.variantId || ''}-${index}`;
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

  private buildGuestWishlistItems(
    products: CustomerCatalogProduct[],
    savedItems: Array<{ productId: string; variantId?: string }>
  ): GuestWishlistDisplayItem[] {
    const productMap = new Map((products || []).map((product) => [product._id, product]));

    return savedItems.map((savedItem) => {
      const product = productMap.get(savedItem.productId) || null;
      const variant = this.resolveGuestVariant(product, savedItem.variantId);
      const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
      const available = !!product
        && product.isActive !== false
        && (!hasVariants || !!variant);
      const warning = !product
        ? 'This product is no longer available.'
        : product.isActive === false
          ? 'This product is inactive.'
          : hasVariants && !variant
            ? 'This variant is unavailable.'
            : '';
      const priceLabel = Number(variant?.finalPrice || variant?.productPrice || product?.basePrice || 0);

      return {
        productId: savedItem.productId,
        variantId: savedItem.variantId,
        product,
        variant,
        available,
        warning,
        priceLabel
      };
    });
  }

  private resolveGuestVariant(
    product: CustomerCatalogProduct | null,
    variantId?: string
  ): CustomerCatalogVariant | null {
    if (!product) {
      return null;
    }

    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length === 0) {
      return null;
    }

    if (variantId) {
      const exact = variants.find((variant) => variant._id === variantId);
      if (exact) {
        return exact;
      }
    }

    return product.displayVariant || variants[0] || null;
  }
}
