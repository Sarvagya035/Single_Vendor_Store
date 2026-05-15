import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';

export function buildAttributeEntries(attributes?: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(attributes || {}).map(([key, value]) => ({ key, value }));
}

export function buildGalleryImages(product?: CustomerCatalogProduct | null): string[] {
  const images = [
    ...collectImageCandidates(product, ['mainImages', 'images', 'image', 'imageUrl', 'thumbnail']),
    ...((product?.variants || []).flatMap((variant) =>
      collectImageCandidates(variant, ['variantImage', 'images', 'image', 'imageUrl', 'thumbnail'])
    ))
  ];

  return [...new Set(images)];
}

export function buildActiveImage(
  selectedImage: string,
  selectedVariant: CustomerCatalogVariant | undefined,
  product?: CustomerCatalogProduct | null
): string {
  const selectedVariantImage = resolveVariantImage(selectedVariant);
  const productFallbackImage = resolveProductImage(product);

  return (
    selectedImage ||
    selectedVariantImage ||
    productFallbackImage ||
    'https://via.placeholder.com/800x600?text=Product'
  );
}

export function resolveVariantImage(variant?: CustomerCatalogVariant | null): string {
  return (
    firstImageFromRecord(variant, ['variantImage', 'image', 'imageUrl', 'thumbnail']) ||
    firstImageFromArrayField(variant, 'images') ||
    ''
  );
}

export function resolveProductImage(product?: CustomerCatalogProduct | null): string {
  return (
    firstImageFromRecord(product, ['mainImages', 'image', 'imageUrl', 'thumbnail']) ||
    firstImageFromArrayField(product, 'images') ||
    ''
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

function collectImageCandidates(
  source: CustomerCatalogProduct | CustomerCatalogVariant | null | undefined,
  keys: string[]
): string[] {
  const directImages = keys.flatMap((key) => {
    if (!source || typeof source !== 'object') {
      return [];
    }

    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) {
      return [value.trim()];
    }

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
    }

    return [];
  });

  return directImages;
}

function firstImageFromRecord(
  source: CustomerCatalogProduct | CustomerCatalogVariant | null | undefined,
  keys: string[]
): string {
  if (!source || typeof source !== 'object') {
    return '';
  }

  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function firstImageFromArrayField(
  source: CustomerCatalogProduct | CustomerCatalogVariant | null | undefined,
  key: string
): string {
  if (!source || typeof source !== 'object') {
    return '';
  }

  const value = (source as Record<string, unknown>)[key];
  if (!Array.isArray(value)) {
    return '';
  }

  const first = value.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return first?.trim() || '';
}
