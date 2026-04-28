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
      class="product-card group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div class="relative h-[240px] w-full overflow-hidden rounded-t-[10px] bg-slate-50">
        <img
          [src]="mainImageUrl"
          [alt]="displayTitle"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>

        <div
          *ngIf="offerBadgeText"
          class="absolute left-3 top-3 z-10 rounded-full bg-[#f5d9c7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B5538] shadow-sm ring-1 ring-[#f2c9ad]"
        >
          {{ offerBadgeText }}
        </div>

        <button
          type="button"
          class="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.12)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.04] hover:border-amber-300 hover:text-rose-600"
          [disabled]="wishlistBusy"
          [attr.aria-label]="isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'"
          (click)="$event.stopPropagation(); wishlistToggle.emit(product)"
          [ngClass]="isWishlisted ? 'border-rose-200 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_14px_28px_rgba(244,63,94,0.22)]' : ''"
        >
          <svg *ngIf="!wishlistBusy && !isWishlisted" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
          </svg>
          <svg *ngIf="!wishlistBusy && isWishlisted" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M20.8 4.6c-2-1.9-5.1-1.8-7.1.2L12 6.5l-1.7-1.7c-2-2-5.1-2.1-7.1-.2-2.2 2.1-2.2 5.5 0 7.6L12 21l8.8-8.8c2.2-2.1 2.2-5.5 0-7.6Z"></path>
          </svg>
          <span *ngIf="wishlistBusy" class="text-[10px] font-black uppercase tracking-[0.18em]">...</span>
        </button>
      </div>

      <div class="flex flex-1 min-w-0 flex-col gap-3 p-4 sm:gap-3">
        <div class="min-w-0">
          <h2 class="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800 sm:text-base">
            {{ displayTitle }}
          </h2>
        </div>

        <div *ngIf="showVariantSelector" class="min-h-[34px]">
          <div class="flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              *ngFor="let variant of visibleVariants(); let index = index; trackBy: trackByVariant"
              type="button"
              class="inline-flex shrink-0 min-w-0 items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-amber-300"
              [ngClass]="isVariantSelected(variant)
                ? 'border-[#7a4f35] bg-[#7a4f35] text-white shadow-sm'
                : 'border-orange-200 bg-white text-slate-600 hover:border-[#7a4f35] hover:text-[#7a4f35]'"
              [attr.aria-label]="variantLabel(variant)"
              [attr.aria-pressed]="isVariantSelected(variant)"
              (click)="$event.stopPropagation(); selectVariant(variant)"
            >
              <span class="whitespace-nowrap">
                {{ variantDisplayLabel(variant, index + 1) }}
              </span>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex min-w-0 items-baseline gap-1.5">
            <span class="whitespace-nowrap text-base font-bold tracking-tight text-[#8B5538] sm:text-lg">
              {{ discountedPriceLabel }}
            </span>
            <span *ngIf="originalPriceLabel" class="whitespace-nowrap text-xs font-semibold text-slate-400 line-through sm:text-sm">
              {{ originalPriceLabel }}
            </span>
          </div>

          <span
            class="shrink-0 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 sm:text-xs"
            [class.bg-red-50]="!isProductInStock"
            [class.text-red-500]="!isProductInStock"
            [class.bg-emerald-50]="isProductInStock"
            [class.text-emerald-700]="isProductInStock"
          >
            <span class="mr-1 inline-block h-2 w-2 rounded-full bg-current align-middle"></span>
            {{ stockStatusLabel }}
          </span>
        </div>

        <div class="grid w-full min-w-0 grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            [disabled]="!isProductInStock || !selectedVariant"
            (click)="$event.stopPropagation(); addToCart.emit({ product, variant: selectedVariant })"
            class="inline-flex h-9 min-w-0 w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-[#8B5538] px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-white shadow-sm transition hover:bg-[#74452e] sm:text-[11px] md:text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            [class.opacity-50]="!isProductInStock || !selectedVariant"
            [class.cursor-not-allowed]="!isProductInStock || !selectedVariant"
          >
            <span class="inline sm:hidden">{{ isProductInStock ? 'Cart' : 'Out' }}</span>
            <span class="hidden sm:inline">{{ isProductInStock ? 'Add to Cart' : 'Out of Stock' }}</span>
          </button>

          <button
            type="button"
            [disabled]="!isProductInStock || !selectedVariant"
            (click)="$event.stopPropagation(); buyNow.emit({ product, variant: selectedVariant })"
            class="inline-flex h-9 min-w-0 w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-full border border-[#8B5538] bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[#8B5538] transition hover:bg-[#fff7f2] sm:text-[11px] md:text-xs disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
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
    return this.getVariantLabel(variant);
  }

  variantImage(variant: CustomerCatalogVariant): string {
    return variant?.variantImage || this.product?.mainImages?.[0] || 'https://via.placeholder.com/160x160?text=Variant';
  }

  variantDisplayLabel(variant: CustomerCatalogVariant | null | undefined, fallbackIndex = 0): string {
    return this.getVariantLabel(variant, fallbackIndex);
  }

  getVariantLabel(variant: CustomerCatalogVariant | null | undefined, fallbackIndex = 0): string {
    if (!variant) {
      return fallbackIndex > 0 ? `Option ${fallbackIndex}` : 'Variant';
    }

    const directFields = [
      this.getTextFieldValue(variant, 'label'),
      this.getTextFieldValue(variant, 'name'),
      this.getTextFieldValue(variant, 'size'),
      this.getTextFieldValue(variant, 'weight'),
      this.getTextFieldValue(variant, 'unit'),
      this.getTextFieldValue(variant, 'title'),
      this.getTextFieldValue(variant, 'value')
    ];

    const directLabel = directFields.find((value) => !!value);
    if (directLabel) {
      return this.normalizeVariantLabel(directLabel);
    }

    const labelFromAttributes = this.variantLabelFromAttributes(variant);
    if (labelFromAttributes) {
      return this.normalizeVariantLabel(labelFromAttributes);
    }

    if (variant.sku?.trim()) {
      return variant.sku.trim();
    }

    return fallbackIndex > 0 ? `Option ${fallbackIndex}` : 'Variant';
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

  private getTextFieldValue(
    source: CustomerCatalogVariant | null | undefined,
    key: string
  ): string {
    const raw = this.getFieldValue(source, key);
    return typeof raw === 'string' || typeof raw === 'number' ? String(raw).trim() : '';
  }

  private normalizeVariantLabel(label: string): string {
    const normalized = label.trim().replace(/\s+/g, ' ');
    return normalized ? normalized.toUpperCase() : label;
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
