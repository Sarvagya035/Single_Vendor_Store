import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryRecord } from '../../../core/models/admin.models';
import { SidebarNavItemComponent } from '../../../shared/ui/sidebar-nav-item.component';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarNavItemComponent],
  template: `
    <div
      class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_28%,#f8fafc_100%)] pt-6 pb-12"
    >
      <main class="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div class="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside class="lg:sticky lg:top-24 lg:self-start">
            <div class="app-surface flex lg:min-h-[calc(100vh-7rem)] flex-col p-4">
              <nav class="mt-6 space-y-2">
                <app-sidebar-nav-item
                  link="/admin/dashboard"
                  label="Dashboard"
                  [count]="4"
                  [exact]="true"
                  [active]="isDashboardRoute()"
                />

                <app-sidebar-nav-item
                  link="/admin/applications"
                  label="New Applications"
                  [count]="pendingCount"
                  [active]="isApplicationsRoute()"
                />

                <app-sidebar-nav-item
                  link="/admin/users"
                  label="Users"
                  [count]="userCount"
                  [active]="isUsersRoute()"
                  activeClasses="border-slate-200 bg-slate-50 text-slate-700 shadow-sm"
                  activeCountClasses="bg-slate-700 text-white"
                />

                <app-sidebar-nav-item
                  link="/admin/vendors"
                  label="Vendors"
                  [count]="vendorCount"
                  [active]="isVendorsRoute()"
                  activeClasses="border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                  activeCountClasses="bg-emerald-600 text-white"
                />

                <app-sidebar-nav-item
                  link="/admin/categories"
                  label="Categories"
                  [count]="categoryCount"
                  [active]="isCategoriesRoute()"
                  activeClasses="border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                  activeCountClasses="bg-sky-600 text-white"
                />

                <app-sidebar-nav-item
                  link="/admin/products"
                  label="Products"
                  [count]="productCount"
                  [active]="isProductsRoute()"
                  activeClasses="border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                  activeCountClasses="bg-violet-600 text-white"
                />

                <app-sidebar-nav-item
                  link="/admin/orders"
                  label="Orders"
                  [count]="orderCount"
                  [active]="isOrdersRoute()"
                  activeClasses="border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                  activeCountClasses="bg-amber-600 text-white"
                />
              </nav>

              <div class="mt-5 lg:mt-auto">
                <button
                  type="button"
                  (click)="syncSummary()"
                  [disabled]="isSyncing"
                  class="btn-secondary !w-full !py-3"
                >
                  {{ isSyncing ? 'Syncing Admin Data...' : 'Refresh Admin Data' }}
                </button>
              </div>
            </div>
          </aside>

          <section class="min-w-0 app-surface p-4 sm:p-6 lg:p-8">
            <router-outlet />
          </section>
        </div>
      </main>
    </div>
  `,
})
export class AdminShellComponent implements OnInit {
  pendingCount = 0;
  userCount = 0;
  vendorCount = 0;
  categoryCount = 0;
  productCount = 0;
  orderCount = 0;
  isSyncing = false;

  constructor(
    private adminService: AdminService,
    private orderService: OrderService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit(): void {
    this.appRefreshService.refresh$.subscribe((scope) => {
      if (scope === 'global' || scope === 'admin') {
        this.syncSummary();
      }
    });

    this.syncSummary();
  }

  syncSummary(): void {
    this.isSyncing = true;

    forkJoin({
      pending: this.adminService.getPendingVendors(),
      users: this.adminService.getAllUsers(1, 1),
      active: this.adminService.getActiveVendors(),
      rejected: this.adminService.getRejectedVendors(),
      categories: this.adminService.getCategoryTree(),
      products: this.adminService.getAllProducts(),
      orders: this.orderService.getAdminOrders(),
    }).subscribe({
      next: ({ pending, users, active, rejected, categories, products, orders }) => {
        this.isSyncing = false;
        this.pendingCount = pending?.data?.length || 0;
        this.userCount = users?.data?.pagination?.totalUsers || 0;
        this.vendorCount = (active?.data?.length || 0) + (rejected?.data?.length || 0);
        this.categoryCount = this.totalCategoryCount(categories?.data || []);
        this.productCount = products?.data?.length || 0;
        this.orderCount = orders.orders.length || 0;
      },
      error: (err) => {
        this.isSyncing = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  isApplicationsRoute(): boolean {
    return this.router.url.includes('/admin/applications');
  }

  isDashboardRoute(): boolean {
    return this.router.url === '/admin/dashboard';
  }

  isVendorsRoute(): boolean {
    return this.router.url.includes('/admin/vendors');
  }

  isUsersRoute(): boolean {
    return this.router.url.includes('/admin/users');
  }

  isCategoriesRoute(): boolean {
    return this.router.url.includes('/admin/categories');
  }

  isProductsRoute(): boolean {
    return this.router.url.includes('/admin/products');
  }

  isOrdersRoute(): boolean {
    return this.router.url.includes('/admin/orders');
  }

  private totalCategoryCount(categories: CategoryRecord[]): number {
    return categories.reduce(
      (count, category) => count + 1 + this.totalCategoryCount(category.children || []),
      0,
    );
  }
}
