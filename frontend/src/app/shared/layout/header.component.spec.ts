import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let authService: any;
  let cartService: any;
  let vendorService: any;
  let router: any;
  let appRefreshService: any;
  let currentUser$: BehaviorSubject<any>;
  let cart$: BehaviorSubject<any>;

  function createComponent(): HeaderComponent {
    return new HeaderComponent(authService, cartService, vendorService, router, appRefreshService);
  }

  beforeEach(() => {
    currentUser$ = new BehaviorSubject<any>(null);
    cart$ = new BehaviorSubject<any>({ cartItems: [], totalCartPrice: 0, alerts: null });

    authService = {
      getCurrentUser: vi.fn(() => of({ success: true, data: null })),
      logout: vi.fn(() => of({ success: true })),
      clearCurrentUser: vi.fn(),
      currentUser$: currentUser$.asObservable()
    };

    cartService = {
      getCart: vi.fn(() => of({ data: { cart: { cartItems: [] } } })),
      resetCart: vi.fn(),
      cart$: cart$.asObservable()
    };

    vendorService = {
      getVendorNotifications: vi.fn(() => of({ summary: { unreadNotifications: 0 } }))
    };

    router = { navigate: vi.fn() };
    appRefreshService = {
      refresh$: of(null)
    };
  });

  it('routes the logo to vendor dashboard for vendor users', () => {
    const component = createComponent();
    component.user = { role: ['vendor'] };

    expect(component.logoRoute()).toBe('/vendor/dashboard');
  });

  it('routes the logo to vendor dashboard for admin users', () => {
    const component = createComponent();
    component.user = { role: 'admin' };

    expect(component.logoRoute()).toBe('/vendor/dashboard');
  });

  it('falls back to home for customer users', () => {
    const component = createComponent();
    component.user = { role: ['customer'] };

    expect(component.logoRoute()).toBe('/');
  });

  it('shows the public nav links for customers', () => {
    const component = createComponent();
    component.user = { role: ['customer'] };

    expect(component.showPublicNavLinks()).toBe(true);
  });

  it('hides the public nav links for vendor users', () => {
    const component = createComponent();
    component.user = { role: ['vendor'] };

    expect(component.showPublicNavLinks()).toBe(false);
  });

  it('hides the public nav links for admin users', () => {
    const component = createComponent();
    component.user = { role: 'admin' };

    expect(component.showPublicNavLinks()).toBe(false);
  });

  it('shows the announcement bar for public users', () => {
    const component = createComponent();
    component.user = { role: ['customer'] };

    expect(component.showAnnouncementBar()).toBe(true);
  });

  it('hides the announcement bar for vendor users', () => {
    const component = createComponent();
    component.user = { role: ['vendor'] };

    expect(component.showAnnouncementBar()).toBe(false);
  });

  it('closes other menus before opening the mobile menu', () => {
    const component = createComponent();
    component.isDropdownOpen = true;
    component.isVendorDropdownOpen = true;

    component.toggleMenu();

    expect(component.isMenuOpen).toBe(true);
    expect(component.isDropdownOpen).toBe(false);
    expect(component.isVendorDropdownOpen).toBe(false);
  });

  it('logs out and navigates home when a logout menu item is handled', () => {
    const component = createComponent();
    component.user = { role: ['vendor'] };

    component.handleVendorItem({ label: 'Logout', action: 'logout', tone: 'danger' });

    expect(authService.logout).toHaveBeenCalled();
    expect(cartService.resetCart).toHaveBeenCalled();
    expect(authService.clearCurrentUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
