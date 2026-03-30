import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private categoryUrl = `${environment.apiUrl}/category`;
  private productUrl = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient) { }

  initialAdminSetup(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/initial-setup-129986`, data, { withCredentials: true });
  }

  getPendingVendors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending`, { withCredentials: true });
  }

  getActiveVendors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/active`, { withCredentials: true });
  }

  getRejectedVendors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rejected`, { withCredentials: true });
  }

  verifyVendor(vendorId: string, action: 'approved' | 'rejected', remarks?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/verify`, { vendorId, action, remarks }, { withCredentials: true });
  }

  deleteVendor(vendorId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${vendorId}`, { withCredentials: true });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user/${userId}`, { withCredentials: true });
  }

  deleteVendorAndProducts(vendorId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-vendor/${vendorId}`, { withCredentials: true });
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

  createProductForVendor(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, data, { withCredentials: true });
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
}
