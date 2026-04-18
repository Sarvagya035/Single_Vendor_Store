import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { CustomerWishlist } from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly wishlistUrl = `${environment.apiUrl}/wishlist`;

  constructor(private api: ApiService) {}

  getWishlist(): Observable<CustomerWishlist> {
    return this.api.get(`${this.wishlistUrl}/get-wishlist`).pipe(
      map((response: any) => this.normalizeWishlist(response?.data))
    );
  }

  toggleWishlist(productId: string): Observable<CustomerWishlist> {
    return this.api.post(`${this.wishlistUrl}/toggle/${productId}`, {}).pipe(
      map((response: any) => this.normalizeWishlist(response?.data))
    );
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
