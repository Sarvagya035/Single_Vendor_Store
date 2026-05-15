import { CustomerCatalogProduct, CustomerLandingCategoryGroup } from '../../../core/models/customer.models';

export function normalizeKey(value: string): string {
  return String(value || '').trim().toLowerCase();
}

export function flattenLandingProducts(groups: CustomerLandingCategoryGroup[]): CustomerCatalogProduct[] {
  const products: CustomerCatalogProduct[] = [];

  groups.forEach((group) => {
    (group.products || []).forEach((product) => {
      products.push({
        ...product,
        catalogCategorySlug: group.categorySlug || product.categoryDetails?.slug || '',
        catalogCategoryName: group.categoryName || product.categoryDetails?.name || ''
      });
    });
  });

  return products;
}

export function findSimilarProducts(
  currentProduct: CustomerCatalogProduct,
  catalogProducts: CustomerCatalogProduct[],
  groups: CustomerLandingCategoryGroup[]
): CustomerCatalogProduct[] {
  const landingProducts = flattenLandingProducts(groups);
  const combinedProducts = [...catalogProducts, ...landingProducts];
  const uniqueProducts = Array.from(
    new Map(
      combinedProducts
        .filter((product) => product?._id && product._id !== currentProduct._id)
        .map((product) => [product._id, product] as const)
    ).values()
  );
  const allProducts = uniqueProducts;
  const currentCategoryKey = normalizeKey(
    currentProduct.catalogCategorySlug || currentProduct.categoryDetails?.slug || currentProduct.categoryDetails?.name || ''
  );
  const currentBrandKey = normalizeKey(currentProduct.brand || '');

  const scoredProducts = allProducts
    .map((product) => {
      let score = 0;
      const productCategoryKey = normalizeKey(
        product.catalogCategorySlug || product.categoryDetails?.slug || product.categoryDetails?.name || ''
      );
      const productBrandKey = normalizeKey(product.brand || '');

      if (currentCategoryKey && productCategoryKey === currentCategoryKey) {
        score += 3;
      }

      if (currentBrandKey && productBrandKey === currentBrandKey) {
        score += 2;
      }

      if (
        currentProduct.categoryDetails?.name &&
        product.categoryDetails?.name &&
        normalizeKey(product.categoryDetails.name) === normalizeKey(currentProduct.categoryDetails.name)
      ) {
        score += 1;
      }

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);

  const fallbackProducts = allProducts.slice(0, 4);
  const selectedProducts = scoredProducts.length ? scoredProducts : fallbackProducts;

  return selectedProducts.slice(0, 4);
}
