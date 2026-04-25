import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { GuestDataService } from './guest-data.service';

export interface CartActionResult {
  success: boolean;
  message: string;
  isGuest: boolean;
  response?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartActionService {
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private guestDataService: GuestDataService
  ) {}

  addToCart(productId: string, variantId?: string, quantity = 1): Observable<CartActionResult> {
    const normalizedProductId = String(productId || '').trim();
    const normalizedVariantId = String(variantId || '').trim();
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 0));

    if (!normalizedProductId || !normalizedVariantId || normalizedQuantity <= 0) {
      return of({
        success: false,
        message: 'Select a valid variant first.',
        isGuest: !this.isCustomer()
      });
    }

    if (!this.isCustomer()) {
      this.guestDataService.addToGuestCart(normalizedProductId, normalizedVariantId, normalizedQuantity);
      return of({
        success: true,
        message: 'Item added to your device cart.',
        isGuest: true
      });
    }

    return this.cartService.addToCart(normalizedProductId, normalizedVariantId, normalizedQuantity).pipe(
      map((response: any) => ({
        success: response?.success !== false,
        message: response?.message || 'Item added to cart.',
        isGuest: false,
        response
      })),
      catchError((error) =>
        of({
          success: false,
          message: this.extractErrorMessage(error),
          isGuest: false
        })
      )
    );
  }

  private isCustomer(): boolean {
    const user = this.authService.currentUserSnapshot;
    if (!user || !user.role) {
      return false;
    }

    const roles = Array.isArray(user.role) ? user.role : [user.role];
    return roles.some((role: string) => String(role).toLowerCase() === 'customer');
  }

  private extractErrorMessage(error: unknown): string {
    if (!error) {
      return 'Unable to add this item to the cart right now.';
    }

    if (typeof error === 'string') {
      return error;
    }

    const candidate = error as { error?: { message?: string }; message?: string };
    return candidate?.error?.message || candidate?.message || 'Unable to add this item to the cart right now.';
  }
}
