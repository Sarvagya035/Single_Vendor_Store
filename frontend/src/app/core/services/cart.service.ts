import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerCart } from '../models/customer.models';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

const EMPTY_CART: CustomerCart = {
  cartItems: [],
  totalCartPrice: 0,
  alerts: null
};

interface CartResponseData {
  cart?: Partial<CustomerCart> & {
    alerts?: string | null;
  };
  alerts?: string | null;
}

type CartResponse = ApiResponse<CartResponseData | Partial<CustomerCart> | null>;

const isCartPayload = (value: unknown): value is CartResponseData | Partial<CustomerCart> => {
  return !!value && typeof value === 'object';
};

const extractCartPayload = (value: CartResponse['data']): Partial<CustomerCart> => {
  if (!isCartPayload(value)) {
    return {};
  }

  if ('cart' in value && isCartPayload(value.cart)) {
    return value.cart;
  }

  return value as Partial<CustomerCart>;
};

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<CustomerCart>(EMPTY_CART);

  readonly cart$ = this.cartSubject.asObservable();

  constructor(private api: ApiService) {}

  get currentCart(): CustomerCart {
    return this.cartSubject.value;
  }

  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>(`${this.cartUrl}/get-cart`).pipe(
      tap((response) => this.cartSubject.next(this.normalizeCart(response)))
    );
  }

  addToCart(productId: string, variantId: string, quantity: number): Observable<CartResponse> {
    return this.api
      .post<CartResponse>(`${this.cartUrl}/add-to-cart`, { productId, variantId, quantity })
      .pipe(tap(() => this.refreshCartState()));
  }

  updateQuantity(productId: string, variantId: string, action: 'inc' | 'dec'): Observable<CartResponse> {
    return this.api
      .patch<CartResponse>(`${this.cartUrl}/update-cart`, { productId, variantId, action })
      .pipe(tap(() => this.refreshCartState()));
  }

  removeItem(variantId: string): Observable<CartResponse> {
    return this.api
      .delete<CartResponse>(`${this.cartUrl}/delete-cart/${variantId}`)
      .pipe(tap(() => this.refreshCartState()));
  }

  clearCart(): Observable<CartResponse> {
    return this.api.delete<CartResponse>(`${this.cartUrl}/clear-cart`).pipe(
      tap(() => {
        this.cartSubject.next(EMPTY_CART);
      })
    );
  }

  resetCart(): void {
    this.cartSubject.next(EMPTY_CART);
  }

  private refreshCartState(): void {
    this.getCart()
      .pipe(
        catchError(() => {
          this.resetCart();
          return of(null);
        })
      )
      .subscribe();
  }

  private normalizeCart(response: CartResponse): CustomerCart {
    const responseData = response?.data;
    const payload = extractCartPayload(responseData);

    return {
      cartItems: Array.isArray(payload.cartItems) ? payload.cartItems : [],
      totalCartPrice: Number(payload.totalCartPrice || 0),
      alerts: isCartPayload(responseData) && 'alerts' in responseData ? responseData.alerts ?? null : null
    };
  }
}
