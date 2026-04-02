import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerCatalogProduct, CustomerLandingCategory, CustomerLandingCategoryGroup } from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private productUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient) {}

  getCatalogProducts(page = 1, limit = 12): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http
      .get(`${this.productUrl}/get-all-products`, { params, withCredentials: true })
      .pipe(map((response: any) => this.normalizeProductCollection(response)));
  }

  getLandingPageProducts(): Observable<any> {
    return this.http
      .get(`${this.productUrl}/get-landing-page-products`, { withCredentials: true })
      .pipe(map((response: any) => this.normalizeLandingCollection(response)));
  }

  getLandingCategories(): Observable<any> {
    return this.http
      .get(`${environment.apiUrl}/category/landing`)
      .pipe(
        map((response: any) => ({
          ...response,
          data: Array.isArray(response?.data)
            ? response.data.map((category: CustomerLandingCategory) => ({
                ...category
              }))
            : []
        }))
      );
  }

  searchProducts(query: string, page = 1, limit = 12): Observable<any> {
    const params = new HttpParams()
      .set('q', query.trim())
      .set('page', page)
      .set('limit', limit);

    return this.http
      .get(`${this.productUrl}/search`, { params, withCredentials: true })
      .pipe(map((response: any) => this.normalizeProductCollection(response)));
  }

  getProductSuggestions(query: string, limit = 8): Observable<any> {
    const params = new HttpParams()
      .set('q', query.trim())
      .set('limit', limit);

    return this.http
      .get(`${this.productUrl}/suggestions`, { params, withCredentials: true })
      .pipe(map((response: any) => this.normalizeProductCollection(response)));
  }

  getProductDetails(productId: string): Observable<any> {
    return this.http
      .get(`${this.productUrl}/public/get-product-by-id/${productId}`)
      .pipe(
        map((response: any) => ({
          ...response,
          data: response?.data ? this.normalizeProduct(response.data) : response?.data
        }))
      );
  }

  private normalizeProductCollection(response: any): any {
    const rawData = response?.data;

    if (Array.isArray(rawData)) {
      return {
        ...response,
        data: rawData.map((product) => this.normalizeProduct(product))
      };
    }

    if (Array.isArray(rawData?.docs)) {
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

  private normalizeLandingCollection(response: any): any {
    const rawData = response?.data;

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
