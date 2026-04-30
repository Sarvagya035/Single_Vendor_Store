import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../models/customer.models';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';

export interface CatalogQueryParams {
  q?: string;
  category?: string;
  brand?: string;
  rating?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sortBy?: string;
}

type CatalogResponse<T = unknown> = ApiResponse<T>;

interface ProductDocsResponse {
  docs?: CustomerCatalogProduct[];
  [key: string]: unknown;
}

const isProductDocsResponse = (value: unknown): value is ProductDocsResponse => {
  return !!value && typeof value === 'object' && 'docs' in value;
};

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private productUrl = `${environment.apiUrl}/products`;

  constructor(private api: ApiService) {}

  getCatalogProducts(page = 1, limit = 28, query?: CatalogQueryParams): Observable<CatalogResponse<unknown>> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || String(value).trim() === '') {
        return;
      }

      params = params.set(key, String(value));
    });

    return this.api
      .get<CatalogResponse<unknown>>(`${this.productUrl}/get-all-products`, { params })
      .pipe(map((response) => this.normalizeProductCollection(response)));
  }

  getLandingPageProducts(): Observable<CatalogResponse<unknown>> {
    return this.api
      .get<CatalogResponse<unknown>>(`${this.productUrl}/get-landing-page-products`)
      .pipe(map((response) => this.normalizeLandingCollection(response)));
  }

  getLandingCategories(): Observable<CatalogResponse<CustomerLandingCategory[]>> {
    return this.api
      .get<CatalogResponse<CustomerLandingCategory[]>>(`${environment.apiUrl}/category/landing`)
      .pipe(
        map((response) => ({
          ...response,
          data: Array.isArray(response?.data)
            ? response.data.map((category: CustomerLandingCategory) => ({
                ...category
              }))
            : []
        }))
      );
  }

  searchProducts(
    query: string,
    page = 1,
    limit = 28,
    options: Omit<CatalogQueryParams, 'q'> = {}
  ): Observable<CatalogResponse<unknown>> {
    return this.getCatalogProducts(page, limit, { ...options, q: query.trim() });
  }

  getProductDetails(productId: string): Observable<CatalogResponse<CustomerCatalogProduct>> {
    return this.api
      .get<CatalogResponse<CustomerCatalogProduct>>(`${this.productUrl}/public/get-product-by-id/${productId}`)
      .pipe(
        map((response) => ({
          ...response,
          data: response?.data ? this.normalizeProduct(response.data) : response?.data
        }))
      );
  }

  getProductsByIds(productIds: string[]): Observable<CatalogResponse<CustomerCatalogProduct[]>> {
    const uniqueProductIds = [...new Set((productIds || []).map((id) => String(id || '').trim()).filter(Boolean))];

    if (uniqueProductIds.length === 0) {
      return of({
        success: true,
        message: 'Products fetched successfully',
        data: []
      });
    }

    return this.api
      .post<CatalogResponse<unknown>>(`${environment.apiUrl}/products/bulk`, { productIds: uniqueProductIds })
      .pipe(
        map((response: CatalogResponse<unknown>) => ({
          ...response,
          data: Array.isArray(response?.data)
            ? response.data.map((product: CustomerCatalogProduct) => this.normalizeProduct(product))
            : []
        }))
      );
  }

  private normalizeProductCollection(response: CatalogResponse<unknown>): CatalogResponse<unknown> {
    const rawData = response?.data as unknown;

    if (Array.isArray(rawData)) {
      return {
        ...response,
        data: rawData.map((product) => this.normalizeProduct(product))
      };
    }

    if (isProductDocsResponse(rawData) && Array.isArray(rawData.docs)) {
      return {
        ...response,
        data: {
          ...rawData,
          docs: rawData.docs.map((product: CustomerCatalogProduct) => this.normalizeProduct(product))
        }
      };
    }

    return response;
  }

  private normalizeLandingCollection(response: CatalogResponse<unknown>): CatalogResponse<unknown> {
    const rawData = response?.data as unknown;

    if (!Array.isArray(rawData)) {
      return response;
    }

    return {
      ...response,
      data: rawData.map((group: CustomerLandingCategoryGroup) => ({
        ...group,
        products: Array.isArray(group?.products)
          ? group.products.map((product) => this.normalizeProduct(product))
          : []
      }))
    };
  }

  private normalizeProduct(product: CustomerCatalogProduct): CustomerCatalogProduct {
    const variants = (product?.variants || []).map((variant) => ({
      ...variant,
      attributes: variant?.attributes ? Object.fromEntries(Object.entries(variant.attributes)) : {}
    }));

    const displayVariant =
      variants.find((variant) => (variant.productStock || 0) > 0) ||
      variants[0];

    const normalizedCategory =
      product?.categoryDetails ||
      (product?.category && typeof product.category === 'object'
        ? product.category
        : undefined);

    return {
      ...product,
      variants,
      displayVariant: product?.displayVariant || displayVariant,
      categoryDetails: normalizedCategory
    };
  }
}
