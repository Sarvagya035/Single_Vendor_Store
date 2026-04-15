import {
  VendorCategoryRecord,
  VendorProductOptionForm,
  VendorProductRecord,
  VendorProductVariant,
} from '../../../core/models/vendor.models';

export interface FlatCategoryOption {
  _id: string;
  name: string;
  level: number;
}

export interface VariantCombination {
  label: string;
  attributesText: string;
  attributes: Record<string, string>;
}

export function buildFlatCategories(nodes: VendorCategoryRecord[]): FlatCategoryOption[] {
  const flat: FlatCategoryOption[] = [];
  flattenCategories(nodes, flat);
  return flat;
}

export function flattenCategories(nodes: VendorCategoryRecord[], target: FlatCategoryOption[]): void {
  for (const node of nodes) {
    target.push({
      _id: node._id,
      name: node.name,
      level: node.level || 0,
    });

    if (node.children?.length) {
      flattenCategories(node.children, target);
    }
  }
}

export function categoryOptionLabel(option: FlatCategoryOption): string {
  return `${'-- '.repeat(option.level)}${option.name}`;
}

export function totalProductStock(product?: VendorProductRecord | null): number {
  return (product?.variants || []).reduce((sum, variant) => sum + Number(variant.productStock || 0), 0);
}

export function variantAttributeSummary(variant?: VendorProductVariant | null): string {
  const entries = Object.entries(variant?.attributes || {});
  if (!entries.length) {
    return 'No attributes';
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(' • ');
}

export function variantAttributesTextFromRecord(variant?: VendorProductVariant | null): string {
  return Object.entries(variant?.attributes || {})
    .map(([key, value]) => `${key}:${value}`)
    .join(', ');
}

export function parseVariantAttributes(input: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [key, ...rest] = pair.split(':');
      const value = rest.join(':').trim();

      if (key?.trim() && value) {
        attributes[key.trim()] = value;
      }
    });

  return attributes;
}

export function formatVendorCurrency(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatVendorDate(value?: string): string {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function primaryProductImage(product?: VendorProductRecord | null): string | undefined {
  return product?.mainImages?.[0];
}

export function generateVariantCombinations(options: VendorProductOptionForm[]): VariantCombination[] {
  const normalizedOptions = options
    .map((option) => ({
      name: option.name.trim(),
      values: option.valuesText
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    }))
    .filter((option) => option.name && option.values.length);

  if (!normalizedOptions.length) {
    return [];
  }

  const combinations = normalizedOptions.reduce<Array<Record<string, string>>>((accumulator, option) => {
    if (!accumulator.length) {
      return option.values.map((value) => ({ [option.name]: value }));
    }

    return accumulator.flatMap((current) =>
      option.values.map((value) => ({
        ...current,
        [option.name]: value,
      })),
    );
  }, []);

  return combinations.map((attributes) => ({
    attributes,
    attributesText: Object.entries(attributes)
      .map(([key, value]) => `${key}:${value}`)
      .join(', '),
    label: Object.entries(attributes)
      .map(([key, value]) => `${value}`)
      .join(' + '),
  }));
}
