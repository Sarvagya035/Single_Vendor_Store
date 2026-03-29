import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductReview, ProductReviewForm, ProductReviewStat } from '../models/review.models';
import { SKIP_GLOBAL_ERROR_NOTIFICATION } from '../interceptors/request-flags';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly reviewUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getProductReviews(productId: string): Observable<ProductReview[]> {
    return this.http
      .get<any>(`${this.reviewUrl}/get-review/${productId}`)
      .pipe(map((response) => this.normalizeReviews(response?.data)));
  }

  getReviewStats(productId: string): Observable<ProductReviewStat[]> {
    return this.http
      .get<any>(`${this.reviewUrl}/stats/${productId}`)
      .pipe(map((response) => this.normalizeStats(response?.data)));
  }

  addOrUpdateReview(payload: ProductReviewForm): Observable<ProductReview | null> {
    return this.http
      .post<any>(`${this.reviewUrl}/add-review`, payload, {
        withCredentials: true,
        context: new HttpContext().set(SKIP_GLOBAL_ERROR_NOTIFICATION, true)
      })
      .pipe(map((response) => this.normalizeReview(response?.data)));
  }

  private normalizeReviews(payload: unknown): ProductReview[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((review) => this.normalizeReview(review))
      .filter((review): review is ProductReview => !!review);
  }

  private normalizeStats(payload: unknown): ProductReviewStat[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((entry) => ({
        _id: Number((entry as any)?._id || 0),
        count: Number((entry as any)?.count || 0)
      }))
      .filter((entry) => entry._id >= 1 && entry._id <= 5);
  }

  private normalizeReview(payload: any): ProductReview | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    return {
      _id: payload._id,
      user: payload.user,
      product: payload.product,
      title: payload.title,
      commentBody: payload.commentBody,
      rating: Number(payload.rating || 0),
      reviewImages: Array.isArray(payload.reviewImages) ? payload.reviewImages : [],
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt
    };
  }
}
