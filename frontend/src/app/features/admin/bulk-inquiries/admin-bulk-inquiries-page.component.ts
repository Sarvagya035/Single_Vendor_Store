import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import {
  BulkInquiryRecord,
  BulkInquiryStatus,
  BulkInquirySummary
} from '../../../core/models/bulk-inquiry.models';
import { AdminBulkInquiryService } from '../../../core/services/admin-bulk-inquiry.service';
import { BadgeComponent as AppBadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent as AppButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent as AppCardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent as AppEmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ErrorService } from '../../../core/services/error.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { StatCardComponent as AppStatCardComponent } from '../../../shared/ui/stat-card/stat-card.component';

const statusOptions: BulkInquiryStatus[] = ['new', 'reviewed', 'contacted', 'closed'];

@Component({
  selector: 'app-admin-bulk-inquiries-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppStatCardComponent
  ],
  template: `
    <section class="space-y-6">
      <div class="space-y-6">
        <app-card cardClass="p-6 sm:p-8">
          <app-page-header
            eyebrow="Bulk Inquiries"
            title="Bulk inquiry management"
            description="Review customer and business bulk order requests, then update the inquiry status as your team works through them."
          >
            <app-button variant="secondary" type="button" (click)="loadInquiries()" [disabled]="isLoading" buttonClass="w-full !py-3 sm:w-auto">
              {{ isLoading ? 'Refreshing...' : 'Refresh Inquiries' }}
            </app-button>
          </app-page-header>
        </app-card>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <app-stat-card label="Total" [value]="summary.totalInquiries.toString()" cardClass="border-l-4 border-l-amber-500 !border-amber-100 !bg-[#fff7ed]/80" />
          <app-stat-card label="New" [value]="summary.newCount.toString()" cardClass="border-l-4 border-l-sky-500 !border-amber-100 !bg-[#fff7ed]/80" />
          <app-stat-card label="Reviewed" [value]="summary.reviewedCount.toString()" cardClass="border-l-4 border-l-emerald-500 !border-amber-100 !bg-[#fff7ed]/80" />
          <app-stat-card label="Contacted" [value]="summary.contactedCount.toString()" cardClass="border-l-4 border-l-indigo-500 !border-amber-100 !bg-[#fff7ed]/80" />
        </div>

        <app-card *ngIf="isLoading" cardClass="border-t border-slate-200 px-6 py-10">
          <p class="text-sm font-semibold text-slate-500">Loading bulk inquiries...</p>
        </app-card>

        <app-empty-state
          *ngIf="!isLoading && inquiries.length === 0"
          title="No bulk inquiries yet"
          description="New bulk order requests will appear here when customers submit the form."
          cardClass="border-t border-dashed"
        />

        <div *ngIf="!isLoading && inquiries.length" class="hidden overflow-x-auto lg:block">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="bg-[#fffaf5]">
              <tr class="text-left text-sm font-semibold text-slate-500">
                <th class="vendor-table-head-cell font-semibold">Customer Name</th>
                <th class="vendor-table-head-cell font-semibold">Phone</th>
                <th class="vendor-table-head-cell font-semibold">Business Name</th>
                <th class="vendor-table-head-cell font-semibold">Order Type</th>
                <th class="vendor-table-head-cell font-semibold">City</th>
                <th class="vendor-table-head-cell font-semibold">Status</th>
                <th class="vendor-table-head-cell font-semibold">Submitted Date</th>
                <th class="vendor-table-head-cell font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inquiry of inquiries; trackBy: trackByInquiry" class="border-t border-slate-200 bg-white transition hover:bg-[#fffaf4]">
                <td class="border-t border-slate-200 vendor-table-cell">
                  <div class="min-w-0">
                    <p class="truncate text-base font-black text-slate-900">{{ inquiry.fullName }}</p>
                    <p class="mt-1 truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ inquiry.email || 'No email provided' }}</p>
                  </div>
                </td>

                <td class="border-t border-slate-200 vendor-table-cell text-sm font-medium text-[#9c5f39]">
                  {{ inquiry.phone }}
                </td>

                <td class="border-t border-slate-200 vendor-table-cell text-sm font-medium text-slate-700">
                  {{ inquiry.businessName || 'Individual buyer' }}
                </td>

                <td class="border-t border-slate-200 vendor-table-cell text-sm font-black text-slate-900">
                  {{ inquiry.orderType }}
                </td>

                <td class="border-t border-slate-200 vendor-table-cell text-sm font-medium text-slate-700">
                  {{ inquiry.city }}
                </td>

                <td class="border-t border-slate-200 vendor-table-cell">
                  <app-badge [tone]="statusTone(inquiry.status)" badgeClass="px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                    {{ inquiry.status }}
                  </app-badge>
                </td>

                <td class="border-t border-slate-200 vendor-table-cell text-sm font-medium text-[#9c5f39]">
                  {{ formatDate(inquiry.createdAt) }}
                </td>

                <td class="border-t border-slate-200 vendor-table-cell text-right">
                  <div class="flex items-center justify-end gap-3">
                    <select
                      class="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-amber-100"
                      [ngModel]="inquiry.status"
                      [ngModelOptions]="{ standalone: true }"
                      (ngModelChange)="updateStatus(inquiry, $event)"
                      [disabled]="updatingId === inquiry._id"
                    >
                      <option *ngFor="let status of statuses" [ngValue]="status">{{ status }}</option>
                    </select>

                    <app-button variant="primary" type="button" buttonClass="!px-4 !py-2.5 text-sm" (click)="openDetails(inquiry)">
                      View
                    </app-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!isLoading && inquiries.length" class="grid gap-4 lg:hidden">
          <article *ngFor="let inquiry of inquiries; trackBy: trackByInquiry" class="vendor-mobile-card">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="truncate text-base font-black text-slate-900">{{ inquiry.fullName }}</p>
                <p class="mt-1 break-words text-sm font-medium text-[#9c5f39]">{{ inquiry.phone }}</p>
              </div>
              <app-badge [tone]="statusTone(inquiry.status)" badgeClass="px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]">
                {{ inquiry.status }}
              </app-badge>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Business</p>
                <p class="mt-2 text-sm font-black text-slate-900">{{ inquiry.businessName || 'Individual buyer' }}</p>
              </div>
              <div class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Order Type</p>
                <p class="mt-2 text-sm font-black text-slate-900">{{ inquiry.orderType }}</p>
              </div>
              <div class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">City</p>
                <p class="mt-2 text-sm font-black text-slate-900">{{ inquiry.city }}</p>
              </div>
              <div class="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Submitted</p>
                <p class="mt-2 text-sm font-black text-slate-900">{{ formatDate(inquiry.createdAt) }}</p>
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                class="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-700 outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-amber-100"
                [ngModel]="inquiry.status"
                [ngModelOptions]="{ standalone: true }"
                (ngModelChange)="updateStatus(inquiry, $event)"
                [disabled]="updatingId === inquiry._id"
              >
                <option *ngFor="let status of statuses" [ngValue]="status">{{ status }}</option>
              </select>

              <app-button variant="primary" type="button" buttonClass="w-full !px-4 !py-3 text-sm" (click)="openDetails(inquiry)">
                View Details
              </app-button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div *ngIf="detailsOpen && selectedInquiry" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#2f1b14]/45 px-3 py-3 sm:items-center sm:px-4 sm:py-4">
      <div class="my-auto w-full max-w-3xl rounded-[1.5rem] border border-[#eadcc9] bg-white p-5 shadow-2xl sm:p-8">
        <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="vendor-stat-label !text-amber-700">Bulk Inquiry Details</p>
            <h3 class="vendor-panel-title">Inquiry overview</h3>
          </div>
          <button type="button" (click)="closeDetails()" class="btn-secondary w-full !px-4 !py-2 text-xs sm:w-auto">
            Close
          </button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Customer Name</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.fullName }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.phone }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Email</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.email || 'No email provided' }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Business Name</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.businessName || 'Individual buyer' }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Order Type</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.orderType }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">City</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.city }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Quantity</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.quantity || 'Not specified' }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Status</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ selectedInquiry.status }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4 md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Product Requirement</p>
            <p class="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-slate-700">{{ selectedInquiry.productRequirement }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4 md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Submitted Date</p>
            <p class="mt-2 text-sm font-black text-slate-900">{{ formatDateTime(selectedInquiry.createdAt) }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4 md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Last Response</p>
            <p class="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-slate-700">
              {{ selectedInquiry.vendorResponseMessage || 'No message sent yet' }}
            </p>
            <div class="mt-4 flex flex-col gap-2 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Responded by: {{ selectedInquiry.lastRespondedBy || 'Not recorded' }}</span>
              <span>Responded at: {{ formatDateTime(selectedInquiry.lastRespondedAt) }}</span>
            </div>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-[#fffaf4] p-4 md:col-span-2">
            <label class="block space-y-2">
              <span class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Message to customer</span>
              <textarea
                class="min-h-[120px] w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-medium leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                [(ngModel)]="statusUpdateMessage"
                [ngModelOptions]="{ standalone: true }"
                placeholder="Write a message the customer will receive by email..."
                maxlength="1000"
              ></textarea>
            </label>
            <p class="mt-2 text-xs font-medium text-slate-500">
              Optional. The message will be included in the customer email when you change the status.
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 border-t border-[#f1e4d4] pt-5 sm:flex-row sm:items-center sm:justify-end">
          <label class="block min-w-0 flex-1 space-y-2 sm:flex-none sm:w-[240px]">
            <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Update Status</span>
            <select
              class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-700 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
              [ngModel]="selectedInquiry.status"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="updateStatus(selectedInquiry, $event, statusUpdateMessage)"
              [disabled]="updatingId === selectedInquiry._id"
            >
              <option *ngFor="let status of statuses" [ngValue]="status">{{ status }}</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  `
})
export class AdminBulkInquiriesPageComponent implements OnInit {
  inquiries: BulkInquiryRecord[] = [];
  summary: BulkInquirySummary = {
    totalInquiries: 0,
    newCount: 0,
    reviewedCount: 0,
    contactedCount: 0,
    closedCount: 0
  };
  statuses = statusOptions;
  isLoading = false;
  updatingId = '';
  detailsOpen = false;
  selectedInquiry: BulkInquiryRecord | null = null;
  statusUpdateMessage = '';

