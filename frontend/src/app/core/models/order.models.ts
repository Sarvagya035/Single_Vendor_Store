export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderShippingAddress {
  address: string;
  city: string;
  pincode: string;
  phone: string;
}

export interface OrderPaymentInfo {
  id?: string;
  paymentId?: string;
  status?: string;
  method?: 'COD' | 'Online' | string;
}

export interface OrderItemRecord {
  _id?: string;
  product?: string;
  variantId?: string;
  name?: string;
  quantity?: number;
  price?: number;
  variantImage?: string;
  vendor?: string;
  sku?: string;
  orderItemStatus?: OrderStatus;
}

export interface OrderUserSummary {
  _id?: string;
  fullName?: string;
  fullname?: string;
  username?: string;
  email?: string;
}

export interface OrderRecord {
  _id?: string;
  user?: string | OrderUserSummary;
  orderItems?: OrderItemRecord[];
  shippingAddress?: OrderShippingAddress;
  paymentInfo?: OrderPaymentInfo;
  itemsPrice?: number;
  shippingPrice?: number;
  totalAmount?: number;
  orderStatus?: OrderStatus;
  paidAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderCheckoutItemPayload {
  product: string;
  variantId: string;
  quantity: number;
  priceAtAddition?: number;
}

export interface OrderCheckoutPayload {
  orderItems: OrderCheckoutItemPayload[];
  shippingAddress: OrderShippingAddress;
}

export interface RazorpayOrderPayload {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
}

export interface CheckoutResponseData {
  orderId?: string;
  razorOrder?: RazorpayOrderPayload;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface StoreOrdersResponse {
  orders: OrderRecord[];
  totalRevenue: number;
}
