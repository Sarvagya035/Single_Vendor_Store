import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AdminService } from '../../../core/services/admin.service';
import { ToastType, VendorRecord } from '../../../core/models/admin.models';
import { RejectModalComponent } from '../reject-modal/reject-modal.component';
import { VendorListComponent } from '../vendor-list/vendor-list.component';
import { VendorReviewModalComponent } from '../vendor-review-modal/vendor-review-modal.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';
import { ToastBannerComponent } from '../../../shared/ui/toast-banner.component';

@Component({
  selector: 'app-admin-applications-page',
  standalone: true,
  imports: [CommonModule, VendorListComponent, RejectModalComponent, VendorReviewModalComponent, PageHeaderComponent, StatCardComponent, ToastBannerComponent],
  template: `
    <section class="space-y-6">
      <div class="app-surface p-6 sm:p-8">
        <app-page-header
          eyebrow="Vendor Applications"
          title="New Applications"
          description="Review each submitted vendor request, inspect full details, and make an approval decision from one focused queue."
        >
          <button type="button" (click)="loadPendingVendors()" [disabled]="isLoading" class="btn-secondary !py-3">
            {{ isLoading ? 'Refreshing...' : 'Refresh Applications' }}
          </button>
        </app-page-header>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <app-stat-card label="Pending" [value]="pendingVendors.length" tone="amber" />
        <app-stat-card
          class="md:col-span-2"
          label="Workflow"
          value="Open card, review full application, then approve or reject."
          [compact]="true"
          tone="indigo"
        />
      </div>

      <div *ngIf="isLoading" class="app-card-soft py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          <p class="font-medium text-slate-500">Loading pending applications...</p>
        </div>
      </div>

      <app-vendor-list
        *ngIf="!isLoading"
        [vendors]="pendingVendors"
        mode="pending"
        emptyTitle="No Pending Applications"
        emptyMessage="Every vendor request has already been reviewed. New applications will appear here automatically."
        (review)="openReviewModal($event)"
        (reject)="openRejectModal($event)"
      />

      <app-reject-modal
        [open]="rejectModal.open"
        [vendor]="rejectModal.vendor"
        [remarks]="rejectModal.remarks"
        [error]="rejectModal.error"
        [processing]="rejectModal.processing"
        (remarksChange)="updateRejectRemarks($event)"
        (cancel)="closeRejectModal()"
        (confirm)="confirmReject()"
      />

      <app-vendor-review-modal
        [open]="reviewModal.open"
        [vendor]="reviewModal.vendor"
        [remarks]="reviewModal.remarks"
        [error]="reviewModal.error"
        [processing]="reviewModal.processing"
        [showDecisionActions]="true"
        (close)="closeReviewModal()"
        (remarksChange)="updateReviewRemarks($event)"
        (approve)="approveFromReview($event)"
        (reject)="rejectFromReview($event)"
      />

      <app-toast-banner [visible]="toast.visible" [message]="toast.message" [type]="toast.type" />
    </section>
  `
})
export class AdminApplicationsPageComponent implements OnInit {
  pendingVendors: VendorRecord[] = [];
  isLoading = false;

  rejectModal = {
    open: false,
    vendor: null as VendorRecord | null,
    remarks: '',
    error: '',
    processing: false
  };

  reviewModal = {
    open: false,
    vendor: null as VendorRecord | null,
    remarks: '',
    error: '',
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
  ) { }

  ngOnInit(): void {
    this.loadPendingVendors();
  }

  loadPendingVendors(): void {
    this.isLoading = true;
    this.adminService.getPendingVendors().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.pendingVendors = this.decorateVendors(res?.data || []);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.showToast('Failed to load vendor applications.', 'error');
      }
    });
  }

  openReviewModal(vendor: VendorRecord): void {
    this.reviewModal = {
      open: true,
      vendor,
      remarks: '',
      error: '',
      processing: false
    };
  }

  updateReviewRemarks(remarks: string): void {
    this.reviewModal = { ...this.reviewModal, remarks, error: '' };
  }

  closeReviewModal(): void {
    this.reviewModal = {
      open: false,
      vendor: null,
      remarks: '',
      error: '',
      processing: false
    };
  }

  approveFromReview(vendor: VendorRecord): void {
    this.reviewModal = { ...this.reviewModal, processing: true, error: '' };
    vendor._processing = true;

    this.adminService.verifyVendor(vendor._id, 'approved').subscribe({
      next: (res) => {
        vendor._processing = false;
        this.reviewModal = { ...this.reviewModal, processing: false };
        if (!res?.success) {
          this.reviewModal = { ...this.reviewModal, error: 'Unable to approve vendor.' };
          return;
        }

        this.pendingVendors = this.pendingVendors.filter((item) => item._id !== vendor._id);
        this.closeReviewModal();
        this.showToast(`${vendor.shopName || 'Vendor'} approved successfully.`, 'success');
        this.appRefreshService.notify('admin');
      },
      error: () => {
        vendor._processing = false;
        this.reviewModal = { ...this.reviewModal, processing: false, error: 'Failed to approve vendor.' };
        this.showToast('Failed to approve vendor.', 'error');
      }
    });
  }

  rejectFromReview(vendor: VendorRecord): void {
    const remarks = this.reviewModal.remarks.trim();
    if (!remarks) {
      this.reviewModal = { ...this.reviewModal, error: 'A rejection reason is required before rejecting this application.' };
      return;
    }

    this.closeReviewModal();
    this.rejectModal = {
      open: true,
      vendor,
      remarks,
      error: '',
      processing: false
    };
  }

  openRejectModal(vendor: VendorRecord): void {
    this.rejectModal = {
      open: true,
      vendor,
      remarks: '',
      error: '',
      processing: false
    };
  }

  updateRejectRemarks(remarks: string): void {
    this.rejectModal = { ...this.rejectModal, remarks, error: '' };
  }

  closeRejectModal(): void {
    this.rejectModal = {
      open: false,
      vendor: null,
      remarks: '',
      error: '',
      processing: false
    };
  }

  confirmReject(): void {
    const vendor = this.rejectModal.vendor;
    if (!vendor) {
      return;
    }

    if (!this.rejectModal.remarks.trim()) {
      this.rejectModal = { ...this.rejectModal, error: 'A rejection reason is required.' };
      return;
    }

    this.rejectModal = { ...this.rejectModal, processing: true };
    this.adminService.verifyVendor(vendor._id, 'rejected', this.rejectModal.remarks).subscribe({
      next: (res) => {
        if (!res?.success) {
          this.rejectModal = { ...this.rejectModal, processing: false, error: 'Unable to reject vendor.' };
          return;
        }

        this.pendingVendors = this.pendingVendors.filter((item) => item._id !== vendor._id);
        this.closeRejectModal();
        this.showToast(`${vendor.shopName || 'Vendor'} rejected successfully.`, 'error');
        this.appRefreshService.notify('admin');
      },
      error: (err) => {
        this.rejectModal = {
          ...this.rejectModal,
          processing: false,
          error: err.error?.message || 'Failed to reject vendor. Try again.'
        };
      }
    });
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
