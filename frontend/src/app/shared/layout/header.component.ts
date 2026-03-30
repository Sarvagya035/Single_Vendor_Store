import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppRefreshService } from '../../core/services/app-refresh.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { HeaderAccountDropdownComponent, HeaderDropdownItem } from './header-account-dropdown.component';
import { HeaderMobileMenuComponent } from './header-mobile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderAccountDropdownComponent, HeaderMobileMenuComponent],
  template: `
    <nav class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-18 items-center justify-between">
          <a [routerLink]="logoRoute()" class="group flex flex-shrink-0 items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-100 transition-transform group-hover:scale-110">
              <span class="text-lg font-bold text-white">E</span>
            </div>
            <span class="text-lg font-bold tracking-tight text-slate-900">E-Commerce</span>
          </a>

          <div class="hidden items-center space-x-6 md:flex">
            <a *ngIf="showHomeLink()" routerLink="/" class="nav-link" routerLinkActive="text-indigo-600 after:w-full">Home</a>

            <ng-container *ngIf="user && !isCustomer()">
              <app-header-account-dropdown
                *ngIf="isAdmin(); else vendorDesktopMenu"
                theme="admin"
                subtitle="Admin account"
                [open]="isAdminDropdownOpen"
                [avatarUrl]="avatarUrl()"
                [initials]="userInitials()"
                [displayName]="displayName()"
                [email]="user?.email || ''"
                [items]="adminMenuItems"
                (toggle)="toggleAdminDropdown($event)"
                (itemSelected)="handleAdminItem($event)"
              />

              <ng-template #vendorDesktopMenu>
                <app-header-account-dropdown
                  theme="vendor"
                  subtitle="Vendor account"
                  [open]="isVendorDropdownOpen"
                  [avatarUrl]="avatarUrl()"
                  [initials]="userInitials()"
                  [displayName]="displayName()"
                  [email]="user?.email || ''"
                  [items]="vendorMenuItems"
                  (toggle)="toggleVendorDropdown($event)"
                  (itemSelected)="handleVendorItem($event)"
                />
              </ng-template>
            </ng-container>

            <ng-container *ngIf="isCustomer()">
              <a
                routerLink="/cart"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Cart
                <span class="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{{ cartCount }}</span>
              </a>

              <app-header-account-dropdown
                theme="customer"
                subtitle="Account"
                [open]="isDropdownOpen"
                [avatarUrl]="avatarUrl()"
                [initials]="userInitials()"
                [displayName]="customerDisplayName()"
                [email]="user?.email || ''"
                [items]="customerMenuItems"
                (toggle)="toggleDropdown($event)"
                (itemSelected)="handleCustomerItem($event)"
              />
            </ng-container>

            <ng-container *ngIf="!user">
              <a routerLink="/login" class="nav-link">Login</a>
              <a routerLink="/register" class="btn-primary !px-5 !py-2 text-sm">Register</a>
            </ng-container>
          </div>

          <div class="flex items-center gap-3 md:hidden">
            <a
              *ngIf="isCustomer()"
              routerLink="/cart"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700"
            >
              Cart
              <span class="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{{ cartCount }}</span>
            </a>

            <app-header-account-dropdown
              *ngIf="isCustomer()"
              theme="customer"
              [desktop]="false"
              [open]="isDropdownOpen"
              [avatarUrl]="avatarUrl()"
              [initials]="userInitials()"
              [displayName]="customerDisplayName()"
              [email]="user?.email || ''"
              [items]="customerMenuItems"
              (toggle)="toggleDropdown($event)"
              (itemSelected)="handleCustomerItem($event)"
            />

            <app-header-account-dropdown
              *ngIf="user && isVendor()"
              theme="vendor"
              [desktop]="false"
              [open]="isVendorDropdownOpen"
              [avatarUrl]="avatarUrl()"
              [initials]="userInitials()"
              [displayName]="displayName()"
              [email]="user?.email || ''"
              [items]="vendorMenuItems"
              (toggle)="toggleVendorDropdown($event)"
              (itemSelected)="handleVendorItem($event)"
            />

            <app-header-account-dropdown
              *ngIf="user && isAdmin()"
              theme="admin"
              [desktop]="false"
              [open]="isAdminDropdownOpen"
              [avatarUrl]="avatarUrl()"
              [initials]="userInitials()"
              [displayName]="displayName()"
              [email]="user?.email || ''"
              [items]="adminMenuItems"
              (toggle)="toggleAdminDropdown($event)"
              (itemSelected)="handleAdminItem($event)"
            />

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              (click)="toggleMenu()"
              aria-label="Toggle menu"
              data-mobile-menu-trigger
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  [attr.d]="isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <app-header-mobile-menu
        [open]="isMenuOpen"
        [loggedIn]="!!user"
        [isAdmin]="isAdmin()"
        [isVendor]="isVendor()"
        [showHomeLink]="showHomeLink()"
        (close)="closeMobileMenu()"
        (logout)="onMobileLogout()"
      />
    </nav>
  `
})
export class HeaderComponent implements OnInit {
  user: any = null;
  isMenuOpen = false;
  cartCount = 0;
  isDropdownOpen = false;
  isAdminDropdownOpen = false;
  isVendorDropdownOpen = false;

