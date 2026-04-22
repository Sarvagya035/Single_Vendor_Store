import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminShipmentStatus,
  AdminShipmentUpdatePayload
} from '../../../core/models/vendor.models';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

interface ShipmentDraft {
  courierName: string;
  trackingNumber: string;
  shipmentStatus: AdminShipmentStatus | string;
  estimatedDeliveryDate: string;
  description: string;
  location: string;
  isTestMode: boolean;
}

interface ShipmentCardView {
  _id?: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shipmentStatus: string;
  courierName: string;
  trackingNumber: string;
  estimatedDeliveryDate?: string;
  lastSyncedAt?: string;
  isTestMode: boolean;
  orderStatus: string;
  createdAt?: string;
  deliveredAt?: string;
  trackingEvents: Array<{
    status: string;
    description?: string;
    location?: string;
    eventTime?: string;
  }>;
}

@Component({
  selector: 'app-vendor-shipments-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header
            eyebrow="Shipments"
            title="Shipment management"
            titleClass="!text-[1.9rem] sm:!text-[2.2rem]"
          >
            <button type="button" (click)="loadShipments()" [disabled]="isLoading" class="btn-secondary !py-3">
              {{ isLoading ? 'Refreshing...' : 'Refresh Shipments' }}
            </button>
          </app-page-header>
        </div>

        <div *ngIf="summary" class="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-3 lg:px-6">
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label">Total</p>
            <p class="vendor-stat-value">{{ summary.totalShipments }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label">Open</p>
            <p class="vendor-stat-value">{{ summary.openShipments }}</p>
          </article>
          <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
            <p class="vendor-stat-label">Delivered</p>
            <p class="vendor-stat-value">{{ summary.deliveredShipments }}</p>
          </article>
        </div>

        <div *ngIf="successMessage" class="border-t border-slate-200 px-4 py-3 text-sm font-semibold text-emerald-800 sm:px-5 lg:px-6">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">
          Loading shipment records...
        </div>

        <div *ngIf="!isLoading && shipments.length === 0" class="border-t border-slate-200 px-4 py-12 text-center sm:px-5 lg:px-6">
          <h2 class="vendor-empty-title">No shipments yet</h2>
          <p class="mt-3 text-sm font-medium text-slate-500">
            Shipment records will appear here after payment verification creates them.
          </p>
        </div>

        <div *ngIf="shipments.length" class="space-y-4 border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6">
          <article
            *ngFor="let shipment of shipments; trackBy: trackByShipment"
            class="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(47,27,20,0.05)]"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eee9] text-[#7c5646]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" aria-hidden="true">
                      <path d="M3 7h11v8H3z" />
                      <path d="M14 10h3l3 3v2h-6z" />
                      <circle cx="7" cy="18" r="1.5" />
                      <circle cx="17" cy="18" r="1.5" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="text-lg font-black text-slate-900 sm:text-xl">ORD-{{ shortOrderId(shipment.orderId) }}</p>
                      <span *ngIf="shipment.isTestMode" class="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                        Test Mode
                      </span>
                    </div>
                    <p class="mt-1 text-sm font-medium text-[#9c5f39]">
                      {{ shipment.customerName || 'Customer' }} • {{ shipment.customerEmail || '-' }}
                    </p>
                  </div>
                </div>

                <div class="mt-5 grid gap-4 md:grid-cols-4">
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Courier</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.courierName || 'DHL' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Tracking Number</p>
                    <p class="mt-2 break-all text-sm font-black text-slate-900">{{ shipment.trackingNumber || 'Not assigned' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Estimated Delivery</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.estimatedDeliveryDate ? formatDate(shipment.estimatedDeliveryDate) : 'Not set' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Last Synced</p>
                    <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.lastSyncedAt ? formatDateTime(shipment.lastSyncedAt) : 'Not synced' }}</p>
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black" [ngClass]="statusClass(shipment.shipmentStatus)">
                  <span class="h-2.5 w-2.5 rounded-full" [ngClass]="statusDotClass(shipment.shipmentStatus)"></span>
                  {{ shipment.shipmentStatus || 'Created' }}
                </span>

                <button
                  type="button"
                  class="w-full rounded-full bg-[#f5ede5] px-5 py-3 text-sm font-black text-[#7c5646] transition hover:bg-[#efe1d5]"
                  (click)="toggleShipment(shipment.orderId)"
                >
                  {{ isExpanded(shipment.orderId) ? 'Hide Timeline & Edit' : 'View Timeline & Edit' }}
                </button>
              </div>
            </div>

            <div *ngIf="isExpanded(shipment.orderId)" class="mt-5 border-t border-slate-200 pt-5">
              <div class="grid gap-0 overflow-hidden rounded-[1.5rem] border border-slate-200 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
                <section class="border-b border-slate-200 bg-[#fffaf4] p-5 lg:border-b-0 lg:border-r">
                  <div class="flex items-center gap-2">
                    <span class="text-[#7c5646]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4l3 2" />
                      </svg>
                    </span>
                    <h3 class="text-lg font-black text-slate-900">Tracking Timeline ({{ shipment.trackingEvents.length }} events)</h3>
                  </div>

                  <div class="mt-5 space-y-5">
                    <article
                      *ngFor="let event of shipment.trackingEvents || []; trackBy: trackByEvent"
                      class="relative pl-6"
                    >
                      <span class="absolute left-0 top-1.5 h-3 w-3 rounded-full" [ngClass]="timelineDotClass(event.status)"></span>
                      <span class="absolute left-[5px] top-4 bottom-0 w-px bg-slate-200"></span>
                      <div class="space-y-1">
                        <p class="text-sm font-black text-slate-900">{{ event.status }}</p>
                        <p class="text-sm font-medium text-slate-600">{{ event.description || 'Tracking update' }}</p>
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#9c5f39]">
                          {{ event.location || 'Location unavailable' }} • {{ formatDateTime(event.eventTime) }}
                        </p>
                      </div>
                    </article>
                  </div>
                </section>

                <section class="bg-white p-5">
                  <div class="flex items-center gap-2">
                    <span class="text-[#7c5646]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
                        <path d="M4 20h16" />
                        <path d="M14.5 3.5l6 6L9 21H3v-6z" />
                      </svg>
                    </span>
                    <h3 class="text-lg font-black text-slate-900">
                      {{ isAdminUser ? 'Edit Shipment Details' : 'Shipment Details' }}
                    </h3>
                  </div>

                  <div *ngIf="drafts[shipment.orderId] as draft" class="mt-5 space-y-4">
                    <label class="block space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Courier Name</span>
                      <input
                        class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                        [(ngModel)]="draft.courierName"
                        [readonly]="!isAdminUser"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Tracking Number</span>
                      <input
                        class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                        [(ngModel)]="draft.trackingNumber"
                        [readonly]="!isAdminUser"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Status</span>
                      <select
                        class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                        [(ngModel)]="draft.shipmentStatus"
                        [disabled]="!isAdminUser"
                      >
                        <option *ngFor="let status of statuses" [ngValue]="status">{{ status }}</option>
                      </select>
                    </label>

                    <label class="block space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Estimated Delivery</span>
                      <input
                        type="date"
                        class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                        [(ngModel)]="draft.estimatedDeliveryDate"
                        [readonly]="!isAdminUser"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Event Note</span>
                      <textarea
                        rows="3"
                        class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                        [(ngModel)]="draft.description"
                        [readonly]="!isAdminUser"
                      ></textarea>
                    </label>

                    <label class="block space-y-2">
                      <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Location</span>
                      <input
                        class="block w-full rounded-2xl border border-[#eadcc9] bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner outline-none transition focus:border-[#d4a017] focus:ring-4 focus:ring-amber-100"
                        [(ngModel)]="draft.location"
                        [readonly]="!isAdminUser"
                      />
                    </label>

                    <label class="flex items-center gap-3 rounded-2xl border border-[#eadcc9] bg-[#fffaf4] px-4 py-3">
                      <input type="checkbox" [(ngModel)]="draft.isTestMode" [disabled]="!isAdminUser" />
                      <span class="text-sm font-bold text-slate-800">Test mode shipment</span>
                    </label>

                    <div *ngIf="!isAdminUser" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                      Shipment editing is currently limited to admin users. Vendors can still review the shipment timeline here.
                    </div>

                    <div class="flex flex-col gap-3 pt-2 sm:flex-row">
                      <button
                        *ngIf="isAdminUser"
                        type="button"
                        class="rounded-2xl bg-[#7c5646] px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(124,86,70,0.18)] transition hover:bg-[#6e4b3d]"
                        [disabled]="savingOrderId === shipment.orderId"
                        (click)="saveShipment(shipment)"
                      >
                        {{ savingOrderId === shipment.orderId ? 'Saving...' : 'Save Shipment' }}
                      </button>
                      <a [routerLink]="['/vendor/orders', shipment.orderId, 'tracking']" class="rounded-2xl border border-[#eadcc9] bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-[#fffaf4]">
                        Open Track Page
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `
})
export class VendorShipmentsPageComponent implements OnInit {
  shipments: ShipmentCardView[] = [];
  drafts: Record<string, ShipmentDraft> = {};
  summary: { totalShipments: number; deliveredShipments: number; openShipments: number } | null = null;
  statuses: AdminShipmentStatus[] = ['Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Exception'];
  isLoading = false;
  savingOrderId = '';
  successMessage = '';
  expandedOrderId = '';
  currentRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentRoles = this.normalizeRoles(user?.role);
    });

    if (!this.currentRoles.length) {
      this.authService.getCurrentUser().subscribe({
        error: () => {
          this.currentRoles = [];
        }
      });
    }

    this.loadShipments();
  }

  get isAdminUser(): boolean {
    return this.currentRoles.includes('admin') || this.currentRoles.includes('Admin');
  }

  loadShipments(): void {
    this.isLoading = true;

    this.vendorService.getAdminShipments().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.summary = response?.summary || null;
        this.shipments = (response?.shipments || []).map((shipment: any) => this.mapShipment(shipment));
        this.drafts = this.buildDraftMap(this.shipments);
        this.expandedOrderId = this.expandedOrderId && this.shipments.some((shipment) => shipment.orderId === this.expandedOrderId)
          ? this.expandedOrderId
          : '';
      },
      error: () => {
        this.isLoading = false;
        this.shipments = [];
        this.summary = null;
        this.drafts = {};
        this.expandedOrderId = '';
      }
    });
  }

  toggleShipment(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? '' : orderId;
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderId === orderId;
  }

  saveShipment(shipment: ShipmentCardView): void {
    if (!shipment.orderId) {
      return;
    }

    const draft = this.drafts[shipment.orderId];
    if (!draft) {
      return;
    }

    const payload: AdminShipmentUpdatePayload = {
      courierName: draft.courierName,
      trackingNumber: draft.trackingNumber,
      shipmentStatus: draft.shipmentStatus,
      estimatedDeliveryDate: draft.estimatedDeliveryDate || undefined,
      description: draft.description,
      location: draft.location,
      isTestMode: draft.isTestMode
    };

    this.savingOrderId = shipment.orderId;
    this.successMessage = '';

    this.vendorService.updateAdminShipment(shipment.orderId, payload).subscribe({
      next: (response) => {
        const updated = this.mapShipment(response?.data);
        this.shipments = this.shipments.map((entry) => (entry.orderId === shipment.orderId ? updated : entry));
        this.drafts = this.buildDraftMap(this.shipments);
        this.savingOrderId = '';
        this.successMessage = response?.message || 'Shipment updated successfully.';
      },
      error: (error) => {
        this.savingOrderId = '';
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  trackByShipment(index: number, shipment: ShipmentCardView): string {
    return shipment.orderId || String(index);
  }

  trackByEvent(index: number, event: { status: string; eventTime?: string }): string {
    return `${event.status}-${event.eventTime || index}`;
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
  }

  formatDateTime(value?: string): string {
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

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Created':
        return 'border-sky-200 bg-sky-50 text-sky-600';
      case 'Exception':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }
  }

  statusDotClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500';
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Created':
        return 'bg-sky-500';
      case 'Exception':
        return 'bg-rose-500';
      default:
        return 'bg-amber-500';
    }
  }

  timelineDotClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500';
      case 'Out for Delivery':
        return 'bg-amber-400';
      case 'In Transit':
      case 'Picked Up':
      case 'Created':
        return 'bg-slate-500';
      case 'Exception':
        return 'bg-rose-500';
      default:
        return 'bg-[#7c5646]';
    }
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

  private mapShipment(shipment: any): ShipmentCardView {
    const order = shipment?.order || {};
    const user = order?.user || {};

    const orderId = String(order?._id || shipment?.order || '');

    return {
      _id: shipment?._id,
      orderId,
      orderNumber: orderId ? orderId.slice(-8).toUpperCase() : '--------',
      customerName: user?.fullName || user?.username || user?.email || 'Customer',
      customerEmail: user?.email || '',
      shipmentStatus: shipment?.shipmentStatus || 'Created',
      courierName: shipment?.courierName || 'DHL',
      trackingNumber: shipment?.trackingNumber || '',
      estimatedDeliveryDate: shipment?.estimatedDeliveryDate,
      lastSyncedAt: shipment?.lastSyncedAt,
      isTestMode: Boolean(shipment?.isTestMode),
      orderStatus: order?.orderStatus || 'Processing',
      createdAt: shipment?.createdAt,
      deliveredAt: shipment?.deliveredAt,
      trackingEvents: Array.isArray(shipment?.trackingEvents)
        ? shipment.trackingEvents.map((event: any) => ({
            status: event?.status || 'Update',
            description: event?.description,
            location: event?.location,
            eventTime: event?.eventTime
          }))
        : []
    };
  }

  private buildDraftMap(shipments: ShipmentCardView[]): Record<string, ShipmentDraft> {
    return shipments.reduce<Record<string, ShipmentDraft>>((map, shipment) => {
      map[shipment.orderId] = {
        courierName: shipment.courierName || 'DHL',
        trackingNumber: shipment.trackingNumber || '',
        shipmentStatus: shipment.shipmentStatus || 'Created',
        estimatedDeliveryDate: this.toDateInputValue(shipment.estimatedDeliveryDate),
        description: '',
        location: '',
        isTestMode: shipment.isTestMode
      };
      return map;
    }, {});
  }

  private toDateInputValue(value?: string): string {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString().slice(0, 10);
  }

  private normalizeRoles(role: unknown): string[] {
    if (Array.isArray(role)) {
      return role.map((value) => String(value));
    }

    if (typeof role === 'string' && role.trim()) {
      return [role];
    }

    return [];
  }
}
