import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorNotificationRecord, VendorNotificationsPayload } from '../../../core/models/vendor.models';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

type NotificationFilter = 'all' | 'unread' | 'active';

@Component({
  selector: 'app-vendor-notifications-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
        <app-page-header
          eyebrow="Notifications"
          title="Notification center"
          description="Track low-stock alerts and keep product availability under control from one place."
          titleClass="!text-[1.8rem] md:!text-[2.2rem]"
        >
          <button type="button" (click)="reload()" [disabled]="isLoading" class="btn-secondary w-full !py-3 sm:w-auto">
            {{ isLoading ? 'Refreshing...' : 'Refresh Notifications' }}
          </button>
        </app-page-header>
        </div>

        <div class="vendor-grid-4 vendor-section-body">
        <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
          <p class="vendor-stat-label">Unread</p>
          <p class="vendor-stat-value">{{ summary.unreadNotifications }}</p>
        </article>
        <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
          <p class="vendor-stat-label">Low stock</p>
          <p class="vendor-stat-value">{{ summary.activeLowStockAlerts }}</p>
        </article>
        <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
          <p class="vendor-stat-label">Resolved</p>
          <p class="vendor-stat-value">{{ summary.resolvedLowStockAlerts }}</p>
        </article>
        <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
          <p class="vendor-stat-label">Total</p>
          <p class="vendor-stat-value">{{ summary.totalNotifications }}</p>
        </article>
        </div>

        <div class="border-t border-slate-200 vendor-section-body lg:py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full px-4 py-2 text-sm font-black transition"
                [ngClass]="filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'"
                (click)="setFilter('all')"
              >
                All
              </button>
              <button
                type="button"
                class="rounded-full px-4 py-2 text-sm font-black transition"
                [ngClass]="filter === 'unread' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'"
                (click)="setFilter('unread')"
              >
                Unread
              </button>
              <button
                type="button"
                class="rounded-full px-4 py-2 text-sm font-black transition"
                [ngClass]="filter === 'active' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'"
                (click)="setFilter('active')"
              >
                Active low stock
              </button>
            </div>

            <button
              type="button"
              class="btn-primary w-full !px-5 !py-3 sm:w-auto"
              [disabled]="!summary.unreadNotifications || isMarkingAllRead"
              (click)="markAllRead()"
            >
              {{ isMarkingAllRead ? 'Updating...' : 'Mark all as read' }}
            </button>
          </div>
        </div>

        <div *ngIf="successMessage" class="border-t border-slate-200 vendor-section-body py-4">
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {{ successMessage }}
          </div>
        </div>

        <div *ngIf="isLoading" class="border-t border-slate-200 vendor-section-body py-10 text-sm font-semibold text-slate-500">
          Loading notifications...
        </div>

        <div *ngIf="!isLoading && filteredNotifications.length === 0" class="border-t border-slate-200 vendor-section-body py-12 text-center">
          <h2 class="vendor-empty-title">No active notifications right now</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">
            Resolved low-stock alerts disappear automatically after restock.
          </p>
        </div>

        <div *ngIf="filteredNotifications.length" class="grid gap-4 border-t border-slate-200 vendor-section-body">
          <article
            *ngFor="let notification of filteredNotifications; trackBy: trackByNotification"
            class="vendor-mobile-card transition hover:bg-[#fffaf4]"
            [class.opacity-75]="notification.isRead"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <p class="text-lg font-black text-slate-900">{{ notification.title }}</p>
                  <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="priorityClass(notification.priority)">
                    {{ notification.priority }} priority
                  </span>
                  <span *ngIf="notification.isRead" class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                    Read
                  </span>
                </div>

                <p class="mt-3 text-sm font-medium text-slate-600">{{ notification.message }}</p>

                <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Product</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ notification.productName }}</p>
                  </div>
                  <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Variant</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ notification.variantLabel }}</p>
                  </div>
                  <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Stock</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ notification.currentStock }} / {{ notification.stockThreshold }}</p>
                  </div>
                </div>

                <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Updated {{ formatDate(notification.updatedAt || notification.createdAt) }}
                </p>
              </div>

              <div class="flex flex-col gap-3 lg:min-w-[220px]">
                <a
                  [routerLink]="resolveActionLink(notification)"
                  class="btn-primary w-full !px-5 !py-3 text-center sm:w-auto"
                >
                  Restock now
                </a>
                <button
                  type="button"
                  class="btn-secondary w-full !px-5 !py-3 sm:w-auto"
                  [disabled]="notification.isRead || markingId === notification._id"
                  (click)="markAsRead(notification)"
                >
                  {{ markingId === notification._id ? 'Saving...' : notification.isRead ? 'Already read' : 'Mark as read' }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `
})
export class VendorNotificationsPageComponent implements OnInit {
  notifications: VendorNotificationRecord[] = [];
  summary: VendorNotificationsPayload['summary'] = {
    totalNotifications: 0,
    unreadNotifications: 0,
    activeLowStockAlerts: 0,
    resolvedLowStockAlerts: 0
  };
  filter: NotificationFilter = 'all';
  isLoading = false;
  isMarkingAllRead = false;
  markingId = '';
  successMessage = '';

  constructor(
    private vendorService: VendorService,
    private errorService: ErrorService,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  get filteredNotifications(): VendorNotificationRecord[] {
    return this.notifications.filter((notification) => {
      if (this.filter === 'unread') {
        return !notification.isRead;
      }

      if (this.filter === 'active') {
        return notification.type === 'low_stock' && !notification.isResolved;
      }

      return !notification.isResolved;
    });
  }

  reload(): void {
    this.isLoading = true;

    this.vendorService.getVendorNotifications().subscribe({
      next: (response) => {
        this.notifications = response?.notifications || [];
        this.summary = response?.summary || this.summary;
        this.isLoading = false;
      },
      error: (error) => {
        this.notifications = [];
        this.summary = {
          totalNotifications: 0,
          unreadNotifications: 0,
          activeLowStockAlerts: 0,
          resolvedLowStockAlerts: 0
        };
        this.isLoading = false;
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  setFilter(filter: NotificationFilter): void {
    this.filter = filter;
  }

  markAsRead(notification: VendorNotificationRecord): void {
    if (!notification._id || notification.isRead) {
      return;
    }

    this.markingId = notification._id;
    this.vendorService.markVendorNotificationRead(notification._id)
      .pipe(finalize(() => {
        this.markingId = '';
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Notification marked as read.';
          this.reload();
          this.appRefreshService.notify('vendor');
        },
        error: (error) => {
          this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
        }
      });
  }

  markAllRead(): void {
    this.isMarkingAllRead = true;
    this.successMessage = '';

    this.vendorService.markAllVendorNotificationsRead()
      .pipe(finalize(() => {
        this.isMarkingAllRead = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'All notifications marked as read.';
          this.reload();
          this.appRefreshService.notify('vendor');
        },
        error: (error) => {
          this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
        }
      });
  }

  priorityClass(priority: VendorNotificationRecord['priority']): string {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  resolveActionLink(notification: VendorNotificationRecord): string {
    if (notification.actionLink) {
      return notification.actionLink;
    }

    return `/vendor/products/${notification.productId}/restock`;
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  trackByNotification(index: number, notification: VendorNotificationRecord): string {
    return notification._id || String(index);
  }
}