  readonly customerMenuItems: HeaderDropdownItem[] = [
    { label: 'Profile', route: '/profile' },
    { label: 'My Orders', route: '/orders' },
    { label: 'My Addresses', route: '/addresses' },
    { label: 'Become a Vendor', route: '/vendor/register', tone: 'accent' },
    { label: 'Logout', action: 'logout', tone: 'danger' }
  ];

  readonly vendorMenuItems: HeaderDropdownItem[] = [
    { label: 'Profile', route: '/profile' },
    { label: 'Orders', route: '/vendor/orders' },
    { label: 'Store profile', route: '/vendor/profile', tone: 'accent' },
    { label: 'Logout', action: 'logout', tone: 'danger' }
  ];

  readonly adminMenuItems: HeaderDropdownItem[] = [
    { label: 'Profile', route: '/profile' },
    { label: 'Orders', route: '/admin/orders' },
    { label: 'Logout', action: 'logout', tone: 'danger' }
  ];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;

      if (this.isCustomer()) {
        this.cartService.getCart().subscribe({
          error: () => this.cartService.resetCart()
        });
      } else {
        this.cartService.resetCart();
        this.closeAllMenus();
      }
    });

    this.cartService.cart$.subscribe((cart) => {
      this.cartCount = (cart.cartItems || []).reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );
    });

    this.authService.getCurrentUser().subscribe({
      error: () => this.authService.clearCurrentUser()
    });

    this.appRefreshService.refresh$.subscribe((scope) => {
      if (scope === 'global' || scope === 'auth') {
        this.authService.refreshCurrentUser().subscribe({
          error: () => this.authService.clearCurrentUser()
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const clickedInsideAccountDropdown = !!target.closest('[data-account-dropdown]');
    const clickedInsideMobileMenu = !!target.closest('[data-mobile-menu-panel], [data-mobile-menu-trigger]');

    if (!clickedInsideAccountDropdown) {
      this.closeDropdown();
      this.closeAdminDropdown();
      this.closeVendorDropdown();
    }

    if (!clickedInsideMobileMenu) {
      this.isMenuOpen = false;
    }
  }

  @HostListener('window:resize')
  handleResize(): void {
    return;
  }

  toggleMenu() {
    this.closeDropdown();
    this.closeAdminDropdown();
    this.closeVendorDropdown();
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMenuOpen = false;
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.closeAdminDropdown();
    this.closeVendorDropdown();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleAdminDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isMenuOpen = false;
    this.closeDropdown();
    this.closeVendorDropdown();
    this.isAdminDropdownOpen = !this.isAdminDropdownOpen;
  }

  closeAdminDropdown(): void {
    this.isAdminDropdownOpen = false;
  }

  toggleVendorDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isMenuOpen = false;
    this.closeDropdown();
    this.closeAdminDropdown();
    this.isVendorDropdownOpen = !this.isVendorDropdownOpen;
  }

  closeVendorDropdown(): void {
    this.isVendorDropdownOpen = false;
  }

  closeAllMenus(): void {
    this.isMenuOpen = false;
    this.closeDropdown();
    this.closeAdminDropdown();
    this.closeVendorDropdown();
  }

  hasAvatar(): boolean {
    return typeof this.user?.avatar === 'string' && this.user.avatar.startsWith('http');
  }

  avatarUrl(): string {
    return this.hasAvatar() ? this.user.avatar : '';
  }

  displayName(): string {
    return String(this.user?.username || this.user?.fullname || this.user?.email || 'Vendor').trim();
  }

  customerDisplayName(): string {
    return String(this.user?.username || this.user?.fullname || this.user?.email || 'Customer').trim();
  }

  userInitials(): string {
    const name = this.isCustomer() ? this.customerDisplayName() : this.displayName();
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'U';
  }

  isAdmin(): boolean {
    if (!this.user?.role) return false;
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((r: string) => r.toLowerCase() === 'admin');
    }
    return String(this.user.role).toLowerCase() === 'admin';
  }

  isVendor(): boolean {
    if (!this.user?.role) return false;
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((r: string) => r.toLowerCase() === 'vendor');
    }
    return String(this.user.role).toLowerCase() === 'vendor';
  }

  isCustomer(): boolean {
    return !!this.user && !this.isAdmin() && !this.isVendor();
  }

  showHomeLink(): boolean {
    return !this.isAdmin() && !this.isVendor();
  }

  logoRoute(): string {
    if (this.isVendor()) {
      return '/vendor/dashboard';
    }

    if (this.isAdmin()) {
      return '/admin/dashboard';
    }

    return '/';
  }

  onLogout() {
    this.closeAllMenus();
    this.authService.logout().subscribe({
      next: () => {
        this.user = null;
        this.cartService.resetCart();
        this.authService.clearCurrentUser();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cartService.resetCart();
        this.authService.clearCurrentUser();
        console.error('Logout failed', err);
      }
    });
  }

  onMobileLogout(): void {
    this.closeMobileMenu();
    this.onLogout();
  }

  handleCustomerItem(item: HeaderDropdownItem): void {
    this.closeDropdown();
    if (item.action === 'logout') {
      this.onLogout();
    }
  }

  handleVendorItem(item: HeaderDropdownItem): void {
    this.closeVendorDropdown();
    if (item.action === 'logout') {
      this.onLogout();
    }
  }

  handleAdminItem(item: HeaderDropdownItem): void {
    this.closeAdminDropdown();
    if (item.action === 'logout') {
      this.onLogout();
    }
  }
}
