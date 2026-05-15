import { CustomerCatalogProduct, CustomerCatalogVariant } from '../../../core/models/customer.models';

export interface VariantAttributeGroup {
  key: string;
  label: string;
  values: string[];
}

export function buildAttributeEntries(attributes?: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(attributes || {}).map(([key, value]) => ({ key, value }));
}

export function buildVariantAttributeGroups(variants?: CustomerCatalogVariant[] | null): VariantAttributeGroup[] {
  const orderedKeys: Array<{ key: string; label: string }> = [];
  const valuesByKey = new Map<string, Set<string>>();

  for (const variant of variants || []) {
    const attributes = normalizeVariantAttributes(variant);
    for (const [rawKey, rawValue] of attributes) {
      const key = normalizeAttributeKey(rawKey);
      const value = String(rawValue || '').trim();

      if (!key || !value) {
        continue;
      }

      if (!valuesByKey.has(key)) {
        valuesByKey.set(key, new Set<string>());
        orderedKeys.push({ key, label: String(rawKey || key).trim() || key });
      }

      valuesByKey.get(key)?.add(value);
    }
  }

  return orderedKeys
    .map((group) => ({
      key: group.key,
      label: group.label,
      values: Array.from(valuesByKey.get(group.key) || [])
    }))
    .filter((group) => group.values.length > 0);
}

export function normalizeVariantAttributes(
  variant?: CustomerCatalogVariant | null
): Array<[string, string]> {
  if (!variant || typeof variant !== 'object') {
    return [];
  }

  const attributes = variant.attributes && typeof variant.attributes === 'object'
    ? Object.entries(variant.attributes)
    : [];

  return attributes
    .map(([key, value]) => [String(key || '').trim(), String(value || '').trim()] as [string, string])
    .filter(([key, value]) => !!key && !!value);
}

export function variantMatchesAttributes(
  variant?: CustomerCatalogVariant | null,
  selectedAttributes?: Record<string, string> | null
): boolean {
  const normalizedSelected = normalizeSelection(selectedAttributes);
  if (!variant || !Object.keys(normalizedSelected).length) {
    return !!variant;
  }

  const variantAttributes = new Map(normalizeVariantAttributes(variant).map(([key, value]) => [normalizeAttributeKey(key), value]));
  return Object.entries(normalizedSelected).every(([key, value]) => variantAttributes.get(key) === value);
}

export function findVariantByAttributes(
  variants?: CustomerCatalogVariant[] | null,
  selectedAttributes?: Record<string, string> | null
): CustomerCatalogVariant | undefined {
  const normalizedSelection = normalizeSelection(selectedAttributes);
  if (!variants?.length) {
    return undefined;
  }

  const exactMatch = variants.find((variant) => variantMatchesAttributes(variant, normalizedSelection));
  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = variants.find((variant) => {
    if (!variant) {
      return false;
    }

    const attributes = new Map(normalizeVariantAttributes(variant).map(([key, value]) => [normalizeAttributeKey(key), value]));
    return Object.entries(normalizedSelection).every(([key, value]) => attributes.get(key) === value);
  });

  return partialMatch;
}

export function getVariantAttributeValue(
  variant?: CustomerCatalogVariant | null,
  key?: string
): string {
  if (!variant || !key) {
    return '';
  }

  const normalizedKey = normalizeAttributeKey(key);
  for (const [variantKey, variantValue] of normalizeVariantAttributes(variant)) {
    if (normalizeAttributeKey(variantKey) === normalizedKey) {
      return String(variantValue || '').trim();
    }
  }

  return '';
}

export function buildGalleryImages(product?: CustomerCatalogProduct | null): string[] {
  const images = [
    ...collectImageCandidates(product, ['mainImages', 'images', 'image', 'imageUrl', 'thumbnail']),
    ...((product?.variants || []).flatMap((variant) =>
      collectImageCandidates(variant, ['variantImages', 'variantImage', 'images', 'image', 'imageUrl', 'thumbnail'])
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
    firstImageFromArrayField(variant, 'variantImages') ||
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

function normalizeAttributeKey(key: string): string {
  return String(key || '').trim().toLowerCase();
}

function normalizeSelection(selectedAttributes?: Record<string, string> | null): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(selectedAttributes || {})) {
    const normalizedKey = normalizeAttributeKey(key);
    const normalizedValue = String(value || '').trim();
    if (normalizedKey && normalizedValue) {
      normalized[normalizedKey] = normalizedValue;
    }
  }
  return normalized;
}
