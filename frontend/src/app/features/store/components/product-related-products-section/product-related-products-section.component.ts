import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerCatalogProduct } from '../../../../core/models/customer.models';
import { ProductCardComponent, ProductCardVariantActionEvent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-related-products-section',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
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

      <div *ngIf="relatedProducts.length; else noRelatedProducts" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <app-product-card
          *ngFor="let related of relatedProducts; trackBy: trackByProductId"
          [product]="related"
          [isWishlisted]="isWishlistedProduct(related)"
          [wishlistBusy]="wishlistBusyId === related._id"
          [variantCount]="related.variants?.length || 0"
          [isOutOfStock]="related.isActive === false"
          (productClick)="emitProductClick($event)"
          (wishlistToggle)="emitWishlistToggle($event)"
          (addToCart)="emitAddToCart($event)"
          (buyNow)="emitBuyNow($event)"
        />
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
  @Output() addToCart = new EventEmitter<ProductCardVariantActionEvent>();
  @Output() buyNow = new EventEmitter<ProductCardVariantActionEvent>();

  emitProductClick(product: CustomerCatalogProduct): void {
    this.productClick.emit(product);
  }

  emitWishlistToggle(product: CustomerCatalogProduct): void {
    this.wishlistToggle.emit(product);
  }

  emitAddToCart(event: ProductCardVariantActionEvent): void {
    this.addToCart.emit(event);
  }

  emitBuyNow(event: ProductCardVariantActionEvent): void {
    this.buyNow.emit(event);
  }

  isWishlistedProduct(product: CustomerCatalogProduct): boolean {
    return !!product?._id && this.wishlistedProductIds.has(product._id);
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
