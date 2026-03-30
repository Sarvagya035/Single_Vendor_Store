import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerCart } from '../models/customer.models';

const EMPTY_CART: CustomerCart = {
  cartItems: [],
  totalCartPrice: 0,
  alerts: null
};

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<CustomerCart>(EMPTY_CART);

  readonly cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentCart(): CustomerCart {
    return this.cartSubject.value;
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.cartUrl}/get-cart`, { withCredentials: true }).pipe(
      tap((response: any) => this.cartSubject.next(this.normalizeCart(response)))
    );
  }

  addToCart(productId: string, variantId: string, quantity: number): Observable<any> {
    return this.http
      .post(
        `${this.cartUrl}/add-to-cart`,
        { productId, variantId, quantity },
        { withCredentials: true }
      )
      .pipe(tap(() => this.refreshCartState()));
  }

  updateQuantity(productId: string, variantId: string, action: 'inc' | 'dec'): Observable<any> {
    return this.http
      .patch(
        `${this.cartUrl}/update-cart`,
        { productId, variantId, action },
        { withCredentials: true }
      )
      .pipe(tap(() => this.refreshCartState()));
  }

  removeItem(variantId: string): Observable<any> {
    return this.http
      .delete(`${this.cartUrl}/delete-cart/${variantId}`, { withCredentials: true })
      .pipe(tap(() => this.refreshCartState()));
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.cartUrl}/clear-cart`, { withCredentials: true }).pipe(
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

  private normalizeCart(response: any): CustomerCart {
    const payload = response?.data?.cart ?? response?.data ?? {};

    return {
      cartItems: Array.isArray(payload?.cartItems) ? payload.cartItems : [],
      totalCartPrice: Number(payload?.totalCartPrice || 0),
      alerts: response?.data?.alerts ?? null
    };
  }
}
