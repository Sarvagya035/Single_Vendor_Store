import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';

export function buildAttributeEntries(attributes?: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(attributes || {}).map(([key, value]) => ({ key, value }));
}

export function buildGalleryImages(product?: CustomerCatalogProduct | null): string[] {
  const images = [
    ...(product?.mainImages || []),
    ...((product?.variants || []).map((variant) => variant.variantImage).filter(Boolean) as string[])
  ];

  return [...new Set(images)];
}

export function buildActiveImage(
  selectedImage: string,
  selectedVariant: CustomerCatalogVariant | undefined,
  product?: CustomerCatalogProduct | null
): string {
  return (
    selectedImage ||
    selectedVariant?.variantImage ||
    product?.mainImages?.[0] ||
    'https://via.placeholder.com/800x600?text=Product'
  );
}

export function buildVariantLabel(
  variant: CustomerCatalogVariant | undefined,
  attributeEntries: (attributes?: Record<string, string>) => Array<{ key: string; value: string }>
): string {
  if (!variant) {
    return 'Variant';
  }

  const attributes = attributeEntries(variant.attributes).map((entry) => `${entry.key}: ${entry.value}`);

  return attributes.length ? attributes.join(' | ') : variant.sku || 'Variant';
}

export function buildVariantLabels(
  variants: CustomerCatalogVariant[] | undefined,
  variantLabel: (variant?: CustomerCatalogVariant) => string,
  formatCurrency: (amount: number) => string
): Record<string, string> {
  return (variants || []).reduce((labels, variant) => {
    if (variant._id) {
      labels[variant._id] = `${variantLabel(variant)} - ${formatCurrency(variant.finalPrice || variant.productPrice || 0)}`;
    }
    return labels;
  }, {} as Record<string, string>);
}

export function buildOriginalPriceLabel(
  product: CustomerCatalogProduct | null | undefined,
  selectedVariant: CustomerCatalogVariant | undefined,
  formatCurrency: (amount: number) => string
): string {
  if (!product) {
    return '';
  }

  const original = selectedVariant?.productPrice || product.basePrice || 0;
  const discounted = selectedVariant?.finalPrice || product.basePrice || 0;

  if (!original || original === discounted) {
    return '';
  }

  return formatCurrency(original);
}

export function buildDiscountedPriceLabel(
  product: CustomerCatalogProduct | null | undefined,
  selectedVariant: CustomerCatalogVariant | undefined,
  formatCurrency: (amount: number) => string
): string {
  if (!product) {
    return '';
  }

  return formatCurrency(selectedVariant?.finalPrice || product.basePrice || 0);
}
