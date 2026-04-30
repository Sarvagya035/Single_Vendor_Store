import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CheckoutResponseData,
  OrderCheckoutPayload,
  OrderItemRecord,
  OrderRecord,
  ShipmentRecord,
  StoreOrdersResponse,
  VerifyPaymentPayload
} from '../models/order.models';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

type OrderApiResponse<T = unknown> = ApiResponse<T>;

type LooseRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is LooseRecord => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderUrl = `${environment.apiUrl}/orders`;

  constructor(private api: ApiService) {}

  checkout(payload: OrderCheckoutPayload): Observable<OrderApiResponse<CheckoutResponseData>> {
    return this.api.post<OrderApiResponse<CheckoutResponseData>>(`${this.orderUrl}/checkout`, payload);
  }

  verifyPayment(payload: VerifyPaymentPayload): Observable<OrderApiResponse<unknown>> {
    return this.api.post<OrderApiResponse<unknown>>(`${this.orderUrl}/verify-payment`, payload);
  }

  getMyOrders(): Observable<OrderRecord[]> {
    return this.api
      .get<OrderApiResponse<unknown>>(`${this.orderUrl}/my-orders`)
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  getOrderDetails(orderId: string): Observable<OrderRecord | null> {
    return this.api
      .get<OrderApiResponse<unknown>>(`${this.orderUrl}/order/${orderId}`)
      .pipe(map((response) => this.normalizeOrder(response?.data)));
  }

  getShipmentDetails(orderId: string): Observable<ShipmentRecord | null> {
    return this.api
      .get<OrderApiResponse<unknown>>(`${this.orderUrl}/shipment/${orderId}`)
      .pipe(map((response) => this.normalizeShipment(response?.data)));
  }

  syncShipmentStatus(orderId: string): Observable<ShipmentRecord | null> {
    return this.api
      .post<OrderApiResponse<unknown>>(`${this.orderUrl}/shipment/${orderId}/sync`, {})
      .pipe(map((response) => this.normalizeShipment(response?.data)));
  }

  cancelOrder(orderId: string): Observable<OrderApiResponse<unknown>> {
    return this.api.put<OrderApiResponse<unknown>>(`${this.orderUrl}/cancel/${orderId}`, {});
  }

  getVendorOrders(): Observable<OrderRecord[]> {
    return this.api
      .get<OrderApiResponse<unknown>>(`${this.orderUrl}/vendor-orders`)
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  getVendorCustomerOrders(customerId: string): Observable<OrderRecord[]> {
    return this.api
      .get<OrderApiResponse<unknown>>(`${this.orderUrl}/vendor/customer/${customerId}`)
      .pipe(map((response) => this.normalizeOrderList(response?.data)));
  }

  updateVendorOrderStatus(orderId: string, orderItemId: string, status: string): Observable<OrderApiResponse<unknown>> {
    return this.api.put(
      `${this.orderUrl}/vendor-update-status/${orderId}`,
      { orderItemId, status }
    );
  }

  getAdminOrders(): Observable<StoreOrdersResponse> {
    return this.api
      .get<OrderApiResponse<unknown>>(`${this.orderUrl}/admin/all-orders`)
      .pipe(
        map((response) => {
          const payload = (response?.data ?? {}) as {
            orders?: unknown;
            totalRevenue?: number;
          };
          return {
            orders: this.normalizeOrderList(payload.orders),
            totalRevenue: Number(payload.totalRevenue || 0)
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

  private normalizeOrder(payload: unknown): OrderRecord | null {
    if (!isRecord(payload)) {
      return null;
    }

    const record = payload;
    const orderItems = Array.isArray(record['orderItems']) ? record['orderItems'] : [];

    return {
      _id: typeof record['_id'] === 'string' ? record['_id'] : undefined,
      user: record['user'] as OrderRecord['user'],
      orderItems: orderItems.map((item) => {
        const orderItem = isRecord(item) ? item : {};

        return {
          _id: typeof orderItem['_id'] === 'string' ? orderItem['_id'] : undefined,
          product: typeof orderItem['product'] === 'string' ? orderItem['product'] : undefined,
          variantId: typeof orderItem['variantId'] === 'string' ? orderItem['variantId'] : undefined,
          name: typeof orderItem['name'] === 'string' ? orderItem['name'] : undefined,
          quantity: Number(orderItem['quantity'] || 0),
          price: Number(orderItem['price'] || 0),
          variantImage: typeof orderItem['variantImage'] === 'string' ? orderItem['variantImage'] : undefined,
          vendor: typeof orderItem['vendor'] === 'string' ? orderItem['vendor'] : undefined,
          sku: typeof orderItem['sku'] === 'string' ? orderItem['sku'] : undefined,
          orderItemStatus: orderItem['orderItemStatus'] as OrderItemRecord['orderItemStatus']
        };
      }),
      shippingAddress: record['shippingAddress'] as OrderRecord['shippingAddress'] | undefined,
      paymentInfo: record['paymentInfo'] as OrderRecord['paymentInfo'] | undefined,
      shipment: this.normalizeShipment(record['shipment']),
      itemsPrice: Number(record['itemsPrice'] || 0),
      shippingPrice: Number(record['shippingPrice'] || 0),
      totalAmount: Number(record['totalAmount'] || 0),
      orderStatus: record['orderStatus'] as OrderRecord['orderStatus'],
      paidAt: typeof record['paidAt'] === 'string' ? record['paidAt'] : undefined,
      deliveredAt: typeof record['deliveredAt'] === 'string' ? record['deliveredAt'] : undefined,
      createdAt: typeof record['createdAt'] === 'string' ? record['createdAt'] : undefined,
      updatedAt: typeof record['updatedAt'] === 'string' ? record['updatedAt'] : undefined
    };
  }

  private normalizeShipment(payload: unknown): ShipmentRecord | null {
    if (!isRecord(payload)) {
      return null;
    }

    const record = payload;
    const trackingEvents = Array.isArray(record['trackingEvents']) ? record['trackingEvents'] : [];

    return {
      _id: typeof record['_id'] === 'string' ? record['_id'] : undefined,
      order: typeof record['order'] === 'string' ? record['order'] : undefined,
      courierName: typeof record['courierName'] === 'string' ? record['courierName'] : undefined,
      trackingNumber: typeof record['trackingNumber'] === 'string' ? record['trackingNumber'] : undefined,
      shipmentStatus: typeof record['shipmentStatus'] === 'string' ? record['shipmentStatus'] : undefined,
      estimatedDeliveryDate: typeof record['estimatedDeliveryDate'] === 'string' ? record['estimatedDeliveryDate'] : undefined,
      deliveredAt: typeof record['deliveredAt'] === 'string' ? record['deliveredAt'] : undefined,
      lastSyncedAt: typeof record['lastSyncedAt'] === 'string' ? record['lastSyncedAt'] : undefined,
      isTestMode: Boolean(record['isTestMode']),
      trackingEvents: trackingEvents.map((event) => {
        const trackingEvent = isRecord(event) ? event : {};

        return {
          status: String(trackingEvent['status'] || ''),
          description: typeof trackingEvent['description'] === 'string' ? trackingEvent['description'] : undefined,
          location: typeof trackingEvent['location'] === 'string' ? trackingEvent['location'] : undefined,
          eventTime: typeof trackingEvent['eventTime'] === 'string' ? trackingEvent['eventTime'] : undefined
        };
      })
    };
  }
}
