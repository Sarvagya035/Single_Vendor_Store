import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CheckoutResponseData,
  OrderCheckoutPayload,
  OrderRecord,
  StoreOrdersResponse,
  VerifyPaymentPayload
} from '../models/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  checkout(payload: OrderCheckoutPayload): Observable<any> {
    return this.http.post(`${this.orderUrl}/checkout`, payload, { withCredentials: true });
  }

  verifyPayment(payload: VerifyPaymentPayload): Observable<any> {
    return this.http.post(`${this.orderUrl}/verify-payment`, payload, { withCredentials: true });
  }

  getMyOrders(): Observable<OrderRecord[]> {
    return this.http
      .get<any>(`${this.orderUrl}/my-orders`, { withCredentials: true })
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  getOrderDetails(orderId: string): Observable<OrderRecord | null> {
    return this.http
      .get<any>(`${this.orderUrl}/order/${orderId}`, { withCredentials: true })
      .pipe(map((response) => this.normalizeOrder(response?.data)));
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.put(`${this.orderUrl}/cancel/${orderId}`, {}, { withCredentials: true });
  }

  getVendorOrders(): Observable<OrderRecord[]> {
    return this.http
      .get<any>(`${this.orderUrl}/vendor-orders`, { withCredentials: true })
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  updateVendorOrderStatus(orderId: string, orderItemId: string, status: string): Observable<any> {
    return this.http.put(
      `${this.orderUrl}/vendor-update-status/${orderId}`,
      { orderItemId, status },
      { withCredentials: true }
    );
  }

  getAdminOrders(): Observable<StoreOrdersResponse> {
    return this.http
      .get<any>(`${this.orderUrl}/admin/all-orders`, { withCredentials: true })
      .pipe(
        map((response) => {
          const payload = response?.data ?? {};
          return {
            orders: this.normalizeOrderList(payload?.orders),
            totalRevenue: Number(payload?.totalRevenue || 0)
          };
        })
      );
  }

  private normalizeOrderList(payload: unknown): OrderRecord[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((order) => this.normalizeOrder(order))
      .filter((order): order is OrderRecord => !!order);
  }

  private normalizeOrder(payload: any): OrderRecord | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    return {
      _id: payload._id,
      user: payload.user,
      orderItems: Array.isArray(payload.orderItems)
        ? payload.orderItems.map((item: any) => ({
            _id: item?._id,
            product: item?.product,
            variantId: item?.variantId,
            name: item?.name,
            quantity: Number(item?.quantity || 0),
            price: Number(item?.price || 0),
            variantImage: item?.variantImage,
            vendor: item?.vendor,
            sku: item?.sku,
            orderItemStatus: item?.orderItemStatus
          }))
        : [],
      shippingAddress: payload.shippingAddress || undefined,
      paymentInfo: payload.paymentInfo || undefined,
      itemsPrice: Number(payload.itemsPrice || 0),
      taxPrice: Number(payload.taxPrice || 0),
      shippingPrice: Number(payload.shippingPrice || 0),
      totalAmount: Number(payload.totalAmount || 0),
      orderStatus: payload.orderStatus,
      paidAt: payload.paidAt,
      deliveredAt: payload.deliveredAt,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt
    };
  }
}
