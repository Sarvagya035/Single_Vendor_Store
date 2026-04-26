import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerCatalogProduct } from '../../../../core/models/customer.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      role="link"
      tabindex="0"
      (click)="productClick.emit(product)"
      (keydown.enter)="productClick.emit(product)"
      (keydown.space)="$event.preventDefault(); productClick.emit(product)"
      class="product-card group relative flex h-full flex-col transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
    >
      <button
        type="button"
        class="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-amber-300 hover:bg-white hover:text-rose-600 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
        [disabled]="wishlistBusy"
        [attr.aria-label]="isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'"
        (click)="$event.stopPropagation(); wishlistToggle.emit(product)"
        [ngClass]="isWishlisted ? 'border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_14px_28px_rgba(244,63,94,0.24)] ring-rose-100' : ''"
      >
        <svg *ngIf="!wishlistBusy && !isWishlisted" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
        </svg>
        <svg *ngIf="!wishlistBusy && isWishlisted" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
        </svg>
        <span *ngIf="wishlistBusy" class="text-[10px] font-black uppercase tracking-[0.18em]">...</span>
      </button>

      <div class="h-32 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-100 sm:h-36">
        <img
          [src]="imageUrl"
          [alt]="product.productName"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div class="mt-2 flex flex-col gap-1.5 pt-2 md:mt-3 md:gap-2 lg:mt-4 lg:gap-3">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-xs">
              {{ product.brand || 'Dry fruit pack' }}
            </p>
            <h2 class="mt-1 line-clamp-1 text-[10px] font-semibold leading-4 text-slate-900 sm:text-[11px] lg:text-lg">
              {{ product.productName }}
            </h2>
          </div>
          <div class="flex shrink-0 items-start">
            <span class="self-start rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-slate-900 shadow-sm ring-1 ring-amber-200 sm:px-2.5 sm:py-1 sm:text-[10px] lg:px-3 lg:text-xs">
              {{ priceText }}
            </span>
          </div>
        </div>

        <p class="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-[10px]">
          {{ product.categoryDetails?.name || 'General Category' }}
        </p>

        <div class="flex items-center gap-1 text-xs">
          <span *ngIf="originalPriceText" class="whitespace-nowrap text-[10px] font-bold text-slate-400 line-through sm:text-xs">
            {{ originalPriceText }}
          </span>
          <span class="whitespace-nowrap text-[10px] font-black text-slate-900 sm:text-xs lg:text-base">
            {{ discountedPriceText }}
          </span>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2 text-[10px] font-black sm:text-xs lg:text-sm">
          <span class="min-w-0 truncate whitespace-nowrap leading-none text-slate-500">
            {{ variantCount }} variant{{ variantCount === 1 ? '' : 's' }}
          </span>
          <button
            type="button"
            [disabled]="isOutOfStock"
            (click)="$event.stopPropagation(); actionClick.emit(product)"
            class="inline-flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-amber-300 bg-[#fff8e6] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#8a4f20] transition hover:bg-[#fff0c2] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:h-8 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.12em] lg:h-auto lg:px-4 lg:py-2 lg:text-xs lg:tracking-[0.14em]"
          >
            <span class="sm:hidden">{{ actionLabelMobile }}</span>
            <span class="hidden sm:inline">{{ actionLabel }}</span>
          </button>
        </div>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: CustomerCatalogProduct;
  @Input() isWishlisted = false;
  @Input() actionLabel = '';
  @Input() wishlistBusy = false;
  @Input() imageUrl = '';
  @Input() originalPriceText = '';
  @Input() discountedPriceText = '';
  @Input() variantCount = 0;
  @Input() isOutOfStock = false;

  @Output() productClick = new EventEmitter<CustomerCatalogProduct>();
  @Output() wishlistToggle = new EventEmitter<CustomerCatalogProduct>();
  @Output() actionClick = new EventEmitter<CustomerCatalogProduct>();

  get actionLabelMobile(): string {
    return this.actionLabel === 'Add To Cart' ? 'Add To Cart' : 'OPTIONS';
  }

  get priceText(): string {
    return this.discountedPriceText;
  }
}
