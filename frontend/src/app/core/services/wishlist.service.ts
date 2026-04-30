import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { CustomerWishlist, CustomerWishlistProduct } from '../models/customer.models';

const EMPTY_WISHLIST: CustomerWishlist = {
  products: []
};

type WishlistItem = CustomerWishlistProduct;

interface WishlistResponsePayload {
  _id?: string;
  owner?: string;
  products?: WishlistItem[];
  createdAt?: string;
  updatedAt?: string;
}

type WishlistApiResponse = ApiResponse<WishlistResponsePayload | null>;

const isWishlistPayload = (value: unknown): value is WishlistResponsePayload => {
  return !!value && typeof value === 'object';
};

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly wishlistUrl = `${environment.apiUrl}/wishlist`;
  private wishlistSubject = new BehaviorSubject<CustomerWishlist>(EMPTY_WISHLIST);

  readonly wishlist$ = this.wishlistSubject.asObservable();

  constructor(private api: ApiService) {}

  get currentWishlist(): CustomerWishlist {
    return this.wishlistSubject.value;
  }

  getWishlist(): Observable<CustomerWishlist> {
    return this.api.get<WishlistApiResponse>(`${this.wishlistUrl}/get-wishlist`).pipe(
      map((response) => this.normalizeWishlist(response?.data)),
      tap((wishlist) => this.wishlistSubject.next(wishlist))
    );
  }

  toggleWishlist(productId: string): Observable<CustomerWishlist> {
    return this.api.post<WishlistApiResponse>(`${this.wishlistUrl}/toggle/${productId}`, {}).pipe(
      map((response) => this.normalizeWishlist(response?.data)),
      tap((wishlist) => this.wishlistSubject.next(wishlist))
    );
  }

  resetWishlist(): void {
    this.wishlistSubject.next(EMPTY_WISHLIST);
  }

  private normalizeWishlist(payload: unknown): CustomerWishlist {
    const normalizedPayload = isWishlistPayload(payload) ? payload : {};

    return {
      _id: normalizedPayload._id,
      owner: normalizedPayload.owner,
      products: Array.isArray(normalizedPayload.products) ? normalizedPayload.products : [],
      createdAt: normalizedPayload.createdAt,
      updatedAt: normalizedPayload.updatedAt
    };
  }
}
