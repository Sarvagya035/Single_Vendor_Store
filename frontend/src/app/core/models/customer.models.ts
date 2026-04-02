export interface CustomerUser {
  _id?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string | string[];
  createdAt?: string;
}

export interface CustomerProfileForm {
  username: string;
  phone: string;
  avatar: string;
}

export interface CustomerPasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CustomerAddress {
  _id?: string;
  fullname: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface CustomerAddressForm {
  fullname: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerCatalogVariant {
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

export interface CustomerCatalogProduct {
  _id: string;
  productName: string;
  productDescription?: string;
  brand?: string;
  isActive?: boolean;
  averageRating?: number;
  numberOfReviews?: number;
  createdAt?: string;
  category?: string;
  mainImages?: string[];
  basePrice?: number;
  variants?: CustomerCatalogVariant[];
  displayVariant?: CustomerCatalogVariant;
  categoryDetails?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  availableVariants?: CustomerCatalogVariant[];
}

export interface CustomerLandingCategoryGroup {
  categoryName?: string;
  categorySlug?: string;
  categoryImage?: string;
  products: CustomerCatalogProduct[];
}

export interface CustomerLandingCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  level?: number;
  parentCategory?: string | null;
}

export interface CustomerCartProduct {
  _id?: string;
  productName?: string;
  brand?: string;
  mainImages?: string[];
  variants?: CustomerCatalogVariant[];
}

export interface CustomerCartItem {
  product?: CustomerCartProduct;
  variantId?: string;
  quantity?: number;
  priceAtAddition?: number;
}

export interface CustomerCart {
  cartItems: CustomerCartItem[];
  totalCartPrice: number;
  alerts?: string | null;
}
