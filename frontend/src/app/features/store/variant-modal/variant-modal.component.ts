import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';
import { StoreProductVariantService } from '../../../core/services/store-product-variant.service';

export interface VariantModalAddToCartEvent {
  productId: string;
  variantId: string;
  quantity: number;
}

@Component({
  selector: 'app-variant-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="product && (open || isClosing)" class="fixed inset-0 z-[120] overflow-hidden">
      <button
        type="button"
        [ngClass]="overlayStateClasses()"
        (click)="requestClose()"
        aria-label="Close variant selector"
      ></button>

      <div class="absolute inset-x-0 bottom-0 flex items-end justify-center sm:inset-0 sm:px-4 sm:py-6 sm:items-center">
        <div
          [ngClass]="panelStateClasses()"
        >
          <div class="sm:hidden mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300/80"></div>

          <button
            type="button"
            class="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:text-slate-900"
            (click)="requestClose()"
            aria-label="Close modal"
          >
            ×
          </button>

          <div class="flex-1 overflow-y-auto overscroll-contain">
            <div class="grid gap-0 md:grid-cols-[0.88fr_1.12fr]">
              <div class="relative bg-slate-50">
                <div class="h-48 overflow-hidden bg-slate-100 sm:h-56 md:h-64 lg:h-72 md:rounded-l-[2rem]">
                  <img
                    [src]="productImage()"
                    [alt]="product.productName"
                    class="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div class="relative flex flex-col gap-4 p-4 sm:p-5 md:p-6">
                <div class="pr-10">
                  <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                    {{ product.brand || 'Product' }}
                  </p>
                  <h2 class="mt-2 line-clamp-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {{ product.productName }}
                  </h2>
                  <p class="mt-2 text-sm font-medium text-slate-500">
                    {{ product.categoryDetails?.name || 'General Category' }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800">
                    {{ priceLabel() }}
                  </span>
                  <span
                    class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em]"
                    [ngClass]="selectedVariantStock() > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  >
                    {{ selectedVariantStock() > 0 ? 'In stock' : 'Out of stock' }}
                  </span>
                </div>

                <p class="line-clamp-3 text-sm leading-6 text-slate-600">
                  {{ product.productDescription || 'Select a variant and quantity to add this product to your cart.' }}
                </p>

                <div *ngIf="hasMultipleVariants()" class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Select Variant
                  </label>
                  <select
                    class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white"
                    [ngModel]="selectedVariantId"
                    (ngModelChange)="onVariantSelectionChange($event)"
                    [ngModelOptions]="{ standalone: true }"
                  >
                    <option *ngFor="let variant of availableVariants(); trackBy: trackByVariant" [ngValue]="variantId(variant)">
                      {{ variantLabel(variant) }} - {{ formatCurrency(priceForVariant(variant)) }}
                    </option>
                  </select>
                </div>

                <div *ngIf="!hasMultipleVariants()" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Selected Variant</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">
                    {{ variantLabel(selectedVariant()) }}
                  </p>
                </div>

                <div class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Quantity</p>
                      <p class="mt-1 text-xs font-semibold text-slate-500">
                        Maximum: {{ selectedVariantStock() || 0 }}
                      </p>
                    </div>

                    <div class="flex w-full items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:w-auto">
                      <button
                        type="button"
                        class="min-h-11 min-w-11 px-4 py-3 text-base font-black text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        [disabled]="quantity <= 1"
                        (click)="decreaseQuantity()"
                      >
                        -
                      </button>
                      <span class="min-w-16 flex-1 px-4 py-3 text-center text-sm font-black text-slate-900">
                        {{ quantity }}
                      </span>
                      <button
                        type="button"
                        class="min-h-11 min-w-11 px-4 py-3 text-base font-black text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        [disabled]="selectedVariantStock() > 0 ? quantity >= selectedVariantStock() : true"
                        (click)="increaseQuantity()"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div *ngIf="selectedVariantWarning()" class="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  {{ selectedVariantWarning() }}
                </div>

                <div class="sticky bottom-0 -mx-4 mt-auto border-t border-slate-200 bg-white/95 px-4 pt-4 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <button
                    type="button"
                    class="btn-secondary w-full !px-5 !py-3.5"
                    (click)="requestClose()"
                  >
                    Cancel
                  </button>
                    <button
                      type="button"
                      class="btn-primary order-first w-full !px-5 !py-3.5 sm:order-none"
                      [disabled]="!selectedVariant()?._id || selectedVariantStock() <= 0"
                      (click)="confirmAddToCart()"
                    >
                      {{ isAdding ? 'Adding...' : 'Add To Cart' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VariantModalComponent implements OnChanges {
  @Input() open = false;
  @Input() product: CustomerCatalogProduct | null = null;
  @Input() initialVariantId = '';
  @Input() isAdding = false;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<VariantModalAddToCartEvent>();

  selectedVariantId = '';
  quantity = 1;
  isOpening = false;
  isClosing = false;
  private readonly closeDelayMs = 180;

  constructor(private variantService: StoreProductVariantService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['product'] || changes['initialVariantId']) && this.open) {
      this.resetSelection();
    }

    if (changes['open']) {
      if (this.open) {
        this.beginOpenAnimation();
        return;
      }

      if (this.product) {
        this.beginCloseAnimation(false);
      }
    }
  }

  selectedVariant(): CustomerCatalogVariant | null {
    return this.variantService.getSelectedVariant(this.product, this.selectedVariantId);
  }

  onVariantSelectionChange(value: string): void {
    this.selectedVariantId = String(value || '');
  }

  variantId(variant?: CustomerCatalogVariant | null): string {
    return String(variant?._id || '');
  }

  selectedVariantStock(): number {
    return this.variantService.getStock(this.selectedVariant());
  }

  priceForVariant(variant?: CustomerCatalogVariant | null): number {
    return this.variantService.getProductPrice(this.product, variant || null);
  }

  priceLabel(): string {
    return this.formatCurrency(this.priceForVariant(this.selectedVariant()));
  }

  productImage(): string {
    return this.variantService.getProductImage(this.product, this.selectedVariant());
  }

  variantLabel(variant?: CustomerCatalogVariant | null): string {
    return this.variantService.getVariantLabel(variant || null);
  }

  hasMultipleVariants(): boolean {
    return this.variantService.getVariants(this.product).length > 1;
  }

  availableVariants(): CustomerCatalogVariant[] {
    const available = this.variantService.getAvailableVariants(this.product);
    const variants = this.variantService.getVariants(this.product);
    return available.length ? available : variants;
  }

  selectedVariantWarning(): string {
    if (!this.product) {
      return '';
    }

    if (this.product.isActive === false) {
      return 'This product is inactive.';
    }

    const variant = this.selectedVariant();
    if (!variant) {
      return 'Please select a variant to continue.';
    }

    if (variant.isAvailable === false || this.variantService.getStock(variant) <= 0) {
      return 'This variant is out of stock.';
    }

    return '';
  }

  increaseQuantity(): void {
    const stock = this.selectedVariantStock();
    if (stock > 0 && this.quantity >= stock) {
      return;
    }

    this.quantity += 1;
  }

  decreaseQuantity(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  confirmAddToCart(): void {
    const variant = this.selectedVariant();
    if (!this.product?._id || !variant?._id || this.selectedVariantStock() <= 0) {
      return;
    }

    console.log('MODAL CONFIRM CLICKED');
    this.addToCart.emit({
      productId: this.product._id,
      variantId: variant._id,
      quantity: this.quantity
    });
  }

  requestClose(): void {
    this.beginCloseAnimation(true);
  }

  trackByVariant(_: number, variant: CustomerCatalogVariant): string {
    return variant._id || variant.sku || this.variantLabel(variant);
  }

  private resetSelection(): void {
    const defaultVariant = this.variantService.getSelectedVariant(this.product, this.initialVariantId);
    this.selectedVariantId = String(defaultVariant?._id || '');
    this.quantity = 1;
  }

  panelStateClasses(): string {
    const closing = this.isClosing;
    const hidden = this.open && !this.isClosing && this.isOpeningPhase();

    return [
      'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden border border-white/60 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] rounded-t-[2rem] pb-[env(safe-area-inset-bottom)] sm:max-w-lg sm:rounded-[2rem] transition-all duration-200 ease-out will-change-transform',
      hidden || closing
        ? 'opacity-0 translate-y-6 sm:translate-y-4 sm:scale-95'
        : 'opacity-100 translate-y-0 sm:scale-100'
    ].join(' ');
  }

  overlayStateClasses(): string {
    return [
      'absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-200 ease-out',
      this.isClosing || this.isOpeningPhase() ? 'opacity-0' : 'opacity-100'
    ].join(' ');
  }

  private beginOpenAnimation(): void {
    this.isOpening = true;
    this.isClosing = false;
    this.resetSelection();
    window.requestAnimationFrame(() => {
      this.isOpening = false;
    });
  }

  private beginCloseAnimation(emitClose: boolean): void {
    if (this.isClosing) {
      return;
    }

    this.isOpening = false;
    this.isClosing = true;

    window.setTimeout(() => {
      this.isClosing = false;
      if (emitClose) {
        this.close.emit();
      }
    }, this.closeDelayMs);
  }

  private isOpeningPhase(): boolean {
    return this.isOpening;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }
}
