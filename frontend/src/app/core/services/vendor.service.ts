import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerUser, CustomerWishlist } from '../models/customer.models';
import { OrderRecord } from '../models/order.models';
import {
  AdminShipmentUpdatePayload,
  OrderReportRequest,
  VendorAnalyticsPayload,
  VendorCustomersResponse,
  VendorNotificationRecord,
  VendorNotificationsPayload,
  VendorSoldOrderRecord
} from '../models/vendor.models';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/vendor`;
  private adminUrl = `${environment.apiUrl}/admin`;
  private productUrl = `${environment.apiUrl}/products`;
  private categoryUrl = `${environment.apiUrl}/category`;
  private orderUrl = `${environment.apiUrl}/orders`;
  private wishlistUrl = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) { }

  registerVendor(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/registerVendor`, data, { withCredentials: true });
  }

  initialStoreSetup(data: FormData): Observable<any> {
    return this.http.post(`${this.adminUrl}/initial-setup-129986`, data, { withCredentials: true });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.adminUrl}/profile`, { withCredentials: true });
  }

  updateDetails(data: any): Observable<any> {
    return this.http.patch(`${this.adminUrl}/update-details`, data, { withCredentials: true });
  }

  updateBankDetails(data: any): Observable<any> {
    return this.http.patch(`${this.adminUrl}/update-bank-details`, data, { withCredentials: true });
  }

  updateLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('vendorLogo', file);
    return this.http.patch(`${this.adminUrl}/update-logo`, formData, { withCredentials: true });
  }

  getMyProducts(
    page = 1,
    limit = 100,
    filters?: { q?: string; category?: string; status?: 'all' | 'active' | 'inactive' }
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (filters?.q?.trim()) {
      params = params.set('q', filters.q.trim());
    }

    if (filters?.category && filters.category !== 'all') {
      params = params.set('category', filters.category);
    }

    if (filters?.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    return this.http.get(`${this.productUrl}/my-products`, { withCredentials: true, params });
  }

  getProductById(productId: string): Observable<any> {
    return this.http.get(`${this.productUrl}/get-product-by-id/${productId}`, { withCredentials: true });
  }

  createProduct(data: FormData): Observable<any> {
    return this.http.post(`${this.productUrl}/add-product`, data, { withCredentials: true });
  }

  updateProduct(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.productUrl}/update-product/${productId}`, data, { withCredentials: true });
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.productUrl}/delete-product/${productId}`, { withCredentials: true });
  }

  addVariant(productId: string, data: FormData): Observable<any> {
    return this.http.post(`${this.productUrl}/add-variant/${productId}`, data, { withCredentials: true });
  }

  restockVariant(productId: string, variantId: string, stockToAdd: number): Observable<any> {
    return this.http.patch(
      `${this.productUrl}/restock-variant/${productId}/${variantId}`,
      { stockToAdd },
      { withCredentials: true }
    );
  }

  updateVariantDiscount(productId: string, variantId: string, discountPercentage: number): Observable<any> {
    return this.http.patch(
      `${this.productUrl}/update-variant-discount/${productId}/${variantId}`,
      { discountPercentage },
      { withCredentials: true }
    );
  }

  updateVariant(productId: string, variantId: string, data: FormData): Observable<any> {
    return this.http.patch(`${this.productUrl}/update-variant/${productId}/${variantId}`, data, {
      withCredentials: true
    });
  }

  deleteVariant(productId: string, variantId: string): Observable<any> {
    return this.http.delete(`${this.productUrl}/delete-variant/${productId}/${variantId}`, { withCredentials: true });
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

  getAllUsers(page = 1, limit = 100): Observable<VendorCustomersResponse> {
    return this.http
      .get<any>(`${this.adminUrl}/get-all-users?page=${page}&limit=${limit}`, { withCredentials: true })
      .pipe(
        map((response) => ({
          users: Array.isArray(response?.data?.users) ? response.data.users : [],
          pagination: {
            totalUsers: Number(response?.data?.pagination?.totalUsers || 0),
            totalPages: Number(response?.data?.pagination?.totalPages || 0),
            currentPage: Number(response?.data?.pagination?.currentPage || page),
            hasNextPage: Boolean(response?.data?.pagination?.hasNextPage),
            hasPrevPage: Boolean(response?.data?.pagination?.hasPrevPage)
          }
        }))
      );
  }

  getRegisteredCustomers(): Observable<CustomerUser[]> {
    const pageSize = 100;

    return this.getAllUsers(1, pageSize).pipe(
      switchMap((response) => {
        const firstPageUsers = response?.users || [];
        const totalPages = Number(response?.pagination?.totalPages || 1);

        if (totalPages <= 1) {
          return of(firstPageUsers.filter((user) => this.isRegisteredCustomer(user)));
        }

        const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) =>
          this.getAllUsers(index + 2, pageSize)
        );

        return forkJoin(remainingPages).pipe(
          map((responses) => {
            const allUsers = [
              ...firstPageUsers,
              ...responses.reduce<CustomerUser[]>((all, page) => {
                all.push(...(page?.users || []));
                return all;
              }, [])
            ];

            return allUsers
              .filter((user) => this.isRegisteredCustomer(user))
              .sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt));
          })
        );
      })
    );
  }

  getCustomerOrderHistory(customerId: string): Observable<OrderRecord[]> {
    return this.http
      .get<any>(`${this.orderUrl}/vendor/customer/${customerId}`, { withCredentials: true })
      .pipe(map((response) => (Array.isArray(response?.data) ? response.data : [])));
  }

  getCustomerWishlist(customerId: string): Observable<CustomerWishlist> {
    return this.http
      .get<any>(`${this.wishlistUrl}/vendor/customer/${customerId}`, { withCredentials: true })
      .pipe(map((response) => this.normalizeWishlist(response?.data)));
  }

  getVendorAnalytics(): Observable<VendorAnalyticsPayload> {
    return this.http
      .get<any>(`${this.adminUrl}/analytics`, { withCredentials: true })
      .pipe(
        map((response) => ({
          summary: {
            totalRevenue: Number(response?.data?.summary?.totalRevenue || 0),
            totalItemsSold: Number(response?.data?.summary?.totalItemsSold || 0),
            totalOrdersCount: Number(response?.data?.summary?.totalOrdersCount || 0)
          },
          productWiseSales: Array.isArray(response?.data?.productWiseSales)
            ? response.data.productWiseSales.map((item: any) => ({
                _id: item?._id,
                productName: item?.productName,
                quantitySold: Number(item?.quantitySold || 0),
                revenueGenerated: Number(item?.revenueGenerated || 0)
              }))
            : []
        }))
      );
  }

  getVendorSoldItems(): Observable<VendorSoldOrderRecord[]> {
    return this.http
      .get<any>(`${this.adminUrl}/sold-items`, { withCredentials: true })
      .pipe(map((response) => (Array.isArray(response?.data) ? response.data : [])));
  }

  getVendorNotifications(): Observable<VendorNotificationsPayload> {
    return this.http
      .get<any>(`${this.adminUrl}/notifications`, { withCredentials: true })
      .pipe(
        map((response) => ({
          notifications: Array.isArray(response?.data?.notifications) ? response.data.notifications : [],
          summary: {
            totalNotifications: Number(response?.data?.summary?.totalNotifications || 0),
            unreadNotifications: Number(response?.data?.summary?.unreadNotifications || 0),
            activeLowStockAlerts: Number(response?.data?.summary?.activeLowStockAlerts || 0),
            resolvedLowStockAlerts: Number(response?.data?.summary?.resolvedLowStockAlerts || 0)
          }
        }))
      );
  }

  markVendorNotificationRead(notificationId: string): Observable<VendorNotificationRecord> {
    return this.http
      .patch<any>(`${this.adminUrl}/notifications/${notificationId}/read`, {}, { withCredentials: true })
      .pipe(map((response) => response?.data as VendorNotificationRecord));
  }

  markAllVendorNotificationsRead(): Observable<any> {
    return this.http.patch(`${this.adminUrl}/notifications/read-all`, {}, { withCredentials: true });
  }

  getAdminShipments(): Observable<any> {
    return this.http
      .get<any>(`${this.adminUrl}/shipments`, { withCredentials: true })
      .pipe(
        map((response) => ({
          shipments: Array.isArray(response?.data?.shipments) ? response.data.shipments : [],
          summary: {
            totalShipments: Number(response?.data?.summary?.totalShipments || 0),
            deliveredShipments: Number(response?.data?.summary?.deliveredShipments || 0),
            openShipments: Number(response?.data?.summary?.openShipments || 0)
          }
        }))
      );
  }

  updateAdminShipment(orderId: string, payload: AdminShipmentUpdatePayload): Observable<any> {
    return this.http.patch(`${this.adminUrl}/shipments/${orderId}`, payload, { withCredentials: true });
  }

  downloadOrdersReport(request: OrderReportRequest): Observable<HttpResponse<Blob>> {
    let params = new HttpParams()
      .set('range', request.range)
      .set('format', request.format);

    if (request.startDate) {
      params = params.set('startDate', request.startDate);
    }

    if (request.endDate) {
      params = params.set('endDate', request.endDate);
    }

    return this.http.get(`${this.adminUrl}/reports/orders`, {
      withCredentials: true,
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  private isRegisteredCustomer(user: CustomerUser): boolean {
    const roles = Array.isArray(user.role)
      ? user.role.map((role) => String(role).toLowerCase())
      : user.role
        ? [String(user.role).toLowerCase()]
        : [];

    if (roles.length === 0) {
      return false;
    }

    const hasCustomer = roles.includes('customer');
    const hasRestrictedRole = roles.some((role) => role === 'vendor' || role === 'admin');

    return hasCustomer && !hasRestrictedRole;
  }

  private normalizeWishlist(payload: any): CustomerWishlist {
    return {
      _id: payload?._id,
      owner: payload?.owner,
      products: Array.isArray(payload?.products) ? payload.products : [],
      createdAt: payload?.createdAt,
      updatedAt: payload?.updatedAt
    };
  }

  private toTimestamp(value?: string): number {
    return value ? new Date(value).getTime() : 0;
  }
}
