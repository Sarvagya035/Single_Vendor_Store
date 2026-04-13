import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CheckoutResponseData,
  OrderCheckoutPayload,
  OrderRecord,
  StoreOrdersResponse,
  VerifyPaymentPayload
} from '../models/order.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderUrl = `${environment.apiUrl}/orders`;

  constructor(private api: ApiService) {}

  checkout(payload: OrderCheckoutPayload): Observable<any> {
    return this.api.post(`${this.orderUrl}/checkout`, payload);
  }

  verifyPayment(payload: VerifyPaymentPayload): Observable<any> {
    return this.api.post(`${this.orderUrl}/verify-payment`, payload);
  }

  getMyOrders(): Observable<OrderRecord[]> {
    return this.api
      .get<any>(`${this.orderUrl}/my-orders`)
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  getOrderDetails(orderId: string): Observable<OrderRecord | null> {
    return this.api
      .get<any>(`${this.orderUrl}/order/${orderId}`)
      .pipe(map((response) => this.normalizeOrder(response?.data)));
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.api.put(`${this.orderUrl}/cancel/${orderId}`, {});
  }

  getVendorOrders(): Observable<OrderRecord[]> {
    return this.api
      .get<any>(`${this.orderUrl}/vendor-orders`)
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  updateVendorOrderStatus(orderId: string, orderItemId: string, status: string): Observable<any> {
    return this.api.put(
      `${this.orderUrl}/vendor-update-status/${orderId}`,
      { orderItemId, status }
    );
  }

  getAdminOrders(): Observable<StoreOrdersResponse> {
    return this.api
      .get<any>(`${this.orderUrl}/admin/all-orders`)
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
