import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { ErrorService } from '../../core/services/error.service';
import { OrderService } from '../../core/services/order.service';
import { CustomerAddress, CustomerCart } from '../../core/models/customer.models';
import { OrderCheckoutPayload } from '../../core/models/order.models';
import { environment } from '../../../environments/environment';

const EMPTY_CART: CustomerCart = {
  cartItems: [],
  totalCartPrice: 0,
  alerts: null
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="mt-4 space-y-6 px-4 sm:mt-5 sm:px-6 lg:mt-6 lg:px-8">
      <div class="app-shell-width">
        <div class="vendor-page-shell overflow-hidden">
          <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div class="max-w-2xl">
                <p class="app-page-eyebrow !text-amber-700">Checkout</p>
                <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">Review and place your order</h1>
              </div>

              <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a routerLink="/cart" class="btn-secondary w-full !px-5 !py-3 sm:w-auto">Back to Cart</a>
                <a routerLink="/addresses" class="btn-secondary w-full !px-5 !py-3 sm:w-auto">Manage Addresses</a>
              </div>
            </div>
          </div>

          <div class="border-b border-slate-200 bg-gradient-to-r from-white via-[#fffaf5] to-white px-4 py-4 sm:px-5 lg:px-6">
            <div class="grid gap-3 rounded-[1.4rem] border border-[#eadcc9] bg-white p-4 shadow-[0_12px_32px_rgba(111,78,55,0.05)] md:grid-cols-3">
              <div class="flex items-center gap-3 rounded-[1.1rem] bg-[#fffaf5] px-3 py-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f4e37] text-xs font-black text-white">1</span>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Step 1</p>
                  <p class="text-sm font-semibold text-slate-900">Select address</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-[1.1rem] bg-[#fffaf5] px-3 py-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f4e37] text-xs font-black text-white">2</span>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Step 2</p>
                  <p class="text-sm font-semibold text-slate-900">Review items</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-[1.1rem] bg-[#fffaf5] px-3 py-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f4e37] text-xs font-black text-white">3</span>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Step 3</p>
                  <p class="text-sm font-semibold text-slate-900">Pay securely</p>
                </div>
              </div>
            </div>
          </div>

        <div *ngIf="successMessage" class="mt-6 rounded-[1.5rem] border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-800">
            {{ successMessage }}
          </div>

          <div *ngIf="isLoading" class="px-4 py-6 text-sm font-medium text-slate-500 sm:px-5 lg:px-6">Loading checkout details...</div>

          <div *ngIf="!isLoading && cart.cartItems.length === 0" class="bg-[#fffdfa] px-4 py-6 sm:px-5 lg:px-6">
            <div class="rounded-[2rem] border border-dashed border-[#e7dac9] bg-white px-8 py-16 text-center shadow-[0_18px_50px_rgba(111,78,55,0.05)]">
              <h2 class="text-2xl font-medium text-slate-900">Your cart is empty</h2>
              <p class="mt-3 text-sm font-medium text-slate-500">Add products to your cart before checking out.</p>
              <a routerLink="/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">Browse Products</a>
            </div>
          </div>

          <div *ngIf="!isLoading && cart.cartItems.length" class="px-4 pb-2 sm:px-5 lg:hidden lg:px-6">
            <div class="rounded-[1.6rem] border border-[#e7dac9] bg-white p-4 shadow-[0_16px_40px_rgba(111,78,55,0.06)]">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Checkout total</p>
                  <p class="mt-1 text-base font-semibold text-slate-900">{{ cartItemCount() }} item{{ cartItemCount() === 1 ? '' : 's' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Payable now</p>
                  <p class="mt-1 text-2xl font-black tracking-tight text-slate-900">{{ formatCurrency(grandTotal()) }}</p>
                </div>
              </div>

              <div class="mt-4 grid gap-2 rounded-[1.3rem] bg-[#fffaf5] px-4 py-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-slate-500">Items total</span>
                  <span class="font-semibold text-slate-900">{{ formatCurrency(itemsSubtotal()) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium text-slate-500">Shipping</span>
                  <span class="font-semibold text-slate-900">{{ shippingAmount() === 0 ? 'Free' : formatCurrency(shippingAmount()) }}</span>
                </div>
              </div>

              <button
                type="button"
                class="btn-primary mt-4 w-full !px-4 !py-3 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="isSubmitting || !selectedAddressId || addresses.length === 0"
                (click)="placeOrder()"
              >
                {{ isSubmitting ? 'Processing Payment...' : 'Pay With Razorpay' }}
              </button>
            </div>
          </div>

          <div *ngIf="!isLoading && cart.cartItems.length" class="grid gap-5 bg-[#fffdfa] p-4 sm:p-5 lg:grid-cols-[minmax(0,1.75fr)_360px] lg:p-6">
            <div class="space-y-5">
              <section class="rounded-[2rem] border border-[#e7dac9] bg-white p-5 shadow-[0_18px_50px_rgba(111,78,55,0.05)] sm:p-6">
                <div class="flex flex-col gap-3 border-b border-[#f1e4d4] pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p class="text-xs font-medium uppercase tracking-[0.24em] text-amber-700">Delivery Address</p>
                    <h2 class="mt-2 text-2xl font-medium tracking-tight text-slate-900">Choose where this order should arrive</h2>
                  </div>
                  <a routerLink="/addresses" class="text-sm font-medium text-amber-700">Edit addresses</a>
                </div>

                <div *ngIf="addresses.length === 0" class="mt-5 rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-[#fffaf5] px-5 py-6 text-sm font-medium text-slate-500">
                  No saved addresses found. Add a delivery address before placing this order.
                </div>

                <div *ngIf="addresses.length" class="mt-5 grid gap-4">
                  <label
                    *ngFor="let address of addresses; trackBy: trackByAddress"
                    class="flex cursor-pointer flex-col gap-4 rounded-[1.5rem] border p-5 transition sm:flex-row"
                    [ngClass]="selectedAddressId === address._id ? 'border-[#d4a017] bg-[#fffaf5] shadow-[0_10px_25px_rgba(111,78,55,0.06)]' : 'border-[#e7dac9] bg-white hover:border-[#d4a017]'"
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      class="mt-1 h-4 w-4 border-slate-300 text-amber-700"
                      [value]="address._id"
                      [(ngModel)]="selectedAddressId"
                    />

                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-base font-medium text-slate-900">{{ address.fullname }}</p>
                        <span *ngIf="address.isDefault" class="rounded-full bg-[#f5e6d3] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6f4e37]">
                          Default
                        </span>
                      </div>
                      <p class="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {{ formatAddress(address) }}
                      </p>
                      <p class="mt-1 text-sm font-medium text-slate-700">{{ address.phone }}</p>
                    </div>
                  </label>
                </div>
              </section>

              <section class="rounded-[2rem] border border-[#e7dac9] bg-white p-5 shadow-[0_18px_50px_rgba(111,78,55,0.05)] sm:p-6">
                <div class="border-b border-[#f1e4d4] pb-4">
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-amber-700">Order Items</p>
                  <h2 class="mt-2 text-2xl font-medium tracking-tight text-slate-900">Cart snapshot</h2>
                </div>

                <div class="mt-5 space-y-4">
                  <article
                    *ngFor="let item of cart.cartItems; trackBy: trackByCartVariant"
                    class="flex flex-col gap-4 rounded-[1.5rem] border border-[#e7dac9] bg-[#fffaf5] p-4 sm:flex-row"
                  >
                    <img
                      [src]="cartItemImage(item)"
                      [alt]="item.product?.productName || 'Cart item'"
                      loading="lazy"
                      decoding="async"
                      class="h-20 w-full rounded-2xl object-cover sm:w-20"
                    />

                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <p class="text-base font-medium text-slate-900">{{ item.product?.productName || 'Product' }}</p>
                          <p class="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{{ variantLabel(item) }}</p>
                        </div>
                        <p class="text-sm font-medium text-slate-900">x{{ item.quantity || 0 }}</p>
                      </div>

                      <div class="mt-3 flex items-center justify-between text-sm">
                        <span class="font-medium text-slate-500">Line total</span>
                        <span class="font-medium text-slate-900">{{ formatCurrency((item.priceAtAddition || 0) * (item.quantity || 0)) }}</span>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            </div>

            <aside class="hidden space-y-5 lg:block lg:sticky lg:top-6 lg:self-start">
              <div class="rounded-[2rem] border border-[#e7dac9] bg-white p-5 shadow-[0_18px_50px_rgba(111,78,55,0.05)] sm:p-6">
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-amber-700">Payment Summary</p>
                <h2 class="mt-2 text-2xl font-medium tracking-tight text-slate-900">Secure checkout</h2>

                <div class="mt-6 space-y-3 rounded-[1.5rem] border border-slate-200 bg-[#fffaf5] p-4 text-sm text-slate-700">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-slate-500">Items total</span>
                    <span class="font-medium text-slate-900">{{ formatCurrency(itemsSubtotal()) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-slate-500">Shipping</span>
                    <span class="font-medium text-slate-900">{{ shippingAmount() === 0 ? 'Free' : formatCurrency(shippingAmount()) }}</span>
                  </div>
                  <div class="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span class="font-medium text-slate-500">Total payable</span>
                    <span class="text-2xl font-medium tracking-tight text-slate-900">{{ formatCurrency(grandTotal()) }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn-primary mt-5 w-full !px-4 !py-3 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="isSubmitting || !selectedAddressId || addresses.length === 0"
                  (click)="placeOrder()"
                >
                  {{ isSubmitting ? 'Processing Payment...' : 'Pay With Razorpay' }}
                </button>

                <p class="mt-4 text-xs font-medium leading-6 text-slate-500">
                  Orders are created with online payment and will appear in your order history right after successful verification.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly pendingPaymentKey = 'checkoutPendingPayment';
  private readonly pendingPaymentTimeoutMs = 2 * 60 * 1000;
  private pendingPaymentTimer: ReturnType<typeof setTimeout> | null = null;
  cart: CustomerCart = EMPTY_CART;
  addresses: CustomerAddress[] = [];
  selectedAddressId = '';
  isLoading = false;
  isSubmitting = false;
  successMessage = '';

  constructor(
    private cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private errorService: ErrorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.restorePendingPaymentState();
    this.loadCheckoutData();
  }

  ngOnDestroy(): void {
    this.clearPendingPaymentTimer();
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.recoverStalePaymentState();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.recoverStalePaymentState();
    }
  }

  loadCheckoutData(): void {
    this.isLoading = true;

    forkJoin({
      cart: this.cartService.getCart(),
      addresses: this.addressService.getAddresses()
    }).subscribe({
      next: ({ cart, addresses }) => {
        this.isLoading = false;
        this.cart = this.cartService.currentCart;
        this.addresses = Array.isArray(addresses?.data) ? addresses.data : [];
        const defaultAddress = this.addresses.find((address) => address.isDefault);
        this.selectedAddressId = defaultAddress?._id || this.addresses[0]?._id || '';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to load checkout details right now.',
          'error'
        );
      }
    });
  }

  placeOrder(): void {
    const selectedAddress = this.addresses.find((address) => address._id === this.selectedAddressId);
    const payload = this.buildCheckoutPayload(selectedAddress);

    if (!payload) {
      this.errorService.showToast('Please choose a valid delivery address before placing the order.', 'error');
      return;
    }

    const RazorpayCheckout = (window as any).Razorpay;
    if (!RazorpayCheckout) {
      this.errorService.showToast('Razorpay checkout failed to load. Please refresh and try again.', 'error');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.setPendingPaymentState();

    this.orderService.checkout(payload).subscribe({
      next: (response) => {
        const orderId = response?.data?.orderId;
        const razorOrder = response?.data?.razorOrder;

        if (!orderId || !razorOrder?.id) {
          this.isSubmitting = false;
          this.clearPendingPaymentState();
          this.errorService.showToast('Unable to initialize payment for this order.', 'error');
          return;
        }

        const razorpay = new RazorpayCheckout({
          key: environment.razorpayKeyId,
          amount: razorOrder.amount,
          currency: razorOrder.currency,
          name: 'E-Commerce',
          description: 'Order payment',
          order_id: razorOrder.id,
          prefill: {
            name: selectedAddress?.fullname || '',
            contact: selectedAddress?.phone || ''
          },
          notes: {
            orderId
          },
          theme: {
            color: '#4f46e5'
          },
          handler: (paymentResponse: any) => {
            this.verifyPayment(orderId, paymentResponse);
          },
          modal: {
            ondismiss: () => {
              this.clearPendingPaymentState();
            }
          }
        });

        razorpay.open();
      },
      error: (error) => {
        this.clearPendingPaymentState();
        this.errorService.showToast(
          this.errorService.extractErrorMessage(error) || 'Unable to start checkout right now.',
          'error'
        );
      }
    });
  }

  verifyPayment(orderId: string, paymentResponse: any): void {
    this.orderService
      .verifyPayment({
        orderId,
        razorpay_order_id: paymentResponse?.razorpay_order_id,
        razorpay_payment_id: paymentResponse?.razorpay_payment_id,
        razorpay_signature: paymentResponse?.razorpay_signature
      })
      .subscribe({
        next: () => {
          this.clearPendingPaymentState();
          this.successMessage = 'Payment verified successfully. Redirecting to your orders...';
          this.cartService.resetCart();
          this.router.navigate(['/orders']);
        },
        error: (error) => {
          this.clearPendingPaymentState();
          this.errorService.showToast(
            this.errorService.extractErrorMessage(error) || 'Payment verification failed. Please try again.',
            'error'
          );
        }
      });
  }

  private setPendingPaymentState(): void {
    this.clearPendingPaymentTimer();
    sessionStorage.setItem(
      this.pendingPaymentKey,
      JSON.stringify({
        createdAt: Date.now()
      })
    );
    this.pendingPaymentTimer = window.setTimeout(() => {
      this.recoverStalePaymentState(true);
    }, this.pendingPaymentTimeoutMs);
  }

  private clearPendingPaymentState(): void {
    this.clearPendingPaymentTimer();
    sessionStorage.removeItem(this.pendingPaymentKey);
    this.isSubmitting = false;
  }

  private clearPendingPaymentTimer(): void {
    if (this.pendingPaymentTimer !== null) {
      window.clearTimeout(this.pendingPaymentTimer);
      this.pendingPaymentTimer = null;
    }
  }

  private restorePendingPaymentState(): void {
    const raw = sessionStorage.getItem(this.pendingPaymentKey);

    if (!raw) {
      this.isSubmitting = false;
      return;
    }

    const pendingAt = this.extractPendingTimestamp(raw);
    const expired = !pendingAt || Date.now() - pendingAt >= this.pendingPaymentTimeoutMs;

    if (expired) {
      this.clearPendingPaymentState();
      return;
    }

    this.isSubmitting = true;
    this.clearPendingPaymentTimer();
    this.pendingPaymentTimer = window.setTimeout(() => {
      this.recoverStalePaymentState(true);
    }, this.pendingPaymentTimeoutMs - (Date.now() - pendingAt));
  }

  private recoverStalePaymentState(force = false): void {
    const raw = sessionStorage.getItem(this.pendingPaymentKey);

    if (!raw) {
      this.isSubmitting = false;
      return;
    }

    const pendingAt = this.extractPendingTimestamp(raw);
    const expired = !pendingAt || Date.now() - pendingAt >= this.pendingPaymentTimeoutMs;

    if (force || expired) {
      this.clearPendingPaymentState();
    }
  }

  private extractPendingTimestamp(raw: string): number | null {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed?.createdAt === 'number' ? parsed.createdAt : null;
    } catch {
      return null;
    }
  }

  buildCheckoutPayload(address?: CustomerAddress): OrderCheckoutPayload | null {
    if (!address || !this.cart.cartItems.length) {
      return null;
    }

    const orderItems = this.cart.cartItems
      .map((item) => ({
        product: item.product?._id || '',
        variantId: item.variantId || '',
        quantity: Number(item.quantity || 0),
        priceAtAddition: Number(item.priceAtAddition || 0)
      }))
      .filter((item) => item.product && item.variantId && item.quantity > 0);

    if (!orderItems.length) {
      return null;
    }

    return {
      orderItems,
      shippingAddress: {
        address: [address.addressLine1, address.addressLine2].filter(Boolean).join(', '),
        city: address.city,
        pincode: address.postalCode,
        phone: address.phone
      }
    };
  }

  formatAddress(address: CustomerAddress): string {
    return [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country
    ]
      .filter(Boolean)
      .join(', ');
  }

  itemsSubtotal(): number {
    return (this.cart.cartItems || []).reduce(
      (total, item) => total + Number(item.priceAtAddition || 0) * Number(item.quantity || 0),
      0
    );
  }

  cartItemCount(): number {
    return (this.cart.cartItems || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }

  shippingAmount(): number {
    return this.itemsSubtotal() > 1000 ? 0 : 50;
  }

  grandTotal(): number {
    return this.itemsSubtotal() + this.shippingAmount();
  }

  variantLabel(item: any): string {
    const variant = item?.product?.variants?.find((entry: any) => entry._id === item.variantId);
    const attributes = Object.entries(variant?.attributes || {}).map(([key, value]) => `${key}: ${value}`);
    return attributes.length ? attributes.join(' | ') : variant?.sku || 'Variant';
  }

  cartItemImage(item: any): string {
    const variant = item?.product?.variants?.find((entry: any) => entry._id === item.variantId);
    return variant?.variantImage || item?.product?.mainImages?.[0] || 'https://via.placeholder.com/120?text=Item';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  trackByAddress(_: number, address: CustomerAddress): string {
    return address._id || address.addressLine1;
  }

  trackByCartVariant(index: number, item: any): string {
    return item.variantId || item.product?._id || String(index);
  }
}

