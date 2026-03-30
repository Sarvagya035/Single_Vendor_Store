import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorSidebarComponent } from '../sidebar/vendor-sidebar.component';
import { VendorDashboardView } from '../../../core/models/vendor.models';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-vendor-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, VendorSidebarComponent],
  template: `
    <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_38%,#f8fafc_100%)] pt-4 pb-12">
      <main class="w-full px-4 sm:px-6 lg:px-8">
        <div class="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <app-vendor-sidebar
            [activeView]="activeView"
            [productCount]="productCount"
            [categoryCount]="categoryCount"
            [orderCount]="orderCount"
          />

          <section class="space-y-6">
            <router-outlet />
          </section>
        </div>
      </main>
    </div>
  `
})
export class VendorShellComponent implements OnInit {
  productCount = 0;
  categoryCount = 0;
  orderCount = 0;

  constructor(
    private vendorService: VendorService,
    private orderService: OrderService,
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

    if (this.router.url.includes('/vendor/categories')) {
      return 'categories';
    }

    return 'products';
  }

  ngOnInit() {
    this.appRefreshService.refresh$.subscribe((scope) => {
      if (scope === 'global' || scope === 'vendor') {
        this.loadSummary();
      }
    });

    this.loadSummary();
  }

  loadSummary(): void {
    forkJoin({
      products: this.vendorService.getMyProducts(),
      orders: this.orderService.getVendorOrders(),
      categories: this.vendorService.getCategoryTree()
    }).subscribe({
      next: ({ products, orders, categories }) => {
        this.productCount = products?.data?.docs?.length || 0;
        this.orderCount = orders.length || 0;
        this.categoryCount = this.countCategories(categories?.data || []);
      },
      error: () => {
        this.productCount = 0;
        this.categoryCount = 0;
        this.orderCount = 0;
      }
    });
  }

  private countCategories(categories: Array<{ children?: Array<any> }>): number {
    return categories.reduce((total, category) => {
      return total + 1 + this.countCategories(category.children || []);
    }, 0);
  }
}
