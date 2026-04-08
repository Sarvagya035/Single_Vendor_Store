import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    <div class="min-h-[calc(100vh-64px)] bg-slate-50">
      <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Checkout</p>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">Review and place your order</h1>
            <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              Confirm your delivery address, review your cart total, and complete payment securely.
            </p>
          </div>

          <div class="flex gap-3">
            <a routerLink="/cart" class="btn-secondary !px-5 !py-3">Back To Cart</a>
            <a routerLink="/addresses" class="btn-secondary !px-5 !py-3">Manage Addresses</a>
          </div>
        </div>

        <div *ngIf="successMessage" class="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="mt-10 text-sm font-semibold text-slate-500">Loading checkout details...</div>

        <div *ngIf="!isLoading && cart.cartItems.length === 0" class="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <h2 class="text-2xl font-black text-slate-900">Your cart is empty</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">Add products to your cart before checking out.</p>
          <a routerLink="/" class="btn-primary mt-6 inline-flex !px-6 !py-3">Browse Products</a>
        </div>

        <div *ngIf="!isLoading && cart.cartItems.length" class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section class="space-y-6">
            <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Delivery Address</p>
                  <h2 class="mt-2 text-2xl font-black text-slate-900">Choose where this order should arrive</h2>
                </div>
                <a routerLink="/addresses" class="text-sm font-black text-amber-700">Edit addresses</a>
              </div>

              <div *ngIf="addresses.length === 0" class="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm font-semibold text-slate-500">
                No saved addresses found. Add a delivery address before placing this order.
              </div>

              <div *ngIf="addresses.length" class="mt-5 grid gap-4">
                <label
                  *ngFor="let address of addresses; trackBy: trackByAddress"
                  class="flex cursor-pointer gap-4 rounded-[1.5rem] border p-5 transition"
                  [ngClass]="selectedAddressId === address._id ? 'border-amber-200 bg-amber-50/70' : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'"
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
                      <p class="text-base font-black text-slate-900">{{ address.fullname }}</p>
                      <span *ngIf="address.isDefault" class="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">
                        Default
                      </span>
                    </div>
                    <p class="mt-2 text-sm font-medium leading-6 text-slate-500">
                      {{ formatAddress(address) }}
                    </p>
                    <p class="mt-1 text-sm font-semibold text-slate-700">{{ address.phone }}</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div class="border-b border-slate-100 pb-4">
                <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Order Items</p>
                <h2 class="mt-2 text-2xl font-black text-slate-900">Cart snapshot</h2>
              </div>

              <div class="mt-5 space-y-4">
                <article
                  *ngFor="let item of cart.cartItems; trackBy: trackByCartVariant"
                  class="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4"
                >
                  <img [src]="cartItemImage(item)" [alt]="item.product?.productName || 'Cart item'" class="h-20 w-20 rounded-2xl object-cover" />

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <p class="text-base font-black text-slate-900">{{ item.product?.productName || 'Product' }}</p>
                        <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{{ variantLabel(item) }}</p>
                      </div>
                      <p class="text-sm font-black text-slate-900">x{{ item.quantity || 0 }}</p>
                    </div>

                    <div class="mt-3 flex items-center justify-between text-sm">
                      <span class="font-medium text-slate-500">Line total</span>
                      <span class="font-black text-slate-900">{{ formatCurrency((item.priceAtAddition || 0) * (item.quantity || 0)) }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <aside class="h-fit rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Payment Summary</p>
            <h2 class="mt-3 text-2xl font-black">Secure checkout</h2>

            <div class="mt-6 space-y-3 text-sm font-medium text-slate-300">
              <div class="flex items-center justify-between">
                <span>Items total</span>
                <span>{{ formatCurrency(itemsSubtotal()) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Shipping</span>
                <span>{{ shippingAmount() === 0 ? 'Free' : formatCurrency(shippingAmount()) }}</span>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span class="text-sm font-bold text-slate-300">Total payable</span>
              <span class="text-2xl font-black">{{ formatCurrency(grandTotal()) }}</span>
            </div>

            <button
              type="button"
              class="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="isSubmitting || !selectedAddressId || addresses.length === 0"
              (click)="placeOrder()"
            >
              {{ isSubmitting ? 'Processing Payment...' : 'Pay With Razorpay' }}
            </button>

            <p class="mt-4 text-xs font-medium leading-6 text-slate-400">
              Orders are created with online payment and will appear in your order history right after successful verification.
            </p>
          </aside>
        </div>
      </section>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
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
    this.loadCheckoutData();
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
      error: () => {
        this.isLoading = false;
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

    this.orderService.checkout(payload).subscribe({
      next: (response) => {
        const orderId = response?.data?.orderId;
        const razorOrder = response?.data?.razorOrder;

        if (!orderId || !razorOrder?.id) {
          this.isSubmitting = false;
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
              this.isSubmitting = false;
            }
          }
        });

        razorpay.open();
      },
      error: () => {
        this.isSubmitting = false;
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
          this.isSubmitting = false;
          this.successMessage = 'Payment verified successfully. Redirecting to your orders...';
          this.cartService.resetCart();
          this.router.navigate(['/orders']);
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
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

