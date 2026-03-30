export type AdminView = 'pending' | 'vendors' | 'categories' | 'users';
export type VendorTab = 'active' | 'rejected';
export type ToastType = 'success' | 'error';

export interface VendorRecord {
  _id: string;
  shopName?: string;
  vendorLogo?: string;
  vendorDescription?: string;
  vendorAddress?: string;
  gstNumber?: string;
  createdAt?: string;
  verificationStatus?: string;
  adminRemarks?: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  _processing?: boolean;
}

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
  vendor?: {
    _id?: string;
    shopName?: string;
    vendorLogo?: string;
  } | string;
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
