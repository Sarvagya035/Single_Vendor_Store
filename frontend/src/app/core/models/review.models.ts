export interface ProductReviewUser {
  _id?: string;
  username?: string;
  avatar?: string;
  email?: string;
}

export interface ProductReview {
  _id?: string;
  user?: ProductReviewUser;
  product?: string;
  title?: string;
  commentBody?: string;
  rating?: number;
  reviewImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductReviewStat {
  _id: number;
  count: number;
}

export interface ProductReviewForm {
  productId: string;
  title: string;
  commentBody: string;
  rating: number;
  reviewImages?: string[];
}
