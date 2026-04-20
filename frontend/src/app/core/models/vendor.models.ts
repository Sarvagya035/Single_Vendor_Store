import { CustomerUser } from './customer.models';

export interface VendorProfile {
  _id?: string;
  shopName?: string;
  vendorLogo?: string;
  vendorDescription?: string;
  vendorAddress?: string;
  gstNumber?: string;
  verificationStatus?: string;
  bankDetails?: VendorBankDetails;
}

export type ToastType = 'success' | 'error';

export type VendorDashboardView =
  | 'dashboard'
  | 'profile'
  | 'products'
  | 'orders'
  | 'categories'
  | 'customers'
  | 'shipments'
  | 'best-selling-products';
export type ReportRange = 'weekly' | 'monthly' | 'custom';
export type ReportFormat = 'csv' | 'pdf';

export interface VendorDetailsForm {
  vendorAddress: string;
  vendorDescription: string;
}

export interface VendorBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
}

export interface VendorBankDetailsForm {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string;
}

export type VendorMessageType = 'success' | 'error';

export interface VendorProductCategoryDetails {
  _id?: string;
  name?: string;
  slug?: string;
}

export interface VendorProductVariant {
  _id?: string;
  attributes?: Record<string, string>;
  productPrice?: number;
  discountPercentage?: number;
  finalPrice?: number;
  productStock?: number;
  isAvailable?: boolean;
  sku?: string;
  variantImage?: string;
}

export interface VendorProductRecord {
  _id: string;
  productName: string;
  productDescription?: string;
  brand?: string;
  category?: string;
  basePrice?: number;
  mainImages?: string[];
  variantOptions?: Array<{
    name?: string;
    values?: string[];
  }>;
  variants?: VendorProductVariant[];
  isActive?: boolean;
  categoryDetails?: VendorProductCategoryDetails;
  createdAt?: string;
}

export interface VendorCategoryRecord {
  _id: string;
  name: string;
  slug?: string;
  level?: number;
  children?: VendorCategoryRecord[];
}

export interface VendorCustomersPagination {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface VendorCustomersResponse {
  users: CustomerUser[];
  pagination: VendorCustomersPagination;
}

export interface VendorProductOptionForm {
  name: string;
  valuesText: string;
}

export interface VendorProductVariantForm {
  attributesText: string;
  productPrice: number | null;
  discountPercentage: number | null;
  productStock: number | null;
  sku: string;
  imageFile: File | null;
}

export interface VendorProductEditForm {
  productName: string;
  productDescription: string;
  brand: string;
  category: string;
  isActive: boolean;
}

export interface VendorVariantCreateForm {
  attributesText: string;
  productPrice: number | null;
  discountPercentage: number | null;
  productStock: number | null;
  imageFile: File | null;
}

export interface VendorVariantUpdateForm {
  attributesText: string;
  productPrice: number | null;
  discountPercentage: number | null;
  productStock: number | null;
  sku: string;
  imageFile: File | null;
}

export interface VendorAnalyticsSummary {
  totalRevenue: number;
  totalItemsSold: number;
  totalOrdersCount: number;
}

export interface VendorProductSaleRecord {
  _id?: string;
  productName?: string;
  quantitySold?: number;
  revenueGenerated?: number;
}

export interface VendorAnalyticsPayload {
  summary: VendorAnalyticsSummary;
  productWiseSales: VendorProductSaleRecord[];
}

export interface VendorSoldItemRecord {
  _id?: string;
  product?: string;
  name?: string;
  quantity?: number;
  price?: number;
  variantImage?: string;
  orderItemStatus?: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
}

export interface VendorSoldOrderRecord {
  orderId?: string;
  date?: string;
  items?: VendorSoldItemRecord[];
  orderStatus?: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
}

export interface OrderReportRequest {
  range: ReportRange;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
}

export type AdminShipmentStatus = 'Created' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception';

export interface AdminShipmentUpdatePayload {
  courierName?: string;
  trackingNumber?: string;
  shipmentStatus?: AdminShipmentStatus | string;
  estimatedDeliveryDate?: string;
  description?: string;
  location?: string;
  isTestMode?: boolean;
}
