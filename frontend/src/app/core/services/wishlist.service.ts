import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { CustomerWishlist } from '../models/customer.models';

const EMPTY_WISHLIST: CustomerWishlist = {
  products: []
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
    return this.api.get(`${this.wishlistUrl}/get-wishlist`).pipe(
      map((response: any) => this.normalizeWishlist(response?.data)),
      tap((wishlist) => this.wishlistSubject.next(wishlist))
    );
  }

  toggleWishlist(productId: string): Observable<CustomerWishlist> {
    return this.api.post(`${this.wishlistUrl}/toggle/${productId}`, {}).pipe(
      map((response: any) => this.normalizeWishlist(response?.data)),
      tap((wishlist) => this.wishlistSubject.next(wishlist))
    );
  }

  resetWishlist(): void {
    this.wishlistSubject.next(EMPTY_WISHLIST);
  }

  private normalizeWishlist(payload: any): CustomerWishlist {
    return {
      _id: payload?._id,
      owner: payload?.owner,
      products: Array.isArray(payload?.products) ? payload.products : [],
      createdAt: payload?.createdAt,
      updatedAt: payload?.updatedAt
    };
  }
}
