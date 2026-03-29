import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardAnalyticsResponse } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private categoryUrl = `${environment.apiUrl}/category`;
  private productUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient) { }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user/${userId}`, { withCredentials: true });
  }

  getAllUsers(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get(`${this.apiUrl}/get-all-users`, { params, withCredentials: true });
  }

  getCategoryTree(): Observable<any> {
    return this.http.get(`${this.categoryUrl}/tree`, { withCredentials: true });
  }

  createCategory(data: FormData): Observable<any> {
    return this.http.post(`${this.categoryUrl}/create-category`, data, { withCredentials: true });
  }

  updateCategory(categoryId: string, data: Record<string, unknown>): Observable<any> {
    return this.http.patch(`${this.categoryUrl}/update-category/${categoryId}`, data, { withCredentials: true });
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${this.categoryUrl}/delete-category/${categoryId}`, { withCredentials: true });
  }

  getAllProducts(): Observable<any> {
    return this.http.get(`${this.productUrl}/get-all-products`, { withCredentials: true });
  }

  getDashboardAnalytics(): Observable<DashboardAnalyticsResponse> {
    return this.http
      .get<any>(`${this.apiUrl}/dashboard-analytics`, { withCredentials: true })
      .pipe(map((response) => response?.data as DashboardAnalyticsResponse));
  }

  createProduct(data: FormData): Observable<any> {
    return this.http.post(`${this.productUrl}/add-product`, data, { withCredentials: true });
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}`, { withCredentials: true });
  }

  updateProduct(productId: string, data: Record<string, unknown>): Observable<any> {
    return this.http.patch(`${this.productUrl}/update-product/${productId}`, data, { withCredentials: true });
  }

  toggleProductStatus(productId: string, isActive: boolean): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/products/${productId}/status`,
      { isActive },
      { withCredentials: true }
    );
  }

  adjustVariantStock(productId: string, variantId: string, stockDelta: number): Observable<any> {
    return this.http.patch(
      `${this.productUrl}/adjust-variant-stock/${productId}/${variantId}`,
      { stockDelta },
      { withCredentials: true }
    );
  }
}
