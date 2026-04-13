import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
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
      <div class="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(111,78,55,0.12),transparent_24%),#fff9f2]">
        <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Shopping Bag</p>
              <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Your cart</h1>
              <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                Review the dry fruit packs you’ve added, adjust quantities, and continue to checkout when you’re ready.
              </p>
            </div>
          </div>

          <div
            *ngIf="cartMessage"
            class="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          >
            {{ cartMessage }}
          </div>

          <div
            *ngIf="cart.alerts"
            class="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700"
          >
            {{ cart.alerts }}
          </div>

          <div *ngIf="cartLoading" class="mt-10 text-sm font-semibold text-slate-500">
            Loading cart...
          </div>

          <div *ngIf="!cartLoading && cart.cartItems.length === 0" class="mt-10 rounded-[2rem] border border-dashed border-[#e7dac9] bg-white px-8 py-16 text-center shadow-[0_18px_50px_rgba(47,27,20,0.05)]">
            <h2 class="text-2xl font-black text-slate-900">Your cart is empty</h2>
            <p class="mt-3 text-sm font-medium text-slate-500">
              Browse products and add a variant to start building your order.
            </p>
            <a routerLink="/" class="btn-primary mt-6 inline-flex !px-6 !py-3">Browse Products</a>
          </div>

          <div *ngIf="cart.cartItems.length" class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div class="space-y-4">
              <article
                *ngFor="let item of cart.cartItems; trackBy: trackByCartVariant"
                class="rounded-[2rem] border border-[#e7dac9] bg-white p-5 shadow-[0_18px_50px_rgba(47,27,20,0.06)]"
              >
                <div class="flex flex-col gap-4 sm:flex-row">
                  <img
                    [src]="cartItemImage(item)"
                    [alt]="item.product?.productName || 'Cart item'"
                    class="h-28 w-28 rounded-[1.5rem] object-cover"
                  />

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p class="text-lg font-black text-slate-900">
                          {{ item.product?.productName || 'Product unavailable' }}
                        </p>
                        <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          {{ variantLabel(resolveCartVariant(item)) }}
                        </p>
                      </div>

                      <button
                        type="button"
                        class="text-sm font-black text-rose-600 transition hover:text-rose-700"
                        (click)="removeFromCart(item)"
                      >
                        Remove
                      </button>
                    </div>

                    <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div class="flex items-center rounded-xl border border-[#e7dac9] bg-[#fff7ed]">
                        <button
                          type="button"
                          class="px-4 py-3 text-base font-black text-[#6f4e37]"
                          (click)="updateCartItem(item, 'dec')"
                        >
                          -
                        </button>
                        <span class="min-w-12 text-center text-sm font-black text-slate-900">
                          {{ item.quantity || 0 }}
                        </span>
                        <button
                          type="button"
                          class="px-4 py-3 text-base font-black text-[#6f4e37]"
                          (click)="updateCartItem(item, 'inc')"
                        >
                          +
                        </button>
                      </div>

                      <div class="text-left sm:text-right">
                        <p class="text-sm font-bold text-slate-500">Price</p>
                        <p class="text-lg font-black text-slate-900">
                          {{ formatCurrency((item.priceAtAddition || 0) * (item.quantity || 0)) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <aside class="h-fit rounded-[2rem] border border-[#e7dac9] bg-[#2f1b14] p-6 text-white shadow-[0_18px_50px_rgba(111,78,55,0.16)]">
              <p class="text-xs font-black uppercase tracking-[0.22em] text-[#f5e6d3]">Summary</p>
              <div class="mt-6 flex items-center justify-between text-sm font-bold text-[#f5e6d3]">
                <span>Items</span>
                <span>{{ cartCount() }}</span>
              </div>
              <div class="mt-3 flex items-center justify-between text-sm font-bold text-[#f5e6d3]">
                <span>Total</span>
                <span>{{ formatCurrency(cart.totalCartPrice || 0) }}</span>
              </div>
              <button
                type="button"
                class="mt-6 w-full rounded-2xl border border-white/20 px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-slate-900"
                (click)="clearCart()"
              >
                Clear Cart
              </button>
              <a
                routerLink="/checkout"
                class="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100"
              >
                Proceed To Checkout
              </a>
            </aside>
          </div>
        </section>
      </div>
    </ng-container>

    <ng-template #guestState>
      <div class="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(111,78,55,0.12),transparent_24%),#fff9f2]">
        <section class="max-w-3xl mx-auto px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 class="text-4xl font-black tracking-tight text-slate-900">Sign in to view your cart</h1>
          <p class="mt-4 text-base font-medium text-slate-500">
            Your cart is available for customer accounts after login.
          </p>
          <a routerLink="/login" class="btn-primary mt-8 inline-flex !px-6 !py-3">Go To Login</a>
        </section>
      </div>
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
    private cartService: CartService
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
      error: () => {}
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
      error: () => {}
    });
  }

  clearCart(): void {
    this.cartMessage = '';

    this.cartService.clearCart().subscribe({
      next: (response) => {
        this.cartMessage = response?.message || 'Cart cleared successfully.';
      },
      error: () => {}
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

