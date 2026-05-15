import { CustomerCatalogProduct } from '../../../core/models/customer.models';
import { ProductReview, ProductReviewStat } from '../../../core/models/review.models';

export function reviewAuthor(review: ProductReview): string {
  return review.user?.username || review.user?.email || 'Customer';
}

export function reviewCountForStar(reviewStats: ProductReviewStat[], star: number): number {
  return reviewStats.find((entry) => entry._id === star)?.count || 0;
}

export function reviewTotalCount(
  reviewStats: ProductReviewStat[],
  reviews: ProductReview[],
  product?: CustomerCatalogProduct | null
): number {
  const statsTotal = reviewStats.reduce((sum, entry) => sum + (entry.count || 0), 0);
  return statsTotal || reviews.length || product?.numberOfReviews || 0;
}

export function ratingBreakdown(
  reviewStats: ProductReviewStat[],
  reviews: ProductReview[],
  product?: CustomerCatalogProduct | null
): Array<{ star: number; count: number; percentage: number }> {
  const total = reviewTotalCount(reviewStats, reviews, product) || 1;

  return [5, 4, 3, 2, 1].map((star) => {
    const count = reviewCountForStar(reviewStats, star);
    return {
      star,
      count,
      percentage: Math.round((count / total) * 100)
    };
  });
}

export function isStarFilled(rating: number, star: number): boolean {
  return star <= Math.round(Number(rating || 0));
}

export function formatRating(value: number): string {
  return Number(value || 0).toFixed(1);
}

export function formatDate(value?: string): string {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}
