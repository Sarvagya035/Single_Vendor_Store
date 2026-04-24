import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';

@Component({
  selector: 'app-product-purchase-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 md:space-y-6">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          {{ product?.brand || 'Generic Brand' }}
        </p>
        <h1 class="mt-2 text-[2rem] font-black tracking-tight text-slate-900 md:text-4xl lg:text-[2.75rem]">
          {{ product?.productName }}
        </h1>
        <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:mt-3 md:text-sm">
          {{ product?.categoryDetails?.name || 'General Category' }}
        </p>
      </div>

      <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.07)] md:rounded-[2rem] md:p-6">
        <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-4">
          <div class="flex flex-col gap-1">
            <span *ngIf="originalPriceLabel && originalPriceLabel !== discountedPriceLabel" class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 md:text-sm">
              Product Price
            </span>
            <div class="flex flex-wrap items-center gap-3">
              <span *ngIf="originalPriceLabel && originalPriceLabel !== discountedPriceLabel" class="text-base font-bold text-slate-400 line-through md:text-lg">
                {{ originalPriceLabel }}
              </span>
              <span class="text-2xl font-black text-slate-900 md:text-3xl">
                {{ discountedPriceLabel || priceLabel }}
              </span>
            </div>
          </div>
          <span
            class="w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] md:text-xs"
            [ngClass]="selectedVariantStock > 0 ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-700'"
          >
            {{ selectedVariantStock > 0 ? 'In stock' : 'Out of stock' }}
          </span>
        </div>

        <p class="mt-4 text-[13px] leading-7 text-slate-600 md:mt-5 md:text-sm">
          {{ product?.productDescription || 'No description available for this product.' }}
        </p>

        <div class="mt-6 space-y-2" *ngIf="showVariantSelector">
          <label class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 md:text-[11px]">
            Choose Variant
          </label>
          <select
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white"
            [ngModel]="selectedVariantId"
            (ngModelChange)="variantChanged.emit($event)"
            [ngModelOptions]="{ standalone: true }"
          >
            <option *ngFor="let variant of variants" [value]="variant._id">
              {{ variantLabels[variant._id || ''] || 'Variant' }}
            </option>
          </select>
        </div>

        <div class="mt-5 rounded-2xl bg-slate-50 p-4 md:mt-6">
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let attribute of attributes"
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
            >
              {{ attribute.key }}: {{ attribute.value }}
            </span>
          </div>

          <div class="mt-4 grid gap-3 text-[13px] font-semibold text-slate-600 sm:grid-cols-2 md:text-sm">
            <div>
              SKU:
              <span class="text-slate-900">{{ selectedVariant?.sku || 'N/A' }}</span>
            </div>
            <div>
              Stock:
              <span class="text-slate-900">{{ selectedVariantStock }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 md:mt-6 md:py-3.5 md:text-sm"
          [disabled]="isWishlistBusy"
          [ngClass]="isWishlisted ? 'border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_14px_28px_rgba(244,63,94,0.20)] hover:from-rose-500 hover:to-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-slate-50'"
          (click)="toggleWishlist.emit()"
        >
          <svg *ngIf="!isWishlisted" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
          </svg>
          <svg *ngIf="isWishlisted" viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
          </svg>
          {{ isWishlistBusy ? 'Updating...' : isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist' }}
        </button>

        <div class="mt-5 flex flex-col gap-3 md:mt-6 md:flex-row md:items-center">
          <div class="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 md:max-w-[140px]">
            <button
              type="button"
              class="px-4 py-3 text-base font-black text-slate-600 md:text-lg"
              (click)="quantityChanged.emit(quantity - 1)"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              [ngModel]="quantity"
              (ngModelChange)="quantityChanged.emit($event)"
              [ngModelOptions]="{ standalone: true }"
              class="w-full border-0 bg-transparent px-2 text-center text-sm font-black text-slate-900 outline-none"
            />
            <button
              type="button"
              class="px-4 py-3 text-base font-black text-slate-600 md:text-lg"
              (click)="quantityChanged.emit(quantity + 1)"
            >
              +
            </button>
          </div>

          <div class="flex w-full flex-col gap-3 md:flex-row">
            <button
              type="button"
              class="btn-secondary !w-full !justify-center !py-3.5"
              [disabled]="!selectedVariant?._id || isBuying"
              (click)="buyNow.emit()"
            >
              {{ isBuying ? 'Processing...' : 'Buy Now' }}
            </button>

            <button
              type="button"
              class="btn-primary !w-full !justify-center !py-3.5"
              [disabled]="!selectedVariant?._id || isAdding"
              (click)="addToCart.emit()"
            >
              {{ isAdding ? 'Adding...' : 'Add To Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductPurchasePanelComponent {
  @Input() product: CustomerCatalogProduct | null = null;
  @Input() variants: CustomerCatalogVariant[] = [];
  @Input() selectedVariant?: CustomerCatalogVariant;
  @Input() selectedVariantId = '';
  @Input() priceLabel = '';
  @Input() originalPriceLabel = '';
  @Input() discountedPriceLabel = '';
  @Input() quantity = 1;
  @Input() isAdding = false;
  @Input() isBuying = false;
  @Input() isWishlisted = false;
  @Input() isWishlistBusy = false;
  @Input() variantLabels: Record<string, string> = {};
  @Input() attributes: Array<{ key: string; value: string }> = [];

  @Output() variantChanged = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<number | string>();
  @Output() addToCart = new EventEmitter<void>();
  @Output() buyNow = new EventEmitter<void>();
  @Output() toggleWishlist = new EventEmitter<void>();

  get showVariantSelector(): boolean {
    return this.variants.length > 1;
  }

  get selectedVariantStock(): number {
    return this.selectedVariant?.productStock || 0;
  }
}

