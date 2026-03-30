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
        <app-stat-card label="Pending Applications" [value]="pendingCount" tone="indigo" />
        <app-stat-card label="Approved Vendors" [value]="activeCount" tone="emerald" />
        <app-stat-card label="Rejected Vendors" [value]="rejectedCount" tone="rose" />
        <app-stat-card label="Categories" [value]="categoryCount" tone="sky" />
        <app-stat-card label="Orders" [value]="orderCount" tone="amber" />
      </div>

      <div class="grid gap-5 xl:grid-cols-4">
        <a routerLink="/admin/applications" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500">Queue</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Review new applications</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Open the dedicated applications page to inspect submitted store and bank details before approval.
          </p>
          <p class="mt-5 text-sm font-black text-indigo-600">Go to applications</p>
        </a>

        <a routerLink="/admin/vendors" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-500">Records</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Manage vendor accounts</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Browse approved and rejected vendors on a separate page and open each record for full details.
          </p>
          <p class="mt-5 text-sm font-black text-emerald-600">Go to vendors</p>
        </a>

        <a routerLink="/admin/categories" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-sky-500">Catalog</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Manage categories</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Add, edit, and remove categories from a focused page without mixing vendor operations into the same screen.
          </p>
          <p class="mt-5 text-sm font-black text-sky-600">Go to categories</p>
        </a>

        <a routerLink="/admin/orders" class="app-card group block p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(245,158,11,0.12)]">
          <p class="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500">Orders</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Review marketplace orders</h3>
          <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
            Track customer orders, payment status, and marketplace revenue from one dedicated page.
          </p>
          <p class="mt-5 text-sm font-black text-amber-600">Go to orders</p>
        </a>
      </div>
    </section>
  `
})
export class AdminDashboardComponent implements OnInit {
  pendingCount = 0;
  activeCount = 0;
  rejectedCount = 0;
  categoryCount = 0;
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
      pending: this.adminService.getPendingVendors(),
      active: this.adminService.getActiveVendors(),
      rejected: this.adminService.getRejectedVendors(),
      categories: this.adminService.getCategoryTree(),
      orders: this.orderService.getAdminOrders()
    }).subscribe({
      next: ({ pending, active, rejected, categories, orders }) => {
        this.isLoading = false;
        this.pendingCount = pending?.data?.length || 0;
        this.activeCount = active?.data?.length || 0;
        this.rejectedCount = rejected?.data?.length || 0;
        this.categoryCount = this.totalCategoryCount(categories?.data || []);
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
