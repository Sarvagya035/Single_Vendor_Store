import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerCatalogProduct } from '../../../../core/models/customer.models';

@Component({
  selector: 'app-product-related-products-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mt-10 rounded-[2rem] border border-[#e7dac9] bg-white app-card-body shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
      <div class="flex flex-col gap-2 border-b border-[#f1e4d4] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Similar products</p>
          <h2 class="mt-2 text-2xl font-extrabold text-slate-900">You may also like</h2>
        </div>
        <p class="text-sm font-medium text-slate-500">
          Handpicked from the same dry fruit family and flavor profile.
        </p>
      </div>

      <div *ngIf="relatedProducts.length; else noRelatedProducts" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          *ngFor="let related of relatedProducts; trackBy: trackByProductId"
          role="link"
          tabindex="0"
          (click)="emitProductClick(related)"
          (keydown.enter)="emitProductClick(related)"
          (keydown.space)="$event.preventDefault(); emitProductClick(related)"
          class="group relative rounded-[1.6rem] border border-[#e7dac9] bg-[#fff7ed]/50 p-3 shadow-[0_16px_40px_rgba(111,78,55,0.05)] transition hover:-translate-y-1 hover:border-[#d4a017] hover:bg-white hover:shadow-[0_24px_60px_rgba(111,78,55,0.1)] sm:p-4"
        >
          <button
            type="button"
            class="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-amber-300 hover:bg-white hover:text-rose-600 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
            [disabled]="wishlistBusyId === related._id"
            [attr.aria-label]="isWishlistedProduct(related) ? 'Remove from wishlist' : 'Save to wishlist'"
            (click)="$event.stopPropagation(); emitWishlistToggle(related)"
            [ngClass]="isWishlistedProduct(related) ? 'border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_14px_28px_rgba(244,63,94,0.24)] ring-rose-100' : ''"
          >
            <svg *ngIf="wishlistBusyId !== related._id && !isWishlistedProduct(related)" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
            </svg>
            <svg *ngIf="wishlistBusyId !== related._id && isWishlistedProduct(related)" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
            </svg>
            <span *ngIf="wishlistBusyId === related._id" class="text-[10px] font-black uppercase tracking-[0.18em]">...</span>
          </button>

          <div class="aspect-square overflow-hidden rounded-[1.25rem] border border-[#e7dac9] bg-white">
            <img
              [src]="productImage(related)"
              [alt]="related.productName"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>

          <div class="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">
                  {{ related.brand || 'Dry fruit pack' }}
                </p>
                <h3 class="mt-1 line-clamp-2 text-[11px] font-extrabold text-slate-900 sm:text-lg">
                  {{ related.productName }}
                </h3>
              </div>
              <span class="shrink-0 rounded-full bg-[#f5e6d3] px-2 py-0.5 text-[10px] font-extrabold text-[#6f4e37] shadow-sm ring-1 ring-[#e7dac9] sm:px-3 sm:py-1 sm:text-xs">
                {{ formatCurrency(related.displayVariant?.finalPrice || related.basePrice || 0) }}
              </span>
            </div>

            <p class="text-[10px] font-semibold text-slate-500 sm:text-sm">
              {{ related.categoryDetails?.name || 'Dry fruits & nuts' }}
            </p>
          </div>
        </article>
      </div>

      <ng-template #noRelatedProducts>
        <div class="mt-6 rounded-[1.4rem] border border-dashed border-[#e7dac9] bg-[#fff7ed] px-6 py-10 text-center">
          <h3 class="text-xl font-extrabold text-slate-900">More dry fruits coming soon</h3>
          <p class="mt-3 text-sm font-medium text-slate-500">
            We’re still building out similar item suggestions for this product.
          </p>
        </div>
      </ng-template>
    </section>
  `
})
export class ProductRelatedProductsSectionComponent {
  @Input() relatedProducts: CustomerCatalogProduct[] = [];
  @Input() wishlistBusyId = '';
  @Input() wishlistedProductIds: Set<string> = new Set<string>();

  @Output() productClick = new EventEmitter<CustomerCatalogProduct>();
  @Output() wishlistToggle = new EventEmitter<CustomerCatalogProduct>();

  emitProductClick(product: CustomerCatalogProduct): void {
    this.productClick.emit(product);
  }

  emitWishlistToggle(product: CustomerCatalogProduct): void {
    this.wishlistToggle.emit(product);
  }

  isWishlistedProduct(product: CustomerCatalogProduct): boolean {
    return !!product?._id && this.wishlistedProductIds.has(product._id);
  }

  productImage(product: CustomerCatalogProduct): string {
    return (
      product.displayVariant?.variantImage ||
      product.mainImages?.[0] ||
      'https://via.placeholder.com/640x480?text=Product'
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  trackByProductId(_: number, product: CustomerCatalogProduct): string {
    return product._id;
  }
}
