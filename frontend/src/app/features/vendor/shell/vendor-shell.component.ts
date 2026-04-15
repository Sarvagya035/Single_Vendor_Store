import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterModule
} from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { CustomerUser } from '../../../core/models/customer.models';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorSidebarComponent } from '../sidebar/vendor-sidebar.component';
import { VendorDashboardView } from '../../../core/models/vendor.models';
import { OrderService } from '../../../core/services/order.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-vendor-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidebarComponent],
  template: `
    <div class="vendor-theme min-h-screen bg-[linear-gradient(180deg,#fff9f2_0%,#f5e6d3_38%,#fff9f2_100%)] pt-4 pb-12">
      <main class="w-full px-4 sm:px-6 lg:px-8">
        <div class="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <app-vendor-sidebar
            [activeView]="activeView"
            [productCount]="productCount"
            [categoryCount]="categoryCount"
            [customerCount]="customerCount"
            [orderCount]="orderCount"
            [shipmentCount]="shipmentCount"
            [showShipments]="isAdminUser"
          />

          <section class="space-y-6">
            @if (isNavigating()) {
              <div class="rounded-[1.5rem] border border-amber-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div class="route-progress h-full w-1/3 rounded-full" style="background: linear-gradient(90deg, #6f4e37 0%, #d4a017 100%);"></div>
                </div>
              </div>
            }

            <div
              class="transition-all duration-300 ease-out"
              [class.opacity-60]="isNavigating()"
              [class.translate-y-1]="isNavigating()"
            >
              <router-outlet />
            </div>
          </section>
        </div>
      </main>
    </div>
  `
})
export class VendorShellComponent implements OnInit {
  productCount = 0;
  categoryCount = 0;
  customerCount = 0;
  orderCount = 0;
  shipmentCount = 0;
  currentRoles: string[] = [];
  readonly isNavigating = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private vendorService: VendorService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  get activeView(): VendorDashboardView {
    if (this.router.url.includes('/vendor/dashboard')) {
      return 'dashboard';
    }

    if (this.router.url.includes('/vendor/profile')) {
      return 'profile';
    }

    if (this.router.url.includes('/vendor/orders')) {
      return 'orders';
    }

    if (this.router.url.includes('/vendor/shipments')) {
      return 'shipments';
    }

    if (this.router.url.includes('/vendor/categories')) {
      return 'categories';
    }

    if (this.router.url.includes('/vendor/customers')) {
      return 'customers';
    }

    return 'products';
  }

  get isAdminUser(): boolean {
    return this.currentRoles.includes('admin');
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentRoles = this.normalizeRoles(user?.role);
    });

    if (!this.currentRoles.length) {
      this.authService.getCurrentUser().subscribe({
        next: () => {
          this.loadSummary();
        },
        error: () => {
          this.currentRoles = [];
          this.loadSummary();
        }
      });
    } else {
      this.loadSummary();
    }

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
          return;
        }

        this.isNavigating.set(false);
      });

    this.appRefreshService.refresh$.subscribe((scope) => {
      if (scope === 'global' || scope === 'vendor') {
        this.loadSummary();
      }
    });

  }

  loadSummary(): void {
    const shipmentRequest = this.isAdminUser ? this.vendorService.getAdminShipments() : of(null);

    forkJoin({
      products: this.vendorService.getMyProducts(),
      orders: this.orderService.getVendorOrders(),
      categories: this.vendorService.getCategoryTree(),
      users: this.vendorService.getAllUsers(1, 1000),
      shipments: shipmentRequest
    }).subscribe({
      next: ({ products, orders, categories, users, shipments }) => {
        this.productCount = products?.data?.docs?.length || 0;
        this.orderCount = orders.length || 0;
        this.categoryCount = this.countCategories(categories?.data || []);
        this.customerCount = this.countCustomers(users?.users || []);
        this.shipmentCount = shipments?.summary?.totalShipments || 0;
      },
      error: () => {
        this.productCount = 0;
        this.categoryCount = 0;
        this.customerCount = 0;
        this.orderCount = 0;
        this.shipmentCount = 0;
      }
    });
  }

  private normalizeRoles(role: unknown): string[] {
    if (Array.isArray(role)) {
      return role.map((value) => String(value));
    }

    if (typeof role === 'string' && role.trim()) {
      return [role];
    }

    return [];
  }

  private countCategories(categories: Array<{ children?: Array<any> }>): number {
    return categories.reduce((total, category) => {
      return total + 1 + this.countCategories(category.children || []);
    }, 0);
  }

  private countCustomers(users: CustomerUser[]): number {
    return users.filter((user) => {
      const roles = Array.isArray(user.role)
        ? user.role.map((role) => String(role).toLowerCase())
        : user.role
          ? [String(user.role).toLowerCase()]
          : [];

      if (roles.length === 0) {
        return false;
      }

      const hasCustomer = roles.includes('customer');
      const hasRestrictedRole = roles.some((role) => role === 'vendor' || role === 'admin');

      return hasCustomer && !hasRestrictedRole;
    }).length;
  }
}

