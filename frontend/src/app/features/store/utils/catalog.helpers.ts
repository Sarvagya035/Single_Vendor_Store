import { CustomerCatalogProduct, CustomerLandingCategory } from '../../../core/models/customer.models';

export interface LandingCategoryNode extends CustomerLandingCategory {
  children: LandingCategoryNode[];
  level?: number;
}

const normalizeCatalogKey = (value: string): string => String(value || '').trim().toLowerCase();

export const buildCategoryTree = (categories: CustomerLandingCategory[]): LandingCategoryNode[] => {
  const nodeMap = new Map<string, LandingCategoryNode>();

  categories.forEach((category) => {
    nodeMap.set(category._id, {
      ...category,
      children: []
    });
  });

  const roots: LandingCategoryNode[] = [];

  nodeMap.forEach((node) => {
    const parentId = node.parentCategory ? String(node.parentCategory) : '';
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: LandingCategoryNode[]): LandingCategoryNode[] => {
    return nodes
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      .map((node) => ({
        ...node,
        children: sortNodes(node.children || [])
      }));
  };

  return sortNodes(roots);
};

export const buildVisibleCategoryList = (
  catalogCategoryTree: LandingCategoryNode[],
  expandedCategoryIds: Set<string>
): LandingCategoryNode[] => {
  const visible: LandingCategoryNode[] = [];

  const visit = (nodes: LandingCategoryNode[], depth = 0): void => {
    nodes.forEach((node) => {
      visible.push({
        ...node,
        level: depth
      });

      if (node.children.length > 0 && expandedCategoryIds.has(node._id)) {
        visit(node.children, depth + 1);
      }
    });
  };

  visit(catalogCategoryTree);
  return visible;
};

export const findCategoryNodeBySlug = (
  catalogCategoryTree: LandingCategoryNode[],
  slug: string
): LandingCategoryNode | null => {
  const targetSlug = normalizeCatalogKey(slug);
  const stack = [...catalogCategoryTree];

  while (stack.length > 0) {
    const current = stack.shift();
    if (!current) continue;

    if (normalizeCatalogKey(current.slug || current.name) === targetSlug) {
      return current;
    }

    stack.unshift(...(current.children || []));
  }

  return null;
};

export const collectCategoryKeys = (node: LandingCategoryNode): Set<string> => {
  const keys = new Set<string>();

  const visit = (current: LandingCategoryNode): void => {
    const slug = normalizeCatalogKey(current.slug || '');
    const name = normalizeCatalogKey(current.name || '');

    if (slug) keys.add(slug);
    if (name) keys.add(name);

    (current.children || []).forEach(visit);
  };

  visit(node);
  return keys;
};

export const countProductsForNode = (
  node: LandingCategoryNode,
  productsForNode: (targetNode: LandingCategoryNode) => CustomerCatalogProduct[]
): number => {
  const directCount = productsForNode(node).length;

  if (!node.children.length) {
    return directCount;
  }

  return node.children.reduce((total, child) => total + countProductsForNode(child, productsForNode), directCount);
};

export const getCategoryProductCount = (
  category: CustomerLandingCategory,
  catalogCategoryTree: LandingCategoryNode[],
  productsForNode: (targetNode: LandingCategoryNode) => CustomerCatalogProduct[]
): number => {
  const key = normalizeCatalogKey(category.slug || category.name);
  const node = findCategoryNodeBySlug(catalogCategoryTree, key);

  if (!node) {
    return 0;
  }

  return countProductsForNode(node, productsForNode);
};

export const categoryLabel = (category: CustomerLandingCategory): string => {
  const level = Number(category.level || 0);
  const indent = level > 0 ? `${'  '.repeat(level)}- ` : '';
  return `${indent}${category.name}`;
};

export const buildCatalogMessage = (options: {
  query: string;
  selectedCategoryIds?: string[];
  selectedCategorySlug?: string;
  totalProductCount: number;
  hasActiveFilters: boolean;
  landingCategoriesCount: number;
  catalogCategoryTree: LandingCategoryNode[];
}): string => {
  const trimmedQuery = String(options.query || '').trim();
  const totalItems = options.totalProductCount;
  const selectedCategoryIds = Array.isArray(options.selectedCategoryIds) ? options.selectedCategoryIds.filter(Boolean) : [];
  const selectedCategoryKey = normalizeCatalogKey(selectedCategoryIds[0] || options.selectedCategorySlug || '');

  if (trimmedQuery) {
    return totalItems
      ? `${totalItems} product${totalItems === 1 ? '' : 's'} found for "${trimmedQuery}".`
      : `No products matched "${trimmedQuery}".`;
  }

  const selectedCategory = findCategoryNodeBySlug(options.catalogCategoryTree, selectedCategoryKey);

  if (!selectedCategoryKey || selectedCategoryKey === 'all') {
    if (options.hasActiveFilters) {
      return `Showing ${totalItems} filtered product${totalItems === 1 ? '' : 's'} across the catalog.`;
    }

    return options.landingCategoriesCount
      ? `Showing ${totalItems} curated product${totalItems === 1 ? '' : 's'} across ${options.landingCategoriesCount} categorie${options.landingCategoriesCount === 1 ? 'y' : 's'}.`
      : 'Browse premium dry fruits by type or search for a specific pack.';
  }

  if (selectedCategoryIds.length > 1) {
    return options.hasActiveFilters
      ? `Browsing selected categories with ${totalItems} filtered product${totalItems === 1 ? '' : 's'}.`
      : `Browsing selected categories with ${totalItems} product${totalItems === 1 ? '' : 's'}.`;
  }

  if (selectedCategory?.name) {
    return options.hasActiveFilters
      ? `Browsing ${selectedCategory.name} with ${totalItems} filtered product${totalItems === 1 ? '' : 's'}.`
      : `Browsing ${selectedCategory.name} with ${totalItems} product${totalItems === 1 ? '' : 's'}.`;
  }

  return 'Browse premium dry fruits by type or search for a specific pack.';
};

export const buildPageSubtitle = (options: {
  viewMode: 'landing' | 'search';
  searchQuery: string;
  selectedCategoryIds?: string[];
  selectedCategorySlug?: string;
  hasActiveFilters: boolean;
  catalogCategories: CustomerLandingCategory[];
}): string => {
  const trimmedSearchQuery = String(options.searchQuery || '').trim();
  const selectedCategoryIds = Array.isArray(options.selectedCategoryIds) ? options.selectedCategoryIds.filter(Boolean) : [];
  const selectedCategoryKey = normalizeCatalogKey(selectedCategoryIds[0] || options.selectedCategorySlug || '');

  if (options.viewMode === 'search' && trimmedSearchQuery) {
    return options.hasActiveFilters
      ? `Showing search results for "${trimmedSearchQuery}" with active filters.`
      : `Showing search results for "${trimmedSearchQuery}".`;
  }

  if (!selectedCategoryKey || selectedCategoryKey === 'all') {
    return options.hasActiveFilters
      ? 'Browse premium dry fruits with filters and sorting.'
      : 'Browse premium dry fruits by type or search for a specific pack.';
  }

  const selectedCategory = options.catalogCategories.find(
    (category) => normalizeCatalogKey(category.slug || category.name) === selectedCategoryKey
  );

  if (selectedCategoryIds.length > 1) {
    return options.hasActiveFilters
      ? 'Browsing selected categories with filters applied.'
      : 'Browsing selected categories.';
  }

  return selectedCategory?.name
    ? options.hasActiveFilters
      ? `Browsing ${selectedCategory.name} with filters applied.`
      : `Browsing ${selectedCategory.name}.`
    : 'Browse premium dry fruits by type or search for a specific pack.';
};
