import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../../core/models/customer.models';
import { StoreProductVariantService } from '../../../../core/services/store-product-variant.service';

export interface ProductCardVariantActionEvent {
  product: CustomerCatalogProduct;
  variant: CustomerCatalogVariant | null;
}

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
      class="product-card group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-orange-100/70 bg-white shadow-[0_12px_35px_rgba(139,94,60,0.08)] transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer hover:shadow-[0_18px_45px_rgba(139,94,60,0.14)] cursor-pointer"
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

      <div class="relative w-full overflow-hidden bg-gradient-to-br from-orange-50/50 to-white">
        <div
          *ngIf="offerBadgeText"
          class="absolute left-3 top-3 z-10 rounded-full bg-[#8b5e3c] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(139,94,60,0.2)]"
        >
          {{ offerBadgeText }}
        </div>
        <div
          *ngIf="displayRatingValue"
          class="absolute left-3 top-12 z-10 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold text-amber-700 shadow-[0_10px_22px_rgba(15,23,42,0.10)] backdrop-blur"
        >
          <span aria-hidden="true">★</span>
          <span>{{ displayRatingValue }}</span>
        </div>
        <img
          [src]="mainImageUrl"
          [alt]="displayTitle"
          loading="lazy"
          decoding="async"
          class="h-40 w-full rounded-t-[10px] object-cover transition duration-300 group-hover:scale-105 sm:h-48 lg:h-60"
        />
      </div>

      <div class="flex flex-col gap-2 p-4 md:gap-2 lg:gap-3">
        <div class="flex flex-col gap-1.5">
          <div class="min-w-0 flex-1">
            <h2 class="min-h-[40px] line-clamp-2 text-base font-semibold leading-5 text-slate-950 sm:text-[17px]">
              {{ displayTitle }}
            </h2>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
              <span class="whitespace-nowrap text-lg font-black tracking-tight text-slate-900">
                {{ discountedPriceLabel }}
              </span>
              <span *ngIf="originalPriceLabel" class="whitespace-nowrap text-sm font-semibold text-slate-400 line-through">
                {{ originalPriceLabel }}
              </span>
            </div>
            <span
              class="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              [class.bg-emerald-50]="isProductInStock"
              [class.text-emerald-600]="isProductInStock"
              [class.bg-red-50]="!isProductInStock"
              [class.text-red-500]="!isProductInStock"
            >
              {{ stockStatusLabel }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {{ displayVariantCountText }}
          </span>
        </div>

        <div *ngIf="showVariantSelector" class="space-y-1.5">
          <div class="flex flex-wrap gap-1">
            <button
              *ngFor="let variant of visibleVariants(); let index = index; trackBy: trackByVariant"
              type="button"
              class="rounded-full border px-2 py-1 text-[10px] transition focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-3 sm:py-1.5 sm:text-[11px]"
              [class.border-orange-500]="isVariantSelected(variant)"
              [class.bg-orange-50]="isVariantSelected(variant)"
              [class.text-orange-700]="isVariantSelected(variant)"
              [class.font-bold]="isVariantSelected(variant)"
              [class.ring-1]="isVariantSelected(variant)"
              [class.ring-orange-300]="isVariantSelected(variant)"
              [class.border-orange-200]="!isVariantSelected(variant)"
              [class.bg-white]="!isVariantSelected(variant)"
              [class.text-slate-600]="!isVariantSelected(variant)"
              [class.font-semibold]="!isVariantSelected(variant)"
              [attr.aria-label]="variantLabel(variant)"
              [attr.aria-pressed]="isVariantSelected(variant)"
              (click)="$event.stopPropagation(); selectVariant(variant)"
            >
              <span *ngIf="isVariantSelected(variant)" class="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white">
                ✓
              </span>
              <span class="whitespace-nowrap">
                {{ variantDisplayLabel(variant, index + 1) }}
              </span>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            type="button"
            [disabled]="!isProductInStock || !selectedVariant"
            (click)="$event.stopPropagation(); addToCart.emit({ product, variant: selectedVariant })"
            class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-[12px] bg-[#7a4f35] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#6a422c] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            [class.opacity-50]="!isProductInStock || !selectedVariant"
            [class.cursor-not-allowed]="!isProductInStock || !selectedVariant"
          >
            {{ isProductInStock ? 'Add To Cart' : 'Out of Stock' }}
          </button>

          <button
            type="button"
            [disabled]="!isProductInStock || !selectedVariant"
            (click)="$event.stopPropagation(); buyNow.emit({ product, variant: selectedVariant })"
            class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-[12px] border border-amber-400 bg-amber-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a4f35] transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            [class.opacity-50]="!isProductInStock || !selectedVariant"
            [class.cursor-not-allowed]="!isProductInStock || !selectedVariant"
          >
            {{ isProductInStock ? 'Buy Now' : 'Out of Stock' }}
          </button>
        </div>
      </div>
    </article>
  `
})
export class ProductCardComponent implements OnChanges {
  @Input({ required: true }) product!: CustomerCatalogProduct;
  @Input() image = '';
  @Input() title = '';
  @Input() price: number | string | null = null;
  @Input() originalPrice: number | string | null = null;
  @Input() discount: number | string | null = null;
  @Input() options: string[] = [];
  @Input() stockStatus = '';
  @Input() rating: number | string | null = null;
  @Input() isWishlisted = false;
  @Input() wishlistBusy = false;
  @Input() originalPriceText = '';
  @Input() discountedPriceText = '';
  @Input() variantCount = 0;
  @Input() isOutOfStock = false;

  @Output() productClick = new EventEmitter<CustomerCatalogProduct>();
  @Output() wishlistToggle = new EventEmitter<CustomerCatalogProduct>();
  @Output() addToCart = new EventEmitter<ProductCardVariantActionEvent>();
  @Output() buyNow = new EventEmitter<ProductCardVariantActionEvent>();

  private selectedVariantId = '';
  private readonly currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  constructor(private variantService: StoreProductVariantService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.initializeSelectedVariant();
    }
  }

  get selectedVariant(): CustomerCatalogVariant | null {
    return this.variantService.getSelectedVariant(this.product || undefined, this.selectedVariantId);
  }

  get mainImageUrl(): string {
    return (
      this.image ||
      this.variantService.getProductImage(this.product || undefined, this.selectedVariant) ||
      'https://via.placeholder.com/640x640?text=Product'
    );
  }

  get discountedPriceLabel(): string {
    if (this.price !== null && this.price !== undefined && this.price !== '') {
      return this.formatPriceValue(this.price);
    }

    return this.currencyFormatter.format(this.variantService.getProductPrice(this.product || undefined, this.selectedVariant));
  }

  get originalPriceLabel(): string {
    if (this.originalPrice !== null && this.originalPrice !== undefined && this.originalPrice !== '') {
      const originalValue = this.formatPriceValue(this.originalPrice);
      const discountedValue = this.discountedPriceLabel;
      if (originalValue && originalValue !== discountedValue) {
        return originalValue;
      }
    }

    const selected = this.selectedVariant;
    const original = Number(selected?.productPrice || this.product?.basePrice || 0);
    const discounted = Number(selected?.finalPrice || this.product?.basePrice || 0);

    if (!original || original <= discounted) {
      return '';
    }

    return this.currencyFormatter.format(original);
  }

  get offerBadgeText(): string {
    if (this.discount !== null && this.discount !== undefined && this.discount !== '') {
      if (typeof this.discount === 'string') {
        return this.discount.trim();
      }

      const numericDiscount = Number(this.discount);
      if (!Number.isNaN(numericDiscount) && numericDiscount > 0) {
        return `${Math.round(numericDiscount)}% OFF`;
      }
    }

    const selected = this.selectedVariant;
    const original = Number(selected?.productPrice || this.product?.basePrice || 0);
    const discounted = Number(selected?.finalPrice || this.product?.basePrice || 0);
    const computedDiscount = original > discounted && original > 0
      ? Math.round(((original - discounted) / original) * 100)
      : Number(selected?.discountPercentage || 0);

    return computedDiscount > 0 ? `${computedDiscount}% OFF` : 'Offer';
  }

  get showVariantSelector(): boolean {
    return this.visibleVariants().length > 0 || this.options.length > 0;
  }

  get variantCountText(): string {
    const count = this.variantCount || this.visibleVariants().length;
    return `${count} option${count === 1 ? '' : 's'}`;
  }

  get displayVariantCountText(): string {
    const count = this.variantCount || this.visibleVariants().length || this.options.length;
    return `${count} option${count === 1 ? '' : 's'}`;
  }

  get isUnavailable(): boolean {
    return !this.isProductInStock;
  }

  get stockStatusLabel(): string {
    if (this.stockStatus.trim()) {
      return this.stockStatus.trim();
    }

    return this.isProductInStock ? 'In Stock' : 'Out of Stock';
  }

  get displayTitle(): string {
    return this.title || this.product?.productName || 'Product';
  }

  get displayRatingValue(): string {
    const source = this.rating ?? this.product?.averageRating;
    const numeric = Number(source);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return '';
    }

    return numeric.toFixed(1);
  }

  get isProductInStock(): boolean {
    if (this.product?.isActive === false) {
      return false;
    }

    const stock = this.getSelectedStock(this.product);
    if (stock === null) {
      return true;
    }

    return stock > 0;
  }

  visibleVariants(): CustomerCatalogVariant[] {
    return this.variantService.getVariants(this.product || undefined);
  }

  selectVariant(variant: CustomerCatalogVariant): void {
    this.selectedVariantId = String(variant?._id || '').trim();
  }

  variantLabel(variant: CustomerCatalogVariant): string {
    return this.variantDisplayLabel(variant);
  }

  variantImage(variant: CustomerCatalogVariant): string {
    return variant?.variantImage || this.product?.mainImages?.[0] || 'https://via.placeholder.com/160x160?text=Variant';
  }

  variantDisplayLabel(variant: CustomerCatalogVariant | null | undefined, fallbackIndex = 0): string {
    if (!variant) {
      return fallbackIndex > 0 ? `Variant ${fallbackIndex}` : 'Variant';
    }

    const labelFromAttributes = this.variantLabelFromAttributes(variant);
    if (labelFromAttributes) {
      return labelFromAttributes;
    }

    if (variant.sku?.trim()) {
      return variant.sku.trim();
    }

    return fallbackIndex > 0 ? `Variant ${fallbackIndex}` : 'Variant';
  }

  isVariantSelected(variant: CustomerCatalogVariant): boolean {
    return String(variant?._id || '') === this.selectedVariantId;
  }

  indexOfVariant(variant: CustomerCatalogVariant | null | undefined): number {
    const variants = this.visibleVariants();
    const variantId = String(variant?._id || '').trim();
    if (!variantId) {
      return -1;
    }

    return variants.findIndex((item) => String(item._id || '').trim() === variantId);
  }

  trackByVariant(_: number, variant: CustomerCatalogVariant): string {
    return variant._id || variant.sku || JSON.stringify(variant.attributes || {});
  }

  getSelectedStock(product: CustomerCatalogProduct | null | undefined): number | null {
    const variant = this.selectedVariant;
    const variantStock = this.getFirstDefinedNumber([
      this.getFieldValue(variant, 'stock'),
      this.getFieldValue(variant, 'quantity'),
      this.getFieldValue(variant, 'stockQuantity'),
      this.getFieldValue(variant, 'availableStock'),
      this.getFieldValue(variant, 'productStock')
    ]);

    if (variantStock !== null) {
      return variantStock;
    }

    const productStock = this.getFirstDefinedNumber([
      this.getFieldValue(product, 'stock'),
      this.getFieldValue(product, 'quantity'),
      this.getFieldValue(product, 'stockQuantity'),
      this.getFieldValue(product, 'availableStock'),
      this.getFieldValue(product, 'inventory'),
      this.getFieldValue(product, 'inStock')
    ]);

    return productStock;
  }

  private initializeSelectedVariant(): void {
    const defaultVariant = this.variantService.getSelectedVariant(this.product || undefined, this.selectedVariantId);
    this.selectedVariantId = defaultVariant?._id || '';

    if (!this.selectedVariantId) {
      const firstVariant = this.visibleVariants()[0];
      this.selectedVariantId = firstVariant?._id || '';
    }
  }

  private formatPriceValue(value: number | string): string {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return this.currencyFormatter.format(numeric);
    }

    return String(value);
  }

  private variantLabelFromAttributes(variant: CustomerCatalogVariant): string {
    const attributes = Object.entries(variant.attributes || {})
      .map(([key, value]) => ({
        key: key.toLowerCase(),
        value: String(value || '').trim()
      }))
      .filter((attribute) => !!attribute.value);

    if (!attributes.length) {
      return '';
    }

    const preferredKeys = ['weight', 'size', 'pack', 'quantity', 'qty', 'count', 'volume', 'capacity', 'title'];
    for (const preferredKey of preferredKeys) {
      const match = attributes.find((attribute) => attribute.key.includes(preferredKey));
      if (match?.value) {
        return match.value;
      }
    }

    return attributes.map((attribute) => attribute.value).join(' • ');
  }

  private getFieldValue(
    source: CustomerCatalogVariant | CustomerCatalogProduct | null | undefined,
    key: string
  ): string | number | boolean | null | undefined {
    if (!source || typeof source !== 'object') {
      return undefined;
    }

    return (source as Record<string, string | number | boolean | null | undefined>)[key];
  }

  private getFirstDefinedNumber(values: Array<number | string | boolean | null | undefined>): number | null {
    for (const value of values) {
      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }

      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }

    return null;
  }
}
