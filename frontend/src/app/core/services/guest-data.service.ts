import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';

export interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface GuestWishlistItem {
  productId: string;
  variantId?: string;
}

export interface GuestMergeSectionResult {
  attempted: boolean;
  success: boolean;
  skippedItems: Array<{ productId: string; variantId?: string; reason: string }>;
  message: string;
  errorMessage?: string;
  response?: any;
}

export interface GuestMergeResult {
  cart: GuestMergeSectionResult;
  wishlist: GuestMergeSectionResult;
  message: string;
  hasFailures: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GuestDataService {
  private readonly guestCartKey = 'guestCart';
  private readonly guestWishlistKey = 'guestWishlist';
  private readonly guestCartUpdatedEvent = 'guestCartUpdated';
  private readonly guestWishlistUpdatedEvent = 'guestWishlistUpdated';
  private readonly cartUrl = `${environment.apiUrl}/cart`;
  private readonly wishlistUrl = `${environment.apiUrl}/wishlist`;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  getGuestCart(): GuestCartItem[] {
    return this.readItems<GuestCartItem>(this.guestCartKey)
      .map((item) => ({
        productId: String(item.productId || '').trim(),
        variantId: item.variantId ? String(item.variantId).trim() : undefined,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 0))
      }))
      .filter((item) => !!item.productId && item.quantity > 0);
  }

  getGuestCartCount(): number {
    return this.getGuestCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  setGuestCart(items: GuestCartItem[]): GuestCartItem[] {
    const normalized = this.normalizeGuestCart(items);
    this.writeItems(this.guestCartKey, normalized);
    this.dispatchGuestCartUpdated();
    return normalized;
  }

  addToGuestCart(productId: string, variantId?: string, quantity = 1): GuestCartItem[] {
    const normalizedProductId = String(productId || '').trim();
    const normalizedVariantId = String(variantId || '').trim();
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 0));

    if (!normalizedProductId || normalizedQuantity <= 0) {
      return this.getGuestCart();
    }

    const items = this.getGuestCart();
    const itemIndex = items.findIndex(
      (item) => item.productId === normalizedProductId && (item.variantId || '') === normalizedVariantId
    );

    if (itemIndex > -1) {
      items[itemIndex].quantity += normalizedQuantity;
    } else {
      items.push({
        productId: normalizedProductId,
        variantId: normalizedVariantId || undefined,
        quantity: normalizedQuantity
      });
    }

    this.writeItems(this.guestCartKey, items);
    this.dispatchGuestCartUpdated();
    return items;
  }

  removeFromGuestCart(productId: string, variantId?: string): GuestCartItem[] {
    const normalizedProductId = String(productId || '').trim();
    const normalizedVariantId = String(variantId || '').trim();
    const items = this.getGuestCart().filter(
      (item) => !(item.productId === normalizedProductId && (item.variantId || '') === normalizedVariantId)
    );

    this.writeItems(this.guestCartKey, items);
    this.dispatchGuestCartUpdated();
    return items;
  }

  updateGuestCartQuantity(productId: string, variantId?: string, quantity = 1): GuestCartItem[] {
    const normalizedProductId = String(productId || '').trim();
    const normalizedVariantId = String(variantId || '').trim();
    const normalizedQuantity = Math.floor(Number(quantity) || 0);

    if (!normalizedProductId) {
      return this.getGuestCart();
    }

    if (normalizedQuantity <= 0) {
      return this.removeFromGuestCart(normalizedProductId, normalizedVariantId);
    }

    const items = this.getGuestCart().map((item) => {
      if (item.productId === normalizedProductId && (item.variantId || '') === normalizedVariantId) {
        return {
          ...item,
          quantity: normalizedQuantity
        };
      }

      return item;
    });

    this.writeItems(this.guestCartKey, items);
    this.dispatchGuestCartUpdated();
    return items;
  }

  clearGuestCart(): void {
    this.removeItem(this.guestCartKey);
    this.dispatchGuestCartUpdated();
  }

  getGuestWishlist(): GuestWishlistItem[] {
    return this.readItems<GuestWishlistItem>(this.guestWishlistKey).map((item) => ({
      productId: String(item.productId || '').trim(),
      variantId: item.variantId ? String(item.variantId).trim() : undefined
    })).filter((item) => !!item.productId);
  }

  getGuestWishlistCount(): number {
    return this.getGuestWishlist().length;
  }

  setGuestWishlist(items: GuestWishlistItem[]): GuestWishlistItem[] {
    const normalized = this.normalizeGuestWishlist(items);
    this.writeItems(this.guestWishlistKey, normalized);
    this.dispatchGuestWishlistUpdated();
    return normalized;
  }

  addToGuestWishlist(productId: string, variantId?: string): GuestWishlistItem[] {
    const normalizedProductId = String(productId || '').trim();
    const normalizedVariantId = String(variantId || '').trim();

    if (!normalizedProductId) {
      return this.getGuestWishlist();
    }

    const items = this.getGuestWishlist();
    const exists = items.some(
      (item) => item.productId === normalizedProductId && (item.variantId || '') === normalizedVariantId
    );

    if (!exists) {
      items.push({
        productId: normalizedProductId,
        variantId: normalizedVariantId || undefined
      });
      this.writeItems(this.guestWishlistKey, items);
      this.dispatchGuestWishlistUpdated();
    }

    return items;
  }

  removeFromGuestWishlist(productId: string, variantId?: string): GuestWishlistItem[] {
    const normalizedProductId = String(productId || '').trim();
    const normalizedVariantId = String(variantId || '').trim();
    const items = this.getGuestWishlist().filter(
      (item) => !(item.productId === normalizedProductId && (item.variantId || '') === normalizedVariantId)
    );

    this.writeItems(this.guestWishlistKey, items);
    this.dispatchGuestWishlistUpdated();
    return items;
  }

  clearGuestWishlist(): void {
    this.removeItem(this.guestWishlistKey);
    this.dispatchGuestWishlistUpdated();
  }

  getGuestWishlistProductIds(): string[] {
    return this.getGuestWishlist()
      .map((item) => item.productId)
      .filter((item) => !!item);
  }

  mergeGuestDataAfterAuth(): Observable<GuestMergeResult> {
    const currentUser = this.authService.currentUserSnapshot;

    if (!this.isCustomer(currentUser)) {
      return of(this.emptyMergeResult('Guest data merge skipped.'));
    }

    if (!String(currentUser?._id || '').trim()) {
      return of(this.emptyMergeResult('Guest data merge skipped.'));
    }

    const guestCart = this.getGuestCart();
    const guestWishlist = this.getGuestWishlist();

    if (!guestCart.length && !guestWishlist.length) {
      return of(this.emptyMergeResult('No guest items to merge.'));
    }

    const cartRequest$ = guestCart.length
      ? this.mergeGuestCartRequest(guestCart)
      : of(this.emptySectionResult(false, 'No guest cart items found.'));

    const wishlistRequest$ = guestWishlist.length
      ? this.mergeGuestWishlistRequest(guestWishlist)
      : of(this.emptySectionResult(false, 'No guest wishlist items found.'));

    return forkJoin({
      cart: cartRequest$,
      wishlist: wishlistRequest$
    }).pipe(
      tap((result) => {
        if (!guestCart.length || result.cart.success) {
          this.clearGuestCart();
        }

        if (!guestWishlist.length || result.wishlist.success) {
          this.clearGuestWishlist();
        }
      }),
      map((result) => {
        const message = this.buildMergeMessage(result.cart, result.wishlist);
        return {
          cart: result.cart,
          wishlist: result.wishlist,
          message,
          hasFailures: this.hasSectionFailures(result.cart, result.wishlist)
        };
      })
    );
  }

  private mergeGuestCartRequest(items: GuestCartItem[]): Observable<GuestMergeSectionResult> {
    return this.api.post(`${this.cartUrl}/merge-guest-cart`, { items }).pipe(
      tap((response: any) => {
        this.cartService.getCart().subscribe({
          error: () => this.cartService.resetCart()
        });
      }),
      map((response: any) => ({
        attempted: true,
        success: response?.success !== false,
        skippedItems: Array.isArray(response?.skippedItems) ? response.skippedItems : [],
        message: response?.message || 'Guest cart merged successfully.',
        response
      })),
      catchError((error) => of({
        attempted: true,
        success: false,
        skippedItems: [],
        message: 'Guest cart merge failed.',
        errorMessage: this.extractErrorMessage(error)
      }))
    );
  }

  private mergeGuestWishlistRequest(items: GuestWishlistItem[]): Observable<GuestMergeSectionResult> {
    return this.api.post(`${this.wishlistUrl}/merge-guest-wishlist`, { items }).pipe(
      tap((response: any) => {
        this.wishlistService.getWishlist().subscribe({
          error: () => this.wishlistService.resetWishlist()
        });
      }),
      map((response: any) => ({
        attempted: true,
        success: response?.success !== false,
        skippedItems: Array.isArray(response?.skippedItems) ? response.skippedItems : [],
        message: response?.message || 'Guest wishlist merged successfully.',
        response
      })),
      catchError((error) => of({
        attempted: true,
        success: false,
        skippedItems: [],
        message: 'Guest wishlist merge failed.',
        errorMessage: this.extractErrorMessage(error)
      }))
    );
  }

  private emptyMergeResult(message: string): GuestMergeResult {
    const section = this.emptySectionResult(false, message);
    return {
      cart: section,
      wishlist: section,
      message,
      hasFailures: false
    };
  }

  private emptySectionResult(attempted: boolean, message: string): GuestMergeSectionResult {
    return {
      attempted,
      success: true,
      skippedItems: [],
      message
    };
  }

  private buildMergeMessage(cart: GuestMergeSectionResult, wishlist: GuestMergeSectionResult): string {
    const mergedSections = [cart, wishlist].filter((section) => section.attempted && section.success);
    const failedSections = [cart, wishlist].filter((section) => section.attempted && !section.success);

    if (failedSections.length > 0 && mergedSections.length > 0) {
      return 'Some guest items were merged, but a few could not be added. Please review your cart and wishlist.';
    }

    if (failedSections.length > 0) {
      return 'Guest items could not be merged right now. Please try again.';
    }

    if (mergedSections.length > 0) {
      return 'Guest cart/wishlist merged successfully.';
    }

    return 'No guest items to merge.';
  }

  private hasSectionFailures(cart: GuestMergeSectionResult, wishlist: GuestMergeSectionResult): boolean {
    return [cart, wishlist].some((section) => section.attempted && !section.success);
  }

  private normalizeGuestCart(items: GuestCartItem[]): GuestCartItem[] {
    const merged = new Map<string, GuestCartItem>();

    for (const item of Array.isArray(items) ? items : []) {
      const productId = String(item?.productId || '').trim();
      const variantId = String(item?.variantId || '').trim();
      const quantity = Math.max(1, Math.floor(Number(item?.quantity) || 0));

      if (!productId || !quantity) {
        continue;
      }

      const key = `${productId}::${variantId}`;
      const current = merged.get(key);

      if (current) {
        current.quantity += quantity;
        continue;
      }

      merged.set(key, {
        productId,
        variantId: variantId || undefined,
        quantity
      });
    }

    return Array.from(merged.values());
  }

  private normalizeGuestWishlist(items: GuestWishlistItem[]): GuestWishlistItem[] {
    const merged = new Map<string, GuestWishlistItem>();

    for (const item of Array.isArray(items) ? items : []) {
      const productId = String(item?.productId || '').trim();
      const variantId = String(item?.variantId || '').trim();

      if (!productId) {
        continue;
      }

      const key = `${productId}::${variantId}`;
      if (merged.has(key)) {
        continue;
      }

      merged.set(key, {
        productId,
        variantId: variantId || undefined
      });
    }

    return Array.from(merged.values());
  }

  private isCustomer(user: any): boolean {
    if (!user || !user.role) {
      return false;
    }

    const roles = Array.isArray(user.role) ? user.role : [user.role];
    return roles.some((role: string) => String(role).toLowerCase() === 'customer');
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    return window.localStorage;
  }

  private readItems<T>(key: string): T[] {
    const storage = this.getStorage();
    if (!storage) {
      return [];
    }

    const raw = storage.getItem(key);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      storage.removeItem(key);
      return [];
    }
  }

  private writeItems(key: string, items: unknown[]): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(key, JSON.stringify(items));
  }

  private removeItem(key: string): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(key);
  }

  private dispatchGuestCartUpdated(): void {
    this.dispatchWindowEvent(this.guestCartUpdatedEvent);
  }

  private dispatchGuestWishlistUpdated(): void {
    this.dispatchWindowEvent(this.guestWishlistUpdatedEvent);
  }

  private dispatchWindowEvent(name: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new Event(name));
  }

  private extractErrorMessage(error: unknown): string {
    if (!error) {
      return 'Something went wrong. Please try again.';
    }

    if (typeof error === 'string') {
      return error;
    }

    const candidate = error as { error?: { message?: string }; message?: string };
    return candidate?.error?.message || candidate?.message || 'Something went wrong. Please try again.';
  }
}
