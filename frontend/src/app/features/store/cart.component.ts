import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ErrorService } from '../../core/services/error.service';
import {
  CustomerCart,
  CustomerCartItem,
  CustomerCatalogVariant
} from '../../core/models/customer.models';

const EMPTY_CART: CustomerCart = {
  cartItems: [],
  totalCartPrice: 0,
  alerts: null
};

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container *ngIf="isCustomer(); else guestState">
      <section class="mt-4 space-y-6 px-4 sm:mt-5 sm:px-6 lg:mt-6 lg:px-8">
        <div class="app-shell-width">
          <div class="vendor-page-shell overflow-hidden">
            <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div class="max-w-2xl">
                  <p class="app-page-eyebrow !text-amber-700">Shopping Bag</p>
                  <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">Your cart</h1>
                </div>
              </div>
            </div>

            <div
              *ngIf="cartMessage"
              class="mt-6 rounded-[1.5rem] border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-800"
            >
              {{ cartMessage }}
            </div>

            <div
              *ngIf="cart.alerts"
              class="mt-4 rounded-[1.5rem] border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700"
            >
              {{ cart.alerts }}
            </div>

            <div *ngIf="cartLoading" class="px-4 py-6 text-sm font-medium text-slate-500 sm:px-5 lg:px-6">
              Loading cart...
            </div>

            <div *ngIf="!cartLoading && cart.cartItems.length === 0" class="bg-[#fffdfa] px-4 py-6 sm:px-5 lg:px-6">
              <div class="rounded-[2rem] border border-dashed border-[#e7dac9] bg-white app-card-body text-center shadow-[0_18px_50px_rgba(111,78,55,0.05)]">
                <h2 class="text-2xl font-medium text-slate-900">Your cart is empty</h2>
                <p class="mt-3 text-sm font-medium text-slate-500">
                  Browse products and add a variant to start building your order.
                </p>
                <a routerLink="/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">Browse Products</a>
              </div>
            </div>

            <div *ngIf="cart.cartItems.length" class="grid gap-5 bg-[#fffdfa] app-card-body lg:grid-cols-[minmax(0,1.75fr)_360px]">
              <div class="space-y-5">
                <article
                  *ngFor="let item of cart.cartItems; trackBy: trackByCartVariant"
                  class="rounded-[2rem] border border-[#e7dac9] bg-white app-card-body shadow-[0_18px_50px_rgba(111,78,55,0.05)]"
                >
                  <div class="flex flex-col gap-4 sm:flex-row">
                    <img
                      [src]="cartItemImage(item)"
                      [alt]="item.product?.productName || 'Cart item'"
                      loading="lazy"
                      decoding="async"
                      class="h-24 w-full rounded-[1.5rem] object-cover sm:h-28 sm:w-28"
                    />

                    <div class="min-w-0 flex-1">
                      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p class="text-lg font-medium text-slate-900">
                            {{ item.product?.productName || 'Product unavailable' }}
                          </p>
                          <p class="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            {{ variantLabel(resolveCartVariant(item)) }}
                          </p>
                        </div>

                        <button
                          type="button"
                          class="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                          (click)="removeFromCart(item)"
                        >
                          Remove
                        </button>
                      </div>

                      <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex w-full items-center rounded-xl border border-[#e7dac9] bg-[#fffaf5] sm:w-auto">
                          <button
                            type="button"
                            class="px-4 py-3 text-base font-medium text-[#6f4e37]"
                            (click)="updateCartItem(item, 'dec')"
                          >
                            -
                          </button>
                          <span class="min-w-12 flex-1 text-center text-sm font-medium text-slate-900">
                            {{ item.quantity || 0 }}
                          </span>
                          <button
                            type="button"
                            class="px-4 py-3 text-base font-medium text-[#6f4e37]"
                            (click)="updateCartItem(item, 'inc')"
                          >
                            +
                          </button>
                        </div>

                        <div class="text-left sm:text-right">
                          <p class="text-sm font-medium text-slate-500">Price</p>
                          <p class="text-lg font-medium text-slate-900">
                            {{ formatCurrency((item.priceAtAddition || 0) * (item.quantity || 0)) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside class="space-y-5">
                <div class="rounded-[2rem] border border-[#e7dac9] bg-white app-card-body shadow-[0_18px_50px_rgba(111,78,55,0.05)]">
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-amber-700">Summary</p>

                  <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-[#fffaf5] p-4 text-sm text-slate-700">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-slate-500">Items</span>
                      <span class="font-medium text-slate-900">{{ cartCount() }}</span>
                    </div>
                    <div class="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span class="font-medium text-slate-500">Total</span>
                      <span class="text-2xl font-medium tracking-tight text-slate-900">{{ formatCurrency(cart.totalCartPrice || 0) }}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn-secondary mt-5 w-full !px-4 !py-3"
                    (click)="clearCart()"
                  >
                    Clear Cart
                  </button>
                  <a
                    routerLink="/checkout"
                    class="btn-primary mt-3 inline-flex w-full items-center justify-center !px-4 !py-3"
                  >
                    Proceed To Checkout
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </ng-container>

    <ng-template #guestState>
      <section class="mt-4 space-y-6 px-4 sm:mt-5 sm:px-6 lg:mt-6 lg:px-8">
        <div class="app-shell-width">
          <div class="vendor-page-shell overflow-hidden">
            <div class="bg-[#fffdfa] px-4 py-16 sm:px-5 lg:px-6">
              <div class="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-[#e7dac9] bg-white app-card-body text-center shadow-[0_18px_50px_rgba(111,78,55,0.05)]">
                <p class="app-page-eyebrow !text-amber-700">Shopping Bag</p>
                <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">Sign in to view your cart</h1>
                <p class="app-page-description !mt-3">
                  Your cart is available for customer accounts after login.
                </p>
                <a routerLink="/login" class="btn-primary mt-8 inline-flex !px-6 !py-3">Go To Login</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ng-template>
  `
})
export class CartComponent implements OnInit {
  user: any = null;
  cart: CustomerCart = EMPTY_CART;
  cartLoading = false;
  cartMessage = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
    });

    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (this.isCustomer()) {
        this.loadCart();
      } else {
        this.cartService.resetCart();
        this.cart = EMPTY_CART;
      }
    });

    this.authService.getCurrentUser().subscribe({
      next: () => {},
      error: () => this.authService.clearCurrentUser()
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

  loadCart(): void {
    this.cartLoading = true;

    this.cartService.getCart().subscribe({
      next: () => {
        this.cartLoading = false;
      },
      error: (error) => {
        this.cartLoading = false;
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to load your cart right now.',
          'error'
        );
      }
    });
  }

  updateCartItem(item: CustomerCartItem, action: 'inc' | 'dec'): void {
    const productId = item.product?._id;
    const variantId = item.variantId;

    if (!productId || !variantId) {
      return;
    }

    this.cartMessage = '';

    this.cartService.updateQuantity(productId, variantId, action).subscribe({
      next: (response) => {
        this.cartMessage = response?.message || 'Cart updated.';
      },
      error: (error) => {
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to update this cart item right now.',
          'error'
        );
      }
    });
  }

  removeFromCart(item: CustomerCartItem): void {
    if (!item.variantId) {
      return;
    }

    this.cartMessage = '';

    this.cartService.removeItem(item.variantId).subscribe({
      next: (response) => {
        this.cartMessage = response?.message || 'Item removed from cart.';
      },
      error: (error) => {
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to remove this item right now.',
          'error'
        );
      }
    });
  }

  clearCart(): void {
    this.cartMessage = '';

    this.cartService.clearCart().subscribe({
      next: (response) => {
        this.cartMessage = response?.message || 'Cart cleared successfully.';
      },
      error: (error) => {
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to clear the cart right now.',
          'error'
        );
      }
    });
  }

  resolveCartVariant(item: CustomerCartItem): CustomerCatalogVariant | undefined {
    return item.product?.variants?.find((variant) => variant._id === item.variantId);
  }

  variantLabel(variant?: CustomerCatalogVariant): string {
    if (!variant) {
      return 'Variant';
    }

    const attributes = Object.entries(variant.attributes || {}).map(
      ([key, value]) => `${key}: ${value}`
    );

    return attributes.length ? attributes.join(' | ') : variant.sku || 'Variant';
  }

  cartItemImage(item: CustomerCartItem): string {
    return (
      this.resolveCartVariant(item)?.variantImage ||
      item.product?.mainImages?.[0] ||
      'https://via.placeholder.com/160?text=Item'
    );
  }

  cartCount(): number {
    return (this.cart.cartItems || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  trackByCartVariant(index: number, item: CustomerCartItem): string {
    return item.variantId || item.product?._id || String(index);
  }
}

