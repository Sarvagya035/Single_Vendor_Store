import { Injectable } from '@angular/core';
import { CustomerCatalogProduct, CustomerCatalogVariant } from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class StoreProductVariantService {
  getVariants(product: CustomerCatalogProduct | null | undefined): CustomerCatalogVariant[] {
    return Array.isArray(product?.variants) ? product.variants : [];
  }

  getAvailableVariants(product: CustomerCatalogProduct | null | undefined): CustomerCatalogVariant[] {
    return this.getVariants(product).filter((variant) => this.isVariantAvailable(variant));
  }

  getDefaultVariant(product: CustomerCatalogProduct | null | undefined): CustomerCatalogVariant | null {
    const variants = this.getVariants(product);
    return this.getAvailableVariants(product)[0] || variants[0] || product?.displayVariant || null;
  }

  getSelectedVariant(
    product: CustomerCatalogProduct | null | undefined,
    variantId?: string
  ): CustomerCatalogVariant | null {
    const variants = this.getVariants(product);
    const normalizedVariantId = String(variantId || '').trim();

    if (normalizedVariantId) {
      const exact = variants.find((variant) => String(variant._id || '').trim() === normalizedVariantId);
      if (exact) {
        return exact;
      }
    }

    return this.getDefaultVariant(product);
  }

  hasSingleVariant(product: CustomerCatalogProduct | null | undefined): boolean {
    return this.getVariants(product).length === 1;
  }

  isProductOutOfStock(product: CustomerCatalogProduct | null | undefined): boolean {
    if (!product || product.isActive === false) {
      return true;
    }

    const variants = this.getVariants(product);
    if (variants.length === 0) {
      return Number(product.stock || 0) <= 0;
    }

    return this.getAvailableVariants(product).length === 0;
  }

  getProductImage(product: CustomerCatalogProduct | null | undefined, variant?: CustomerCatalogVariant | null): string {
    return (
      variant?.variantImage ||
      product?.displayVariant?.variantImage ||
      product?.mainImages?.[0] ||
      'https://via.placeholder.com/640x480?text=Product'
    );
  }

  getProductPrice(product: CustomerCatalogProduct | null | undefined, variant?: CustomerCatalogVariant | null): number {
    return Number(variant?.finalPrice || variant?.productPrice || product?.basePrice || 0);
  }

  getVariantLabel(variant?: CustomerCatalogVariant | null): string {
    if (!variant) {
      return 'Variant';
    }

    const attributes = Object.entries(variant.attributes || {}).map(([key, value]) => `${key}: ${value}`);
    return attributes.length ? attributes.join(' | ') : variant.sku || 'Variant';
  }

  getStock(variant?: CustomerCatalogVariant | null): number {
    return Number(variant?.productStock || 0);
  }

  isVariantAvailable(variant?: CustomerCatalogVariant | null): boolean {
    return !!variant && variant.isAvailable !== false && Number(variant.productStock || 0) > 0;
  }
}
