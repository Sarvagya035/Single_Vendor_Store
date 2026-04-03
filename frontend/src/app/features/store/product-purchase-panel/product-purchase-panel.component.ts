import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';

@Component({
  selector: 'app-product-purchase-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          {{ product?.brand || 'Generic Brand' }}
        </p>
        <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">
          {{ product?.productName }}
        </h1>
        <p class="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          {{ product?.categoryDetails?.name || 'General Category' }}
        </p>
      </div>

      <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-1">
            <span *ngIf="originalPriceLabel && originalPriceLabel !== discountedPriceLabel" class="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
              Product Price
            </span>
            <div class="flex flex-wrap items-center gap-3">
              <span *ngIf="originalPriceLabel && originalPriceLabel !== discountedPriceLabel" class="text-lg font-bold text-slate-400 line-through">
                {{ originalPriceLabel }}
              </span>
              <span class="text-3xl font-black text-slate-900">
                {{ discountedPriceLabel || priceLabel }}
              </span>
            </div>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em]"
            [ngClass]="selectedVariantStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
          >
            {{ selectedVariantStock > 0 ? 'In stock' : 'Out of stock' }}
          </span>
        </div>

        <p class="mt-5 text-sm leading-7 text-slate-600">
          {{ product?.productDescription || 'No description available for this product.' }}
        </p>

        <div class="mt-6 space-y-2" *ngIf="showVariantSelector">
          <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Choose Variant
          </label>
          <select
            class="app-input-soft"
            [ngModel]="selectedVariantId"
            (ngModelChange)="variantChanged.emit($event)"
            [ngModelOptions]="{ standalone: true }"
          >
            <option *ngFor="let variant of variants" [value]="variant._id">
              {{ variantLabels[variant._id || ''] || 'Variant' }}
            </option>
          </select>
        </div>

        <div class="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let attribute of attributes"
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"
            >
              {{ attribute.key }}: {{ attribute.value }}
            </span>
          </div>

          <div class="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
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

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 sm:max-w-[140px]">
            <button
              type="button"
              class="px-4 py-3 text-lg font-black text-slate-600"
              (click)="quantityChanged.emit(quantity - 1)"
              aria-label="Decrease quantity"
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
              class="px-4 py-3 text-lg font-black text-slate-600"
              (click)="quantityChanged.emit(quantity + 1)"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            class="btn-primary !w-full !justify-center !py-3.5"
            [disabled]="!selectedVariant?._id || isAdding"
            (click)="addToCart.emit()"
          >
            {{ isAdding ? 'Adding...' : 'Add To Cart' }}
          </button>
        </div>

        <p class="text-xs font-medium leading-6 text-slate-500">
          You can adjust quantity before adding the selected variant to your cart.
        </p>
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
  @Input() variantLabels: Record<string, string> = {};
  @Input() attributes: Array<{ key: string; value: string }> = [];

  @Output() variantChanged = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<number | string>();
  @Output() addToCart = new EventEmitter<void>();

  get showVariantSelector(): boolean {
    return this.variants.length > 1;
  }

  get selectedVariantStock(): number {
    return this.selectedVariant?.productStock || 0;
  }
}
