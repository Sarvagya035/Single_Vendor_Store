import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { ToastType, VendorRecord, VendorTab } from '../../../core/models/admin.models';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { VendorListComponent } from '../vendor-list/vendor-list.component';
import { VendorReviewModalComponent } from '../vendor-review-modal/vendor-review-modal.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';
import { ToastBannerComponent } from '../../../shared/ui/toast-banner.component';

@Component({
  selector: 'app-admin-vendors-page',
  standalone: true,
  imports: [CommonModule, VendorListComponent, DeleteModalComponent, VendorReviewModalComponent, PageHeaderComponent, StatCardComponent, ToastBannerComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface p-6 sm:p-8">
        <app-page-header
          eyebrow="Vendor Directory"
          title="Manage existing vendors"
          description="Switch between approved and rejected accounts, inspect full vendor details, and remove records when needed."
        >
          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                (click)="setVendorTab('active')"
                class="min-w-32 rounded-xl px-4 py-2.5 text-sm font-black transition-all"
                [ngClass]="vendorTab === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'"
              >
                Active Vendors
              </button>
              <button
                type="button"
                (click)="setVendorTab('rejected')"
                class="min-w-32 rounded-xl px-4 py-2.5 text-sm font-black transition-all"
                [ngClass]="vendorTab === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'"
              >
                Rejected Vendors
              </button>
            </div>

            <button type="button" (click)="loadVendors()" [disabled]="isLoading" class="btn-secondary !py-3">
              {{ isLoading ? 'Refreshing...' : 'Refresh Vendors' }}
            </button>
          </div>
        </app-page-header>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <app-stat-card label="Approved" [value]="activeVendors.length" tone="emerald" />
        <app-stat-card label="Rejected" [value]="rejectedVendors.length" tone="rose" />
      </div>

      <div *ngIf="isLoading" class="app-card-soft py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
          <p class="font-medium text-slate-500">Loading vendor records...</p>
        </div>
      </div>

      <app-vendor-list
        *ngIf="!isLoading"
        [vendors]="selectedVendorList"
        mode="vendors"
        [vendorTab]="vendorTab"
        [emptyTitle]="emptyVendorStateTitle()"
        [emptyMessage]="emptyVendorStateMessage()"
        (review)="openVendorDetails($event)"
        (delete)="openDeleteModal($event)"
      />

      <app-delete-modal
        [open]="deleteModal.open"
        [vendor]="deleteModal.vendor"
        [processing]="deleteModal.processing"
        (cancel)="closeDeleteModal()"
        (confirm)="confirmDelete()"
      />

      <app-vendor-review-modal
        [open]="reviewModal.open"
        [vendor]="reviewModal.vendor"
        [remarks]="''"
        [error]="''"
        [processing]="false"
        [showDecisionActions]="false"
        (close)="closeReviewModal()"
      />

      <app-toast-banner [visible]="toast.visible" [message]="toast.message" [type]="toast.type" />
    </section>
  `
})
export class AdminVendorsPageComponent implements OnInit {
  vendorTab: VendorTab = 'active';
  activeVendors: VendorRecord[] = [];
  rejectedVendors: VendorRecord[] = [];
  isLoading = false;

  reviewModal = {
    open: false,
    vendor: null as VendorRecord | null
  };

  deleteModal = {
    open: false,
    vendor: null as VendorRecord | null,
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
    this.loadVendors();
  }

  get selectedVendorList(): VendorRecord[] {
    return this.vendorTab === 'active' ? this.activeVendors : this.rejectedVendors;
  }

  setVendorTab(tab: VendorTab): void {
    this.vendorTab = tab;
  }

  loadVendors(): void {
    this.isLoading = true;
    forkJoin({
      active: this.adminService.getActiveVendors(),
      rejected: this.adminService.getRejectedVendors()
    }).subscribe({
      next: ({ active, rejected }) => {
        this.isLoading = false;
        this.activeVendors = this.decorateVendors(active?.data || []);
        this.rejectedVendors = this.decorateVendors(rejected?.data || []);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.showToast('Failed to load vendor records.', 'error');
      }
    });
  }

  openVendorDetails(vendor: VendorRecord): void {
    this.reviewModal = {
      open: true,
      vendor
    };
  }

  closeReviewModal(): void {
    this.reviewModal = {
      open: false,
      vendor: null
    };
  }

  openDeleteModal(vendor: VendorRecord): void {
    this.deleteModal = {
      open: true,
      vendor,
      processing: false
    };
  }

  closeDeleteModal(): void {
    this.deleteModal = {
      open: false,
      vendor: null,
      processing: false
    };
  }

  confirmDelete(): void {
    const vendor = this.deleteModal.vendor;
    if (!vendor) {
      return;
    }

    vendor._processing = true;
    this.deleteModal = { ...this.deleteModal, processing: true };

    this.adminService.deleteVendorAndProducts(vendor._id).subscribe({
      next: (res) => {
        vendor._processing = false;
        if (!res?.success) {
          this.deleteModal = { ...this.deleteModal, processing: false };
          this.showToast('Unable to delete vendor.', 'error');
          return;
        }

        this.activeVendors = this.activeVendors.filter((item) => item._id !== vendor._id);
        this.rejectedVendors = this.rejectedVendors.filter((item) => item._id !== vendor._id);
        this.closeDeleteModal();
        this.showToast(`${vendor.shopName || 'Vendor'} deleted successfully.`, 'success');
        this.appRefreshService.notify('admin');
      },
      error: (err) => {
        vendor._processing = false;
        this.deleteModal = { ...this.deleteModal, processing: false };
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.showToast(err.error?.message || 'Failed to delete vendor.', 'error');
      }
    });
  }

  emptyVendorStateTitle(): string {
    return this.vendorTab === 'active' ? 'No Active Vendors Yet' : 'No Rejected Vendors Yet';
  }

  emptyVendorStateMessage(): string {
    return this.vendorTab === 'active'
      ? 'Approved vendor accounts will appear here as soon as they are verified by the admin team.'
      : 'Rejected vendor applications will appear here after you decline them with admin remarks.';
  }

  private decorateVendors(vendors: VendorRecord[]): VendorRecord[] {
    return vendors.map((vendor) => ({ ...vendor, _processing: false }));
  }

  private showToast(message: string, type: ToastType): void {
    this.toast = { visible: true, message, type };
    setTimeout(() => {
      this.toast.visible = false;
    }, 3500);
  }
}
