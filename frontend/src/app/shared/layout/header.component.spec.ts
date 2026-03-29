import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let authService: any;
  let cartService: any;
  let router: any;
  let appRefreshService: any;
  let currentUser$: BehaviorSubject<any>;
  let cart$: BehaviorSubject<any>;

  function createComponent(): HeaderComponent {
    return new HeaderComponent(authService, cartService, router, appRefreshService);
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

    router = { navigate: vi.fn() };
    appRefreshService = {
      refresh$: of(null)
    };
  });

  it('routes the logo to admin dashboard for admin users', () => {
    const component = createComponent();
    component.user = { role: 'admin' };

    expect(component.logoRoute()).toBe('/admin/dashboard');
  });

  it('falls back to home for customer users', () => {
    const component = createComponent();
    component.user = { role: ['customer'] };

    expect(component.logoRoute()).toBe('/');
  });

  it('closes other menus before opening the mobile menu', () => {
    const component = createComponent();
    component.isDropdownOpen = true;
    component.isAdminDropdownOpen = true;

    component.toggleMenu();

    expect(component.isMenuOpen).toBe(true);
    expect(component.isDropdownOpen).toBe(false);
    expect(component.isAdminDropdownOpen).toBe(false);
  });

  it('logs out and navigates home when a logout menu item is handled', () => {
    const component = createComponent();
    component.user = { role: ['customer'] };

    component.handleCustomerItem({ label: 'Logout', action: 'logout', tone: 'danger' });

    expect(authService.logout).toHaveBeenCalled();
    expect(cartService.resetCart).toHaveBeenCalled();
    expect(authService.clearCurrentUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
