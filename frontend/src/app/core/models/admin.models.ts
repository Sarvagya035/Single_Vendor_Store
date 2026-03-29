export type AdminView = 'categories' | 'users';
export type ToastType = 'success' | 'error';

export interface CategoryRecord {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentCategory?: string | null;
  level?: number;
  isActive?: boolean;
  children?: CategoryRecord[];
  _processing?: boolean;
}

export interface AdminUserRecord {
  _id: string;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string | string[];
  createdAt?: string;
  updatedAt?: string;
  _processing?: boolean;
}

export interface AdminUserPagination {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminUsersResponse {
  users: AdminUserRecord[];
  pagination: AdminUserPagination;
}

export interface AdminProductVariant {
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

export interface AdminProductRecord {
  _id: string;
  productName: string;
  productDescription?: string;
  brand?: string;
  category?: {
    _id?: string;
    name?: string;
  } | string;
  mainImages?: string[];
  variants?: AdminProductVariant[];
  variantOptions?: Array<{
    name?: string;
    values?: string[];
  }>;
  isActive?: boolean;
  basePrice?: number;
  createdAt?: string;
}

export interface DashboardChartSeries {
  labels: string[];
  data: number[];
}

export interface DashboardAnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  revenueLast30: number;
  revenuePrevious30: number;
  ordersLast30: number;
  ordersPrevious30: number;
  customersLast30: number;
  customersPrevious30: number;
}

export interface DashboardAnalyticsResponse {
  summary: DashboardAnalyticsSummary;
  charts: {
    salesOverview: DashboardChartSeries;
    revenueTrend: DashboardChartSeries;
    ordersTrend: DashboardChartSeries;
    customerGrowth: DashboardChartSeries;
  };
}