  constructor(
    private readonly adminBulkInquiryService: AdminBulkInquiryService,
    private readonly errorService: ErrorService,
    private readonly appRefreshService: AppRefreshService
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.isLoading = true;

    this.adminBulkInquiryService.getBulkInquiries().subscribe({
      next: (response) => {
        this.inquiries = response?.data?.inquiries || [];
        this.summary = response?.data?.summary || this.summary;
        this.isLoading = false;
        this.appRefreshService.notify('vendor');

        if (this.selectedInquiry) {
          const refreshed = this.inquiries.find((item) => item._id === this.selectedInquiry?._id) || null;
          this.selectedInquiry = refreshed;
          this.statusUpdateMessage = refreshed?.vendorResponseMessage || this.statusUpdateMessage || '';
        }
      },
      error: (error) => {
        this.inquiries = [];
        this.summary = {
          totalInquiries: 0,
          newCount: 0,
          reviewedCount: 0,
          contactedCount: 0,
          closedCount: 0
        };
        this.isLoading = false;
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  openDetails(inquiry: BulkInquiryRecord): void {
    this.selectedInquiry = inquiry;
    this.statusUpdateMessage = inquiry.vendorResponseMessage || '';
    this.detailsOpen = true;
  }

  closeDetails(): void {
    this.detailsOpen = false;
    this.selectedInquiry = null;
    this.statusUpdateMessage = '';
  }

  updateStatus(inquiry: BulkInquiryRecord, status: BulkInquiryStatus, message = ''): void {
    const normalizedMessage = String(message || '').trim();

    if (!inquiry?._id || (inquiry.status === status && !normalizedMessage)) {
      return;
    }

    this.updatingId = inquiry._id;

    this.adminBulkInquiryService.updateBulkInquiryStatus(inquiry._id, {
      status,
      message: normalizedMessage
    })
      .pipe(finalize(() => {
        this.updatingId = '';
      }))
      .subscribe({
        next: (response) => {
          const updated = response?.data?.inquiry;
          this.inquiries = this.inquiries.map((item) => item._id === inquiry._id && updated ? updated : item);
          this.summary = this.recalculateSummary(this.inquiries);

          if (this.selectedInquiry?._id === inquiry._id) {
            this.selectedInquiry = updated || this.selectedInquiry;
            this.statusUpdateMessage = this.selectedInquiry?.vendorResponseMessage || normalizedMessage || '';
          }

          if (response?.data?.emailWarning) {
            this.errorService.showToast(response.data.emailWarning, 'warning');
            this.appRefreshService.notify('vendor');
            return;
          }

          this.errorService.showToast(response?.message || 'Status updated and customer email sent.', 'success');
          this.appRefreshService.notify('vendor');
        },
        error: (error) => {
          this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
        }
      });
  }

  statusTone(status: BulkInquiryStatus): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'new':
        return 'warning';
      case 'reviewed':
        return 'neutral';
      case 'contacted':
        return 'success';
      case 'closed':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  formatDateTime(value?: string): string {
    if (!value) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  trackByInquiry(index: number, inquiry: BulkInquiryRecord): string {
    return inquiry._id || String(index);
  }

  private recalculateSummary(items: BulkInquiryRecord[]): BulkInquirySummary {
    return {
      totalInquiries: items.length,
      newCount: items.filter((item) => item.status === 'new').length,
      reviewedCount: items.filter((item) => item.status === 'reviewed').length,
      contactedCount: items.filter((item) => item.status === 'contacted').length,
      closedCount: items.filter((item) => item.status === 'closed').length
    };
  }
}
