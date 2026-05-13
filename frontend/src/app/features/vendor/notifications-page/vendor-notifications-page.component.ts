import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorNotificationRecord, VendorNotificationsPayload } from '../../../core/models/vendor.models';
import { VendorService } from '../../../core/services/vendor.service';
import { SocketService } from '../../../core/services/socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

type NotificationFilter = 'all' | 'unread' | 'active';

@Component({
  selector: 'app-vendor-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    EmptyStateComponent,
  ],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="app-page-header">
          <app-page-header
            eyebrow="Notifications"
            title="Notification center"
            description="Track low-stock alerts and keep product availability under control from one place."
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          >
            <app-button variant="secondary" buttonClass="w-full !px-5 !py-3 sm:w-auto" [disabled]="isLoading" (click)="reload()">
              {{ isLoading ? 'Refreshing...' : 'Refresh Notifications' }}
            </app-button>
          </app-page-header>
        </div>

        <div class="vendor-grid-4 vendor-section-body">
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80 p-3 sm:p-4 lg:p-5">
            <p class="vendor-stat-label">Unread</p>
            <p class="vendor-stat-value">{{ summary.unreadNotifications }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80 p-3 sm:p-4 lg:p-5">
            <p class="vendor-stat-label">Low stock</p>
            <p class="vendor-stat-value">{{ summary.activeLowStockAlerts }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80 p-3 sm:p-4 lg:p-5">
            <p class="vendor-stat-label">Resolved</p>
            <p class="vendor-stat-value">{{ summary.resolvedLowStockAlerts }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80 p-3 sm:p-4 lg:p-5">
            <p class="vendor-stat-label">Total</p>
            <p class="vendor-stat-value">{{ summary.totalNotifications }}</p>
          </article>
        </div>

        <app-card variant="default" cardClass="border-t border-slate-200 !rounded-none !border-x-0 !border-b-0 !bg-transparent !shadow-none vendor-section-body lg:py-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-2">
              <app-button
                variant="secondary"
                [buttonClass]="filter === 'all'
                  ? 'rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] !min-h-0 bg-slate-900 !border-slate-900 !text-white transition'
                  : 'rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] !min-h-0 bg-white !border !border-slate-200 !text-slate-600 transition'"
                (click)="setFilter('all')"
              >
                All
              </app-button>
              <app-button
                variant="secondary"
                [buttonClass]="filter === 'unread'
                  ? 'rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] !min-h-0 bg-slate-900 !border-slate-900 !text-white transition'
                  : 'rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] !min-h-0 bg-white !border !border-slate-200 !text-slate-600 transition'"
                (click)="setFilter('unread')"
              >
                Unread
              </app-button>
              <app-button
                variant="secondary"
                [buttonClass]="filter === 'active'
                  ? 'rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] !min-h-0 bg-slate-900 !border-slate-900 !text-white transition'
                  : 'rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] !min-h-0 bg-white !border !border-slate-200 !text-slate-600 transition'"
                (click)="setFilter('active')"
              >
                Active low stock
              </app-button>
            </div>

            <app-button
              variant="primary"
              buttonClass="w-full !px-5 !py-3 sm:w-auto"
              [disabled]="!summary.unreadNotifications || isMarkingAllRead"
              (click)="markAllRead()"
            >
              {{ isMarkingAllRead ? 'Updating...' : 'Mark all as read' }}
            </app-button>
          </div>
        </app-card>

        <div *ngIf="successMessage" class="border-t border-slate-200 vendor-section-body py-4">
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {{ successMessage }}
          </div>
        </div>

        <div *ngIf="isLoading" class="border-t border-slate-200 vendor-section-body py-10 text-sm font-semibold text-slate-500">
          Loading notifications...
        </div>

        <app-empty-state
          *ngIf="!isLoading && filteredNotifications.length === 0"
          title="No active notifications right now"
          description="Resolved low-stock alerts disappear automatically after restock."
        />

        <div *ngIf="filteredNotifications.length" class="grid gap-4 border-t border-slate-200 vendor-section-body lg:py-6">
          <article
            *ngFor="let notification of filteredNotifications; trackBy: trackByNotification"
            class="vendor-mobile-card p-3 transition hover:bg-[#fffaf4]"
            [class.opacity-75]="notification.isRead"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-black text-slate-900 sm:text-lg">{{ notification.title }}</p>
                  <app-badge [tone]="notification.priority === 'high' ? 'danger' : notification.priority === 'medium' ? 'warning' : 'neutral'" badgeClass="px-2.5 py-0.5 text-[10px] font-black">
                    {{ notification.priority }} priority
                  </app-badge>
                  <app-badge *ngIf="notification.isRead" tone="neutral" badgeClass="px-2.5 py-0.5 text-[10px] font-black">
                    Read
                  </app-badge>
                </div>

                <p class="mt-2 line-clamp-2 text-sm font-medium text-slate-600">{{ notification.message }}</p>

                <div class="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
                  <ng-container *ngIf="notification.type === 'bulk_inquiry'; else lowStockCards">
                    <div class="vendor-stat-tile-compact bg-white">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Customer</p>
                      <p class="mt-1 line-clamp-2 text-xs font-black text-slate-900 sm:text-sm">{{ notification.businessName || notification.fullName || 'Customer' }}</p>
                    </div>
                    <div class="vendor-stat-tile-compact bg-white">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Inquiry Type</p>
                      <p class="mt-1 text-xs font-black text-slate-900 sm:text-sm">{{ notification.orderType || 'Bulk inquiry' }}</p>
                    </div>
                    <div class="vendor-stat-tile-compact bg-white">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">City</p>
                      <p class="mt-1 text-xs font-black text-slate-900 sm:text-sm">{{ notification.city || 'Not provided' }}</p>
                    </div>
                  </ng-container>

                  <ng-template #lowStockCards>
                    <div class="vendor-stat-tile-compact bg-white">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Product</p>
                      <p class="mt-1 line-clamp-2 text-xs font-black text-slate-900 sm:text-sm">{{ notification.productName }}</p>
                    </div>
                    <div class="vendor-stat-tile-compact bg-white">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Variant</p>
                      <p class="mt-1 line-clamp-2 text-xs font-black text-slate-900 sm:text-sm">{{ notification.variantLabel }}</p>
                    </div>
                    <div class="vendor-stat-tile-compact bg-white">
                      <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Stock</p>
                      <p class="mt-1 text-xs font-black text-slate-900 sm:text-sm">{{ notification.currentStock }} / {{ notification.stockThreshold }}</p>
                    </div>
                  </ng-template>
                </div>

                <p class="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Updated {{ formatDate(notification.updatedAt || notification.createdAt) }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2 lg:min-w-[220px] lg:grid-cols-1">
                <a
                  [routerLink]="resolveActionLink(notification)"
                  class="btn-primary w-full !px-4 !py-2.5 text-center text-xs"
                >
                  {{ notification.type === 'bulk_inquiry' ? 'View inquiry' : 'Restock now' }}
                </a>
                <app-button
                  variant="secondary"
                  buttonClass="w-full !px-4 !py-2.5 text-xs"
                  [disabled]="notification.isRead || markingId === notification._id"
                  (click)="markAsRead(notification)"
                >
                  {{ markingId === notification._id ? 'Saving...' : notification.isRead ? 'Already read' : 'Mark as read' }}
                </app-button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `
})
export class VendorNotificationsPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
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
    private appRefreshService: AppRefreshService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.reload();

    this.socketService.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.name === 'inquiry:new' || event.name === 'stock:low') {
          this.reload();
        }
      });
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

  resolveActionLink(notification: VendorNotificationRecord): string {
    if (notification.actionLink) {
      return notification.actionLink;
    }

    if (notification.type === 'bulk_inquiry') {
      return '/vendor/bulk-inquiries';
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
