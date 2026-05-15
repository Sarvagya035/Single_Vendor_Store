import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';
import {
  buildVariantAttributeGroups,
  getVariantAttributeValue,
  findVariantByAttributes,
  VariantAttributeGroup
} from '../utils/product-detail-variants.helpers';

@Component({
  selector: 'app-product-purchase-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }
  `],
  template: `
    <div class="w-full min-w-0 max-w-full space-y-5 md:space-y-6">
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

      <div class="w-full min-w-0 max-w-full rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.07)] md:rounded-[2rem] md:p-6">
        <div class="flex w-full min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-4">
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

        <div *ngIf="offerBadgeText" class="mt-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {{ offerBadgeText }}
        </div>

        <p class="mt-4 text-[13px] leading-7 text-slate-600 md:mt-5 md:text-sm">
          {{ product?.productDescription || 'No description available for this product.' }}
        </p>

      <div class="mt-6 w-full min-w-0 space-y-3" *ngIf="showVariantSelector">
        
        <ng-container *ngIf="usesGroupedVariantSelector; else flatVariantSelector">
          <div class="space-y-4">
            <div *ngFor="let group of attributeGroups; let groupIndex = index; trackBy: trackByGroup" class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 md:text-[11px]">
                  {{ group.label }}
                </span>
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {{ visibleAttributeValues(groupIndex).length }} options
                </span>
              </div>

              <div class="flex max-w-full min-w-0 flex-wrap gap-1.5">
                <button
                  *ngFor="let value of visibleAttributeValues(groupIndex); trackBy: trackByAttributeValue"
                  type="button"
                  class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                  [ngClass]="isAttributeSelected(group.key, value)
                    ? 'border-[#7a4f35] bg-[#7a4f35] text-white shadow-sm'
                    : 'border-orange-200 bg-white text-slate-600 hover:border-[#7a4f35] hover:text-[#7a4f35]'"
                  (click)="selectAttribute(groupIndex, group.key, value)"
                >
                  {{ value }}
                </button>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #flatVariantSelector>
          <div class="flex max-w-full min-w-0 gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              *ngFor="let variant of variants; let index = index; trackBy: trackByVariant"
              type="button"
              class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
              [disabled]="!variant?._id"
              [ngClass]="isVariantSelected(variant)
                ? 'border-[#7a4f35] bg-[#7a4f35] text-white shadow-sm'
                : 'border-orange-200 bg-white text-slate-600 hover:border-[#7a4f35] hover:text-[#7a4f35]'"
              (click)="variantChanged.emit(variant._id || '')"
            >
              {{ getVariantLabel(variant, index + 1) }}
            </button>
          </div>
        </ng-template>
      </div>

        <div class="mt-5 w-full min-w-0 rounded-2xl bg-slate-50 p-4 md:mt-6">
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let attribute of attributes"
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
            >
              {{ attribute.key }}: {{ attribute.value }}
            </span>
          </div>

          <div class="mt-4 grid min-w-0 gap-3 text-[13px] font-semibold text-slate-600 sm:grid-cols-2 md:text-sm">
            <div>
              SKU:
              <span class="text-slate-900">{{ currentSelectedVariant?.sku || 'N/A' }}</span>
            </div>
            <div>
              Stock:
              <span class="text-slate-900">{{ selectedVariantStock }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mt-5 flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 md:mt-6 md:py-3.5 md:text-sm"
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

        <div class="mt-5 flex w-full min-w-0 flex-col gap-3 md:mt-6 md:flex-row md:flex-wrap md:items-center">
          <div class="flex w-full min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 md:max-w-[140px]">
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

          <div class="flex w-full min-w-0 flex-col gap-3 md:flex-row md:flex-wrap">
            <button
              type="button"
              class="btn-secondary w-full min-w-0 justify-center py-3.5 md:flex-1 md:w-auto"
              [disabled]="!currentSelectedVariant?._id || selectedVariantStock <= 0 || isBuying"
              (click)="buyNow.emit()"
            >
              {{ isBuying ? 'Processing...' : 'Buy Now' }}
            </button>

            <button
              type="button"
              class="btn-primary w-full min-w-0 justify-center py-3.5 md:flex-1 md:w-auto"
              [disabled]="!currentSelectedVariant?._id || selectedVariantStock <= 0 || isAdding"
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
export class ProductPurchasePanelComponent implements OnChanges {
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

  selectedAttributes: Record<string, string> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['variants'] || changes['selectedVariantId']) {
      this.syncSelectedAttributes();
    }
  }

  get showVariantSelector(): boolean {
    return this.variants.length > 1;
  }

  get attributeGroups(): VariantAttributeGroup[] {
    return this.usesGroupedVariantSelector ? buildVariantAttributeGroups(this.variants) : [];
  }

  get usesGroupedVariantSelector(): boolean {
    return this.variants.length > 1 && buildVariantAttributeGroups(this.variants).length > 0 && this.variants.every((variant) => this.hasStructuredAttributes(variant));
  }

  get selectedVariantStock(): number {
    return this.currentSelectedVariant?.productStock || 0;
  }

  get currentSelectedVariant(): CustomerCatalogVariant | undefined {
    const groupedSelection = this.usesGroupedVariantSelector
      ? findVariantByAttributes(this.variants, this.selectedAttributes)
      : undefined;

    return groupedSelection ||
      this.variants.find((variant) => String(variant?._id || '') === String(this.selectedVariantId || '')) ||
      this.variants[0];
  }

  get offerBadgeText(): string {
    const offerText = this.getTextField(this.currentSelectedVariant, ['offerText', 'offerDescription', 'offer']) ||
      this.getTextField(this.product, ['offerText', 'offerDescription', 'offer']);
    if (offerText) {
      return offerText;
    }

    const originalPrice = this.getNumericField(this.currentSelectedVariant, ['productPrice', 'mrp', 'originalPrice', 'price']) ??
      this.getNumericField(this.product, ['basePrice', 'mrp', 'originalPrice', 'price']);
    const discountedPrice = this.getNumericField(this.currentSelectedVariant, ['finalPrice', 'salePrice', 'discountedPrice', 'price']) ??
      this.getNumericField(this.product, ['basePrice', 'salePrice', 'discountedPrice', 'price']);
    const discountPercentage =
      this.getNumericField(this.currentSelectedVariant, ['discountPercentage']) ??
      this.getNumericField(this.product, ['discountPercentage']);

    if (typeof originalPrice === 'number' && typeof discountedPrice === 'number' && originalPrice > discountedPrice) {
      const savedAmount = Math.max(0, Math.round(originalPrice - discountedPrice));
      const percent = Math.max(0, Math.round(((originalPrice - discountedPrice) / originalPrice) * 100));
      const parts: string[] = [];

      if (percent > 0) {
        parts.push(`${percent}% OFF`);
      }

      if (savedAmount > 0) {
        parts.push(`Save ₹${savedAmount}`);
      }

      return parts.length ? parts.join(' · ') : 'Limited time offer';
    }

    if (typeof discountPercentage === 'number' && discountPercentage > 0) {
      return `${Math.round(discountPercentage)}% OFF`;
    }

    return '';
  }

  isVariantSelected(variant: CustomerCatalogVariant): boolean {
    return String(variant?._id || '') === String(this.selectedVariantId || '');
  }

  selectAttribute(groupIndex: number, key: string, value: string): void {
    const nextSelection = { ...this.selectedAttributes, [key]: value };
    this.attributeGroups
      .slice(groupIndex + 1)
      .forEach((group) => {
        delete nextSelection[group.key];
      });

    this.selectedAttributes = nextSelection;
    const matchingVariant = findVariantByAttributes(this.variants, nextSelection);
    if (matchingVariant?._id) {
      this.variantChanged.emit(matchingVariant._id);
    }
  }

  isAttributeSelected(groupKey: string, value: string): boolean {
    return String(this.selectedAttributes[groupKey] || '') === String(value || '');
  }

  visibleAttributeValues(groupIndex: number): string[] {
    const group = this.attributeGroups[groupIndex];
    if (!group) {
      return [];
    }

    const selection: Record<string, string> = {};
    this.attributeGroups.slice(0, groupIndex).forEach((priorGroup) => {
      const selectedValue = this.selectedAttributes[priorGroup.key];
      if (selectedValue) {
        selection[priorGroup.key] = selectedValue;
      }
    });

    const values = new Set<string>();
    for (const variant of this.variants) {
      const matchesPriorSelection = Object.entries(selection).every(([selectedKey, selectedValue]) => {
        return getVariantAttributeValue(variant, selectedKey) === selectedValue;
      });

      if (!matchesPriorSelection) {
        continue;
      }

      const rawValue = getVariantAttributeValue(variant, group.key);
      if (rawValue) {
        values.add(rawValue);
      }
    }

    return Array.from(values);
  }

  trackByGroup(_: number, group: VariantAttributeGroup): string {
    return group.key;
  }

  trackByAttributeValue(_: number, value: string): string {
    return value;
  }

  trackByVariant(_: number, variant: CustomerCatalogVariant): string {
    return variant._id || variant.sku || JSON.stringify(variant.attributes || {});
  }

  variantDisplayLabel(variant: CustomerCatalogVariant | null | undefined, fallbackIndex = 0): string {
    return this.getVariantLabel(variant, fallbackIndex);
  }

  getVariantLabel(variant: CustomerCatalogVariant | null | undefined, fallbackIndex = 0): string {
    return (
      this.getTextField(variant, ['label', 'name', 'weight', 'size', 'title', 'value', 'unit']) ||
      this.getAttributeLabel(variant) ||
      (variant?.sku?.trim() || '') ||
      (fallbackIndex > 0 ? `Option ${fallbackIndex}` : 'Variant')
    );
  }

  private getAttributeLabel(variant: CustomerCatalogVariant | null | undefined): string {
    if (!variant || typeof variant !== 'object') {
      return '';
    }

    const attributes = Object.entries(variant.attributes || {})
      .map(([key, value]) => ({
        key: key.toLowerCase(),
        value: String(value || '').trim()
      }))
      .filter((attribute) => !!attribute.value);

    if (!attributes.length) {
      return '';
    }

    const preferredKeys = ['weight', 'size', 'pack', 'quantity', 'qty', 'count', 'volume', 'capacity', 'title', 'name', 'unit', 'label', 'value'];
    for (const preferredKey of preferredKeys) {
      const match = attributes.find((attribute) => attribute.key.includes(preferredKey));
      if (match?.value) {
        return match.value;
      }
    }

    return attributes.map((attribute) => attribute.value).join(' • ');
  }

  private syncSelectedAttributes(): void {
    const selectedVariant = this.currentSelectedVariant;
    const attributes = selectedVariant?.attributes && typeof selectedVariant.attributes === 'object'
      ? selectedVariant.attributes
      : {};

    this.selectedAttributes = Object.entries(attributes)
      .reduce((acc, [key, value]) => {
        const normalizedKey = String(key || '').trim().toLowerCase();
        const normalizedValue = String(value || '').trim();
        if (normalizedKey && normalizedValue) {
          acc[normalizedKey] = normalizedValue;
        }
        return acc;
      }, {} as Record<string, string>);
  }

  private hasStructuredAttributes(variant: CustomerCatalogVariant | null | undefined): boolean {
    return !!variant && Object.keys(variant.attributes || {}).length > 0;
  }

  private getTextField(
    source: CustomerCatalogVariant | CustomerCatalogProduct | null | undefined,
    keys: string[]
  ): string {
    if (!source || typeof source !== 'object') {
      return '';
    }

    const record = source as Record<string, unknown>;
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return '';
  }

  private getNumericField(
    source: CustomerCatalogVariant | CustomerCatalogProduct | null | undefined,
    keys: string[]
  ): number | null {
    if (!source || typeof source !== 'object') {
      return null;
    }

    const record = source as Record<string, unknown>;
    for (const key of keys) {
      const value = record[key];
      if (value === null || value === undefined || value === '') {
        continue;
      }

      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }

    return null;
  }
}

