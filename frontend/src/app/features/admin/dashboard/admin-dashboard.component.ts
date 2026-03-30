import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryRecord } from '../../../core/models/admin.models';
import { OrderService } from '../../../core/services/order.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, StatCardComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface p-6 sm:p-8">
        <app-page-header
          eyebrow="Admin Dashboard"
          title="Marketplace overview"
          eyebrowClass="text-indigo-500"
          titleClass="text-4xl"
        >
          <button type="button" (click)="loadSummary()" [disabled]="isLoading" class="btn-secondary !py-3">
            {{ isLoading ? 'Refreshing...' : 'Refresh Overview' }}
          </button>
        </app-page-header>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <app-stat-card label="Users" [value]="userCount" tone="indigo" />
        <app-stat-card label="Categories" [value]="categoryCount" tone="sky" />
        <app-stat-card label="Products" [value]="productCount" tone="emerald" />
        <app-stat-card label="Orders" [value]="orderCount" tone="amber" />
      </div>

      <div class="grid gap-5 xl:grid-cols-4">
        <a routerLink="/admin/users" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">People</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Manage users</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Review customer accounts, remove spam users, and keep the store directory tidy.
          </p>
          <p class="mt-5 text-sm font-black text-indigo-600">Go to users</p>
        </a>

        <a routerLink="/admin/categories" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-500">Catalog</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Manage categories</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Add, edit, and remove category hierarchies for the catalog.
          </p>
          <p class="mt-5 text-sm font-black text-emerald-600">Go to categories</p>
        </a>

        <a routerLink="/admin/products" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-sky-500">Inventory</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Manage products</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Update listings, stock, prices, and visibility from the product manager.
          </p>
          <p class="mt-5 text-sm font-black text-sky-600">Go to products</p>
        </a>

        <a routerLink="/admin/orders" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(245,158,11,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500">Orders</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Review store orders</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Track customer orders, payment status, and fulfillment from one dedicated page.
          </p>
          <p class="mt-5 text-sm font-black text-amber-600">Go to orders</p>
        </a>
      </div>
    </section>
  `
})
export class AdminDashboardComponent implements OnInit {
  userCount = 0;
  categoryCount = 0;
  productCount = 0;
  orderCount = 0;
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;

    forkJoin({
      users: this.adminService.getAllUsers(1, 1),
      categories: this.adminService.getCategoryTree(),
      products: this.adminService.getAllProducts(),
      orders: this.orderService.getAdminOrders()
    }).subscribe({
      next: ({ users, categories, products, orders }) => {
        this.isLoading = false;
        this.userCount = users?.data?.pagination?.totalUsers || 0;
        this.categoryCount = this.totalCategoryCount(categories?.data || []);
        this.productCount = products?.data?.length || 0;
        this.orderCount = orders.orders.length || 0;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private totalCategoryCount(categories: CategoryRecord[]): number {
    return categories.reduce((count, category) => count + 1 + this.totalCategoryCount(category.children || []), 0);
  }
}
