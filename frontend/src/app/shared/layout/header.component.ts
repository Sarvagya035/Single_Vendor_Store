import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AppRefreshService } from '../../core/services/app-refresh.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { VendorService } from '../../core/services/vendor.service';
import { HeaderAccountDropdownComponent, HeaderDropdownItem } from './header-account-dropdown.component';
import { HeaderMobileMenuComponent } from './header-mobile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderAccountDropdownComponent, HeaderMobileMenuComponent],
  template: `
    <div class="sticky top-0 z-50">
      <div *ngIf="showAnnouncementBar()" class="overflow-hidden border-b border-[#7a4a2a] bg-[#5b3520] text-white">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-11 items-center overflow-hidden">
            <div class="flex w-max items-center gap-4 whitespace-nowrap animate-announcement-marquee hover:[animation-play-state:paused]">
              <ng-container *ngFor="let message of announcementTicker; let last = last">
                <span class="text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                  {{ message }}
                </span>
                <span *ngIf="!last" class="text-[#d7b48d]">|</span>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <nav class="border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex h-20 items-center justify-between">
          <a [routerLink]="logoRoute()" class="group flex flex-shrink-0 items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
            <img
              src="/assets/divya%20logo.webp"
              alt="Divya logo"
              class="h-17 w-auto object-contain transition-transform group-hover:scale-110"
            />
          </a>

          <div class="hidden items-center space-x-6 md:flex">
            <ng-container *ngIf="showPublicNavLinks()">
              <a *ngIf="!isCustomer()" routerLink="/" class="nav-link" routerLinkActive="text-amber-700 after:w-full">Home</a>
              <a routerLink="/products" class="nav-link" routerLinkActive="text-amber-700 after:w-full">Products</a>
              <a
                routerLink="/products"
                [queryParams]="{ category: 'combos' }"
                class="nav-link rounded-none bg-transparent px-0 font-semibold text-[#6f4e37] shadow-none hover:bg-transparent hover:text-amber-700"
                >
                Combos
              </a>
              <a routerLink="/products" [queryParams]="{ category: 'gifting' }" class="nav-link" routerLinkActive="text-amber-700 after:w-full">Gifting Collection</a>
              <a routerLink="/about-us" class="nav-link" routerLinkActive="text-amber-700 after:w-full">About Us</a>
              <a routerLink="/contact" class="nav-link" routerLinkActive="text-amber-700 after:w-full">Contact Us</a>
            </ng-container>

            <ng-container *ngIf="user && !isCustomer()">
              <a
                *ngIf="isVendor() || isAdmin()"
                routerLink="/vendor/notifications"
                class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                aria-label="Open vendor notifications"
                title="Notifications"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.157V11a6 6 0 10-12 0v3.157c0 .538-.214 1.055-.595 1.438L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                  />
                </svg>
                <span
                  *ngIf="vendorNotificationCount > 0"
                  class="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
                >
                  {{ vendorNotificationCount }}
                </span>
              </a>

              <app-header-account-dropdown
                theme="vendor"
                subtitle="Store account"
                [open]="isVendorDropdownOpen"
                [avatarUrl]="avatarUrl()"
                [initials]="userInitials()"
                [displayName]="displayName()"
                [email]="user?.email || ''"
                [items]="vendorMenuItems"
                (toggle)="toggleVendorDropdown($event)"
                (itemSelected)="handleVendorItem($event)"
              />
            </ng-container>

            <ng-container *ngIf="isCustomer()">
              <a
                routerLink="/cart"
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              >
                Cart
                <span class="rounded-full px-2 py-0.5 text-xs text-white" style="background: linear-gradient(135deg, #6f4e37, #8b5e3c);">{{ cartCount }}</span>
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
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Cart
              <span class="rounded-full px-2 py-0.5 text-xs text-white" style="background: linear-gradient(135deg, #6f4e37, #8b5e3c);">{{ cartCount }}</span>
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

            <a
              *ngIf="user && (isVendor() || isAdmin())"
              routerLink="/vendor/notifications"
              class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              aria-label="Open vendor notifications"
              title="Notifications"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.157V11a6 6 0 10-12 0v3.157c0 .538-.214 1.055-.595 1.438L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                />
              </svg>
              <span
                *ngIf="vendorNotificationCount > 0"
                class="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
              >
                {{ vendorNotificationCount }}
              </span>
            </a>

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
      </nav>

      <app-header-mobile-menu
        [open]="isMenuOpen"
        [loggedIn]="!!user"
        [isAdmin]="isAdmin()"
        [isVendor]="isVendor() || isAdmin()"
        [showPublicNavLinks]="showPublicNavLinks()"
        (close)="closeMobileMenu()"
        (logout)="onMobileLogout()"
      />
      <div *ngIf="isNavigating" class="pointer-events-none border-b border-[#e7dac9] bg-white/75 px-4 py-3 backdrop-blur">
        <div class="mx-auto max-w-7xl">
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div class="route-progress h-full w-1/3 rounded-full" style="background: linear-gradient(90deg, #6f4e37 0%, #d4a017 100%);"></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HeaderComponent implements OnInit {
  user: any = null;
  @Input() isNavigating = false;
  isMenuOpen = false;
  cartCount = 0;
  vendorNotificationCount = 0;
  isDropdownOpen = false;
  isVendorDropdownOpen = false;

  readonly customerMenuItems: HeaderDropdownItem[] = [
    { label: 'Profile', route: '/profile' },
    { label: 'My Orders', route: '/orders' },
    { label: 'My Wishlist', route: '/wishlist' },
    { label: 'My Addresses', route: '/addresses' },
    { label: 'Logout', action: 'logout', tone: 'danger' }
  ];

  readonly vendorMenuItems: HeaderDropdownItem[] = [
    { label: 'Profile', route: '/profile' },
    { label: 'Orders', route: '/vendor/orders' },
    { label: 'Store profile', route: '/vendor/profile', tone: 'accent' },
    { label: 'Logout', action: 'logout', tone: 'danger' }
  ];

  readonly announcementMessages = [
    'Free delivery on orders above ₹999',
    'Get 10% off on orders above ₹1999 with code WELC10',
    'Gift boxes excluded from select offers',
    'Freshly packed dry fruits delivered with care'
  ];

  readonly announcementTicker = [...this.announcementMessages, ...this.announcementMessages];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private vendorService: VendorService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  private readonly apiOrigin = (() => {
    try {
      return new URL(environment.apiUrl).origin;
    } catch {
      return '';
    }
  })();

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;

      if (this.isCustomer()) {
        this.cartService.getCart().subscribe({
          error: () => this.cartService.resetCart()
        });
      } else if (this.isVendor() || this.isAdmin()) {
        this.loadVendorNotificationCount();
      } else {
        this.cartService.resetCart();
        this.vendorNotificationCount = 0;
        this.closeAllMenus();
      }
    });

    this.cartService.cart$.subscribe((cart) => {
      this.cartCount = (cart.cartItems || []).reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );
    });

    this.authService.ensureCurrentUser().subscribe({
      error: () => this.authService.clearCurrentUser()
    });

    this.appRefreshService.refresh$.subscribe((scope) => {
      if (scope === 'global' || scope === 'auth') {
        this.authService.refreshCurrentUser().subscribe({
          error: () => this.authService.clearCurrentUser()
        });
      }

      if (scope === 'global' || scope === 'vendor') {
        this.loadVendorNotificationCount();
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
    this.closeVendorDropdown();
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMenuOpen = false;
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.closeVendorDropdown();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  toggleVendorDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isMenuOpen = false;
    this.closeDropdown();
    this.isVendorDropdownOpen = !this.isVendorDropdownOpen;
  }

  closeVendorDropdown(): void {
    this.isVendorDropdownOpen = false;
  }

  closeAllMenus(): void {
    this.isMenuOpen = false;
    this.closeDropdown();
    this.closeVendorDropdown();
  }

  hasAvatar(): boolean {
    return !!this.normalizeAvatarUrl(this.user?.avatar);
  }

  avatarUrl(): string {
    return this.normalizeAvatarUrl(this.user?.avatar);
  }

  displayName(): string {
    return String(this.user?.username || this.user?.fullname || this.user?.email || 'Vendor').trim();
  }

  customerDisplayName(): string {
    return String(this.user?.username || this.user?.fullname || this.user?.email || 'Customer').trim();
  }

  private normalizeAvatarUrl(value: unknown): string {
    if (typeof value !== 'string') {
      return '';
    }

    const avatar = value.trim();
    if (!avatar) {
      return '';
    }

    if (/^(https?:)?\/\//i.test(avatar) || avatar.startsWith('data:')) {
      return avatar;
    }

    if (!this.apiOrigin) {
      return avatar;
    }

    return `${this.apiOrigin}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
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

  showPublicNavLinks(): boolean {
    return !this.isAdmin() && !this.isVendor();
  }

  showAnnouncementBar(): boolean {
    return this.showPublicNavLinks();
  }

  logoRoute(): string {
    if (!this.user) {
      return '/';
    }

    return this.isVendor() || this.isAdmin() ? '/vendor/dashboard' : '/';
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

  private loadVendorNotificationCount(): void {
    if (!this.user || (!this.isVendor() && !this.isAdmin())) {
      this.vendorNotificationCount = 0;
      return;
    }

    this.vendorService.getVendorNotifications().subscribe({
      next: (response) => {
        this.vendorNotificationCount = Number(response?.summary?.unreadNotifications || 0);
      },
      error: () => {
        this.vendorNotificationCount = 0;
      }
    });
  }

}
