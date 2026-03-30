import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AdminService } from '../../../core/services/admin.service';
import { AdminUserRecord, AdminUserPagination, ToastType } from '../../../core/models/admin.models';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';
import { ToastBannerComponent } from '../../../shared/ui/toast-banner.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatCardComponent, ToastBannerComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface p-6 sm:p-8">
        <app-page-header
          title="All marketplace users"
          eyebrowClass="text-slate-500"
          titleClass="text-4xl"
        >
          <button type="button" (click)="loadUsers()" [disabled]="isLoading" class="btn-secondary !py-3">
            {{ isLoading ? 'Refreshing...' : 'Refresh Users' }}
          </button>
        </app-page-header>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <app-stat-card label="Total Users" [value]="pagination.totalUsers" tone="indigo" />
        <app-stat-card label="Current Page" [value]="pagination.currentPage" tone="sky" />
        <app-stat-card label="Vendors on Page" [value]="vendorCount()" tone="emerald" />
        <app-stat-card label="Customers on Page" [value]="customerCount()" tone="amber" />
      </div>

      <div *ngIf="errorMessage" class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {{ errorMessage }}
      </div>

      <div *ngIf="isLoading" class="app-card-soft py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
          <p class="font-medium text-slate-500">Loading users...</p>
        </div>
      </div>

      <div *ngIf="!isLoading && users.length === 0" class="app-card-soft border-dashed px-8 py-16 text-center">
        <h2 class="text-2xl font-black text-slate-900">No users found</h2>
        <p class="mt-3 text-sm font-medium text-slate-500">
          Registered users will appear here once accounts are created.
        </p>
      </div>

      <div *ngIf="users.length" class="grid gap-4">
        <article
          *ngFor="let user of users; trackBy: trackByUserId"
          class="app-card p-6"
        >
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-lg font-black uppercase text-slate-500">
                  <img *ngIf="user.avatar" [src]="user.avatar" [alt]="user.username || user.fullName || 'User'" class="h-full w-full object-cover" />
                  <span *ngIf="!user.avatar">{{ initials(user) }}</span>
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-2xl font-black tracking-tight text-slate-900">
                    {{ user.fullName || user.username || 'Unnamed User' }}
                  </h3>
                  <p class="truncate text-sm font-semibold text-slate-500">{{ user.email || 'No email available' }}</p>
                </div>
                <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="roleBadgeClass(user)">
                  {{ roleLabel(user) }}
                </span>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-3">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Phone</p>
                  <p class="mt-2 break-words text-sm font-black text-slate-900">{{ user.phone || 'N/A' }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Joined</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ formatDate(user.createdAt) }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Roles</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ rolesText(user) }}</p>
                </div>
              </div>
            </div>

            <div class="flex min-w-[180px] flex-col items-start gap-3 xl:items-end">
              <button
                type="button"
                (click)="openDeleteModal(user)"
                [disabled]="user._processing"
                class="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ user._processing ? 'Deleting...' : 'Delete User' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div class="app-card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p class="text-sm font-semibold text-slate-500">
          Page {{ pagination.currentPage }} of {{ pagination.totalPages || 1 }}
        </p>
        <div class="flex items-center gap-3">
          <button type="button" class="btn-secondary !py-3" (click)="changePage(-1)" [disabled]="!pagination.hasPrevPage || isLoading">
            Previous
          </button>
          <button type="button" class="btn-secondary !py-3" (click)="changePage(1)" [disabled]="!pagination.hasNextPage || isLoading">
            Next
          </button>
        </div>
      </div>

      <div *ngIf="deleteModal.open && deleteModal.user" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
        <div class="app-card-soft w-full max-w-md p-6 shadow-2xl">
          <p class="text-[11px] font-black uppercase tracking-[0.28em] text-rose-500">Delete User</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Remove this user account?</h3>
          <p class="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            Deleting <strong>{{ deleteModal.user.fullName || deleteModal.user.username || deleteModal.user.email || 'this user' }}</strong>
            will remove the account from the marketplace.
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" (click)="closeDeleteModal()" class="btn-secondary !px-5 !py-3">
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmDeleteUser()"
              [disabled]="deleteModal.processing"
              class="btn-primary !bg-rose-600 hover:!bg-rose-700 !px-5 !py-3"
            >
              {{ deleteModal.processing ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>

      <app-toast-banner [visible]="toast.visible" [message]="toast.message" [type]="toast.type" />
    </section>
  `
})
export class AdminUsersPageComponent implements OnInit {
  users: AdminUserRecord[] = [];
  pagination: AdminUserPagination = {
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false
  };
  isLoading = false;
  errorMessage = '';
  readonly pageSize = 10;
  deleteModal = {
    open: false,
    user: null as AdminUserRecord | null,
    processing: false
  };

  toast = {
    visible: false,
    message: '',
    type: 'success' as ToastType
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page = this.pagination.currentPage): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getAllUsers(page, this.pageSize).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.users = (res?.data?.users || []).map((user: AdminUserRecord) => ({ ...user, _processing: false }));
        this.pagination = {
          totalUsers: res?.data?.pagination?.totalUsers || 0,
          totalPages: res?.data?.pagination?.totalPages || 0,
          currentPage: res?.data?.pagination?.currentPage || page,
          hasNextPage: !!res?.data?.pagination?.hasNextPage,
          hasPrevPage: !!res?.data?.pagination?.hasPrevPage
        };
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Unable to load users.';
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  changePage(delta: number): void {
    const nextPage = this.pagination.currentPage + delta;
    if (nextPage < 1 || nextPage > this.pagination.totalPages) {
      return;
    }

    this.loadUsers(nextPage);
  }

  openDeleteModal(user: AdminUserRecord): void {
    if (user._processing) {
      return;
    }

    this.deleteModal = {
      open: true,
      user,
      processing: false
    };
  }

  closeDeleteModal(): void {
    this.deleteModal = {
      open: false,
      user: null,
      processing: false
    };
  }

  confirmDeleteUser(): void {
    const user = this.deleteModal.user;
    if (!user || this.deleteModal.processing) {
      return;
    }

    user._processing = true;
    this.deleteModal = { ...this.deleteModal, processing: true };
    this.errorMessage = '';

    this.adminService.deleteUser(user._id).subscribe({
      next: (res) => {
        user._processing = false;
        this.deleteModal = { open: false, user: null, processing: false };
        if (!res?.success) {
          this.errorMessage = res?.message || 'Unable to delete user.';
          return;
        }

        this.showToast(`${user.fullName || user.username || 'User'} deleted successfully.`, 'success');
        this.appRefreshService.notify('admin');
        this.loadUsers(this.pagination.currentPage);
      },
      error: (err) => {
        user._processing = false;
        this.deleteModal = { open: false, user: null, processing: false };
        this.errorMessage = err.error?.message || 'Failed to delete user.';
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  rolesText(user: AdminUserRecord): string {
    if (!user.role) {
      return 'customer';
    }

    return Array.isArray(user.role) ? user.role.join(', ') : user.role;
  }

  roleLabel(user: AdminUserRecord): string {
    const role = this.rolesText(user).toLowerCase();
    if (role.includes('admin')) return 'Admin';
    if (role.includes('vendor')) return 'Vendor';
    return 'Customer';
  }

  roleBadgeClass(user: AdminUserRecord): string {
    const role = this.rolesText(user).toLowerCase();
    if (role.includes('admin')) return 'bg-slate-100 text-slate-700';
    if (role.includes('vendor')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-amber-100 text-amber-700';
  }

  vendorCount(): number {
    return this.users.filter((user) => this.rolesText(user).toLowerCase().includes('vendor')).length;
  }

  customerCount(): number {
    return this.users.filter((user) => {
      const role = this.rolesText(user).toLowerCase();
      return !role.includes('vendor') && !role.includes('admin');
    }).length;
  }

  initials(user: AdminUserRecord): string {
    const source = user.fullName || user.username || user.email || 'U';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  trackByUserId(_: number, user: AdminUserRecord): string {
    return user._id;
  }

  private showToast(message: string, type: ToastType): void {
    this.toast = { visible: true, message, type };
    setTimeout(() => {
      this.toast.visible = false;
    }, 3500);
  }
}
