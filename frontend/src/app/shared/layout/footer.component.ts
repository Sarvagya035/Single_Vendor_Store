import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface FooterLink {
  label: string;
  route: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer id="contact" class="mt-12 border-t border-[#5c3e2f] bg-[#5b321c] text-white">
      <div class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div class="max-w-md space-y-4">
            <div class="flex items-center gap-3">
              <img
                src="/assets/divya%20logo.webp"
                alt="Divya logo"
                class="h-17 w-auto object-contain"
              />
            </div>
            <p class="text-sm font-medium leading-relaxed text-white/80">
              A clean shopping and vendor experience for browsing dry fruits, managing inventory, and keeping orders moving.
            </p>
        </div>

        <div>
            <p class="footer-title">{{ footerSectionTitle }}</p>
            <nav class="footer-link-list" aria-label="Footer navigation">
              <a
                *ngFor="let link of footerLinks; trackBy: trackByFooterLink"
                [routerLink]="link.route"
                routerLinkActive="text-white"
                [routerLinkActiveOptions]="{ exact: link.route === '/' }"
                class="footer-link min-w-0 truncate"
              >
                {{ link.label }}
              </a>
            </nav>

        </div>

        <div>
          <p class="footer-title">Support</p>
          <nav class="footer-link-list" aria-label="Support information">
            <span class="footer-link cursor-default">Fresh packing</span>
            <span class="footer-link cursor-default">Secure checkout</span>
            <span class="footer-link cursor-default">Fast delivery</span>
            <span class="footer-link cursor-default">Premium quality</span>
          </nav>

          <div class="mt-6 text-sm leading-6 text-[#fff4e6]">
            <p class="font-bold text-white">Need help?</p>
            <p class="text-[#fff4e6]">support@divyadryfruits.com</p>
            <p class="text-[#fff4e6]">Mon-Sat, 10 AM - 6 PM</p>
          </div>
        </div>
      </div>

      <div class="border-t border-white/15">
        <div class="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-[#fff4e6] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p class="text-[#fff4e6]">Built for a smoother dry fruit shopping and store management flow.</p>
          <p class="font-bold text-white">Copyright {{ currentYear }} E-Commerce</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  footerSectionTitle = 'Explore';
  footerLinks: FooterLink[] = [];
  private user: any = null;
  private userSub?: Subscription;

  private readonly guestFooterLinks: FooterLink[] = [
    { label: 'Home', route: '/' },
    { label: 'About Us', route: '/about-us' },
    { label: 'Browse Products', route: '/products' },
    { label: 'Contact Us', route: '/contact' },
    { label: 'Login', route: '/login' },
    { label: 'Register', route: '/register' }
  ];

  private readonly customerFooterLinks: FooterLink[] = [
    { label: 'Home', route: '/' },
    { label: 'About Us', route: '/about-us' },
    { label: 'Browse Products', route: '/products' },
    { label: 'Contact Us', route: '/contact' },
    { label: 'My Wishlist', route: '/wishlist' },
    { label: 'Profile', route: '/profile' },
    { label: 'Cart', route: '/cart' }
  ];

  private readonly vendorFooterLinks: FooterLink[] = [
    { label: 'Store Profile', route: '/vendor/profile' },
    { label: 'Dashboard', route: '/vendor/dashboard' },
    { label: 'Best Sellers', route: '/vendor/best-selling-products' },
    { label: 'Products', route: '/vendor/products' },
    { label: 'Categories', route: '/vendor/categories' },
    { label: 'Customers', route: '/vendor/customers' },
    { label: 'Orders', route: '/vendor/orders' },
    { label: 'Shipments', route: '/vendor/shipments' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      this.setFooterLinks();
    });

    this.authService.ensureCurrentUser().subscribe({
      error: () => this.authService.clearCurrentUser()
    });

    this.setFooterLinks();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  trackByFooterLink(_: number, link: FooterLink): string {
    return link.route;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isVendor(): boolean {
    return this.hasRole('vendor');
  }

  isCustomer(): boolean {
    return !!this.user && !this.isAdmin() && !this.isVendor();
  }

  private setFooterLinks(): void {
    if (!this.user) {
      this.footerSectionTitle = 'Explore';
      this.footerLinks = this.guestFooterLinks;
      return;
    }

    if (this.isAdmin() || this.isVendor()) {
      this.footerSectionTitle = 'Store Management';
      this.footerLinks = this.vendorFooterLinks;
      return;
    }

    this.footerSectionTitle = 'Explore';
    this.footerLinks = this.customerFooterLinks;
  }

  private hasRole(roleName: string): boolean {
    if (!this.user?.role) {
      return false;
    }

    const roles = Array.isArray(this.user.role) ? this.user.role : [this.user.role];
    return roles.some((role: string) => String(role).toLowerCase() === roleName);
  }
}
