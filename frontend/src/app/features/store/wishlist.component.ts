import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { CartActionService } from '../../core/services/cart-action.service';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { GuestDataService } from '../../core/services/guest-data.service';
import { StoreProductVariantService } from '../../core/services/store-product-variant.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ErrorService } from '../../core/services/error.service';
import { CustomerCatalogProduct, CustomerCatalogVariant, CustomerWishlist, CustomerWishlistProduct } from '../../core/models/customer.models';
import { VariantModalAddToCartEvent, VariantModalComponent } from './variant-modal/variant-modal.component';

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
  imports: [CommonModule, RouterModule, VariantModalComponent],
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
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  class="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="busyId === item._id || moveBusyId === item._id"
                  (click)="$event.stopPropagation(); moveItemToCart(item)"
                >
                  {{ moveBusyId === item._id ? 'Moving...' : 'Move To Cart' }}
                </button>
                <button
                  type="button"
                  class="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="busyId === item._id || moveBusyId === item._id"
                  (click)="$event.stopPropagation(); removeItem(item)"
                >
                  {{ busyId === item._id ? 'Removing...' : 'Remove' }}
                </button>
              </div>
            </div>
          </article>
        </div>

      </div>
        </div>
      </section>
    </ng-container>

    <app-variant-modal
      [open]="variantModalOpen"
      [product]="selectedMoveProduct || selectedGuestMoveItem?.product || null"
      [initialVariantId]="selectedGuestMoveItem?.variantId || ''"
      [isAdding]="moveBusyId === (selectedMoveProduct?._id || '') || guestMoveModalBusyId === (selectedGuestMoveItem?.productId || '')"
      (close)="closeVariantModal()"
      (addToCart)="handleVariantModalAddToCart($event)"
    />

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
                      [disabled]="moveBusyId === item.productId"
                      (click)="$event.preventDefault(); $event.stopPropagation(); moveGuestWishlistItemToCart(item)"
                    >
                      {{ moveBusyId === item.productId ? 'Moving...' : 'Move To Cart' }}
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
  moveBusyId = '';
  guestMoveModalBusyId = '';
  modalMoveContext: 'guest' | 'customer' | null = null;
  wishlist: CustomerWishlist | null = null;
  wishlistItems: CustomerWishlistProduct[] = [];
  variantModalOpen = false;
  selectedMoveProduct: CustomerCatalogProduct | null = null;
  selectedGuestMoveItem: GuestWishlistDisplayItem | null = null;
  guestWishlistLoading = false;
  guestWishlistMessage = '';
  guestWishlistItems: GuestWishlistDisplayItem[] = [];

  constructor(
    private authService: AuthService,
    private cartActionService: CartActionService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private catalogService: CatalogService,
    private guestDataService: GuestDataService,
    private variantService: StoreProductVariantService,
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

  moveItemToCart(item: CustomerWishlistProduct): void {
    const product = item as CustomerCatalogProduct;
    if (!product?._id) {
      return;
    }

    if (product.isActive === false) {
      this.errorService.showToast('Unable to move item to cart.', 'error');
      return;
    }

    if (this.variantService.isProductOutOfStock(product)) {
      this.errorService.showToast('Product is out of stock.', 'error');
      return;
    }

    if (!this.variantService.hasSingleVariant(product) && this.variantService.getVariants(product).length > 1) {
      this.selectedMoveProduct = product;
      this.selectedGuestMoveItem = null;
      this.modalMoveContext = 'customer';
      this.variantModalOpen = true;
      return;
    }

    const variant = this.variantService.getDefaultVariant(product);
    if (!variant?._id) {
      this.errorService.showToast('Please select a variant.', 'error');
      return;
    }

    this.moveWishlistItemToCart(product, variant, 1);
  }

  handleVariantModalAddToCart(event: VariantModalAddToCartEvent): void {
    const quantity = Math.max(1, Number(event.quantity) || 1);
    if (this.modalMoveContext === 'guest') {
      const guestItem = this.selectedGuestMoveItem;
      const guestProduct = guestItem?.product || null;
      if (!guestItem?.productId || !guestProduct?._id) {
        this.errorService.showToast('Unable to move item to cart.', 'error');
        return;
      }

      const guestVariant = this.variantService.getSelectedVariant(guestProduct, event.variantId);
      if (!guestVariant?._id) {
        this.errorService.showToast('Please select a variant.', 'error');
        return;
      }

      void this.moveGuestItemToCart(guestItem, guestProduct, guestVariant, quantity, 'modal');
      return;
    }

    if (this.modalMoveContext === 'customer') {
      const customerProduct = this.selectedMoveProduct;
      if (!customerProduct?._id) {
        this.errorService.showToast('Unable to move item to cart.', 'error');
        return;
      }

      const variant = this.variantService.getSelectedVariant(customerProduct, event.variantId);

      if (!variant?._id) {
        this.errorService.showToast('Please select a variant.', 'error');
        return;
      }

      void this.moveWishlistItemToCart(customerProduct, variant, quantity);
      return;
    }

    this.errorService.showToast('Unable to move item to cart.', 'error');
  }

  removeGuestItem(item: GuestWishlistDisplayItem): void {
    const key = this.guestWishlistItemKey(item);
    this.busyId = key;

    this.guestDataService.removeFromGuestWishlist(item.productId, item.variantId);
    this.busyId = '';
    this.guestWishlistMessage = 'Item removed from guest wishlist.';
    this.errorService.showToast('Item removed from guest wishlist.', 'success');
  }

  closeVariantModal(): void {
    this.resetVariantModalState();
    this.variantModalOpen = false;
  }

  async moveGuestWishlistItemToCart(item: GuestWishlistDisplayItem): Promise<void> {
    const key = item.productId;
    if (!key || this.moveBusyId === key) {
      return;
    }

    this.moveBusyId = key;

    try {
      const product = await this.resolveGuestMoveProduct(item);
      if (!product?._id) {
        throw new Error('Unable to move item to cart.');
      }

      if (!this.variantService.hasSingleVariant(product) && this.variantService.getVariants(product).length > 1) {
        this.selectedGuestMoveItem = { ...item, product };
        this.selectedMoveProduct = product;
        this.modalMoveContext = 'guest';
        this.variantModalOpen = true;
        this.moveBusyId = '';
        return;
      }

      const variant = this.variantService.getDefaultVariant(product);
      if (!variant?._id) {
        throw new Error('Please select a variant.');
      }

      await this.moveGuestItemToCart({ ...item, product }, product, variant, 1, 'button');
    } catch (error) {
      this.errorService.showToast(
        this.errorService.extractErrorMessage(error) || 'Unable to move item to cart.',
        'error'
      );
    } finally {
      if (!this.variantModalOpen) {
        this.moveBusyId = '';
      }
    }
  }

  productImage(item: CustomerWishlistProduct): string {
    return item.mainImages?.[0] || 'https://via.placeholder.com/640x640?text=Wishlist';
  }

  guestWishlistItemImage(item: GuestWishlistDisplayItem): string {
    return (
      item.product?.mainImages?.[0] ||
      'https://via.placeholder.com/640x640?text=Wishlist'
    );
  }

  guestWishlistItemName(item: GuestWishlistDisplayItem): string {
    return item.product?.productName || 'Product unavailable';
  }

  guestWishlistVariantLabel(item: GuestWishlistDisplayItem): string {
    const variantCount = Array.isArray(item.product?.variants) ? item.product.variants.length : 0;

    if (variantCount > 1) {
      return `${variantCount} variants`;
    }

    return variantCount === 1 ? 'Single variant' : 'Saved product';
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
    return this.authService.isLoggedIn() && !!this.user && !this.isAdmin() && !this.isVendor();
  }

  private async moveWishlistItemToCart(product: CustomerCatalogProduct, variant: CustomerCatalogVariant, quantity: number): Promise<void> {
    console.log('ENTER moveWishlistItemToCart');

    if (!product?._id || !variant?._id) {
      console.error('NO PRODUCT OR INVALID VARIANT', { product, variant });
      this.errorService.showToast('Please select a variant.', 'error');
      this.moveBusyId = '';
      return;
    }

    console.log('CUSTOMER MOVE START', { product, variant, quantity });
    this.moveBusyId = product._id;
    console.log('MOVE BUSY SET', this.moveBusyId);
    try {
      console.log('VALID DATA', {
        productId: product._id,
        variantId: variant?._id,
        quantity
      });
      console.log('CALLING CART ADD', {
        productId: product._id,
        variantId: variant?._id,
        quantity,
        endpoint: '/api/v1/cart/add-to-cart'
      });
      const result = await firstValueFrom(this.cartService.addToCart(product._id, variant._id, quantity));
      console.log('CART ADD RESULT', result);

      if (!result.success) {
        throw new Error(
          /stock|out of stock/i.test(result.message || '')
            ? 'Product is out of stock.'
            : result.message || 'Unable to move item to cart.'
        );
      }

      this.errorService.showToast('Moved to cart successfully.', 'success');
      this.safeCloseVariantModal();
      void this.removeCustomerWishlistAfterMove(product._id);
    } catch (error) {
      console.error('CUSTOMER MOVE ERROR', error);
      this.errorService.showToast(
        this.errorService.extractErrorMessage(error) || 'Unable to move item to cart.',
        'error'
      );
      this.loadWishlist();
    } finally {
      console.log('CUSTOMER MOVE FINALLY BEFORE RESET', this.moveBusyId);
      this.resetVariantModalState();
      this.moveBusyId = '';
      console.log('CUSTOMER MOVE FINALLY AFTER RESET', this.moveBusyId);
    }
  }

  private safeCloseVariantModal(): void {
    try {
      this.variantModalOpen = false;
    } catch {
      // Keep loading cleanup independent of modal close/view-transition issues.
    }
  }

  private async removeCustomerWishlistAfterMove(productId: string): Promise<void> {
    if (!productId) {
      return;
    }

    try {
      const wishlist = await firstValueFrom(this.wishlistService.toggleWishlist(productId));
      this.wishlist = wishlist;
      this.wishlistItems = Array.isArray(wishlist?.products) ? wishlist.products : [];
    } catch (error) {
      this.errorService.showToast(
        this.errorService.extractErrorMessage(error) || 'Moved to cart, but wishlist removal failed.',
        'error'
      );
      this.loadWishlist();
    }
  }

  private async moveGuestItemToCart(
    item: GuestWishlistDisplayItem,
    product: CustomerCatalogProduct,
    variant: CustomerCatalogVariant,
    quantity: number,
    loadingTarget: 'button' | 'modal' = 'button'
  ): Promise<void> {
    if (!item.productId || !product?._id || !variant?._id) {
      this.errorService.showToast('Unable to move item to cart.', 'error');
      return;
    }

    if (loadingTarget === 'modal') {
      this.guestMoveModalBusyId = item.productId;
    } else {
      this.moveBusyId = item.productId;
    }

    try {
      const result = await firstValueFrom(this.cartActionService.addToCart(product._id, variant._id, quantity));

      if (!result.success) {
        throw new Error(
          /stock|out of stock/i.test(result.message || '')
            ? 'Product is out of stock.'
            : result.message || 'Unable to move item to cart.'
        );
      }

      this.guestDataService.removeFromGuestWishlist(item.productId);
      this.loadGuestWishlist();
      this.variantModalOpen = false;
      this.selectedGuestMoveItem = null;
      this.selectedMoveProduct = null;
      this.errorService.showToast('Moved to cart successfully.', 'success');
    } catch (error) {
      this.errorService.showToast(
        this.errorService.extractErrorMessage(error) || 'Unable to move item to cart.',
        'error'
      );
    } finally {
      if (loadingTarget === 'modal') {
        this.guestMoveModalBusyId = '';
      } else {
        this.moveBusyId = '';
      }
      this.resetVariantModalState();
    }
  }

  private resetVariantModalState(): void {
    this.modalMoveContext = null;
    this.selectedMoveProduct = null;
    this.selectedGuestMoveItem = null;
    this.guestMoveModalBusyId = '';
  }

  private buildGuestWishlistItems(
    products: CustomerCatalogProduct[],
    savedItems: Array<{ productId: string; productName?: string; brand?: string; mainImages?: string[]; basePrice?: number; isActive?: boolean; categoryDetails?: { _id?: string; name?: string; slug?: string }; variantId?: string }>
  ): GuestWishlistDisplayItem[] {
    const productMap = new Map((products || []).map((product) => [product._id, product]));

    return savedItems.map((savedItem) => {
      const fetchedProduct = productMap.get(savedItem.productId) || null;
      const fallbackProduct = savedItem.productId
        ? ({
            _id: savedItem.productId,
            productName: savedItem.productName,
            brand: savedItem.brand,
            mainImages: Array.isArray(savedItem.mainImages) ? savedItem.mainImages : [],
            basePrice: savedItem.basePrice,
            isActive: savedItem.isActive,
            categoryDetails: savedItem.categoryDetails,
            variants: []
          } as CustomerCatalogProduct)
        : null;
      const product = fetchedProduct || fallbackProduct;
      const variant = this.resolveGuestVariant(product, savedItem.variantId);
      const available = (product?.isActive ?? savedItem.isActive ?? true) !== false;
      const warning = product?.isActive === false
        ? 'This product is inactive.'
        : !fetchedProduct && savedItem.isActive === false
          ? 'This product is inactive.'
          : '';
      const priceLabel = Number(product?.basePrice || variant?.finalPrice || variant?.productPrice || 0);

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

  private async resolveGuestMoveProduct(item: GuestWishlistDisplayItem): Promise<CustomerCatalogProduct | null> {
    const product = item.product;
    if (this.hasGuestMoveProductDetails(product)) {
      return product;
    }

    const response = await firstValueFrom(this.catalogService.getProductDetails(item.productId));
    return (response?.data as CustomerCatalogProduct | null) || null;
  }

  private hasGuestMoveProductDetails(product: CustomerCatalogProduct | null): product is CustomerCatalogProduct {
    return !!product?._id && Array.isArray(product.variants) && product.variants.length > 0;
  }
}
