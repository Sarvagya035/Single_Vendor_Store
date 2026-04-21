import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminShipmentStatus,
  AdminShipmentUpdatePayload
} from '../../../core/models/vendor.models';
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
          title="Manage shipments"
          description="Track vendor shipments, update delivery fields, and keep logistics status consistent."
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

      <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">Loading shipment records...</div>

      <div *ngIf="!isLoading && shipments.length === 0" class="border-t border-slate-200 px-4 py-12 text-center sm:px-5 lg:px-6">
        <h2 class="vendor-empty-title">No shipments yet</h2>
        <p class="mt-3 text-sm font-medium text-slate-500">
          Shipment records will appear here after payment verification creates them.
        </p>
      </div>

        <div *ngIf="shipments.length" class="grid gap-5 border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6">
        <article
          *ngFor="let shipment of shipments; trackBy: trackByShipment"
          class="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:bg-[#fffaf4]"
        >
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-lg font-black text-slate-900">Order #{{ shortOrderId(shipment.orderId) }}</p>
                <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(shipment.shipmentStatus)">
                  {{ shipment.shipmentStatus || 'Created' }}
                </span>
                <span *ngIf="shipment.isTestMode" class="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-800">
                  Test Mode
                </span>
              </div>

                <div class="mt-4 grid gap-4 md:grid-cols-3">
                <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Customer</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.customerName || 'Customer' }}</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">{{ shipment.customerEmail || '-' }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Courier</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.courierName || 'DHL' }}</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">Tracking: {{ shipment.trackingNumber || 'Not assigned' }}</p>
                </div>
                <div class="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Timeline</p>
                  <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.trackingEvents.length }} update(s)</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">
                    Last synced {{ formatDateTime(shipment.lastSyncedAt) }}
                  </p>
                </div>
              </div>

              <div class="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Order status</p>
                <p class="mt-2 text-sm font-black text-slate-900">{{ shipment.orderStatus || 'Processing' }}</p>
                <p class="mt-1 text-xs font-semibold text-slate-500">
                  {{ shipment.createdAt ? 'Created ' + formatDateTime(shipment.createdAt) : 'Recently created' }}
                </p>
              </div>

              <div class="mt-4 grid gap-3">
                <article
                  *ngFor="let event of shipment.trackingEvents || []; trackBy: trackByEvent"
                  class="rounded-[1.4rem] border border-slate-200 bg-white p-4"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-sm font-black text-slate-900">{{ event.status }}</p>
                      <p class="mt-1 text-sm font-medium text-slate-600">{{ event.description || 'Tracking update' }}</p>
                    </div>
                    <p class="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {{ formatDateTime(event.eventTime) }}
                    </p>
                  </div>
                  <p *ngIf="event.location" class="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {{ event.location }}
                  </p>
                </article>
              </div>
            </div>

            <div class="min-w-[320px] rounded-[1.5rem] border border-slate-200 bg-[#fffaf4] p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Update shipment</p>
              <h3 class="mt-2 text-xl font-black text-slate-900">Edit delivery fields</h3>

              <div *ngIf="drafts[shipment.orderId] as draft" class="mt-4 space-y-3">
                <label class="block space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Courier</span>
                  <input
                    class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:ring-2 focus:ring-emerald-600/30"
                    [(ngModel)]="draft.courierName"
                  />
                </label>

                <label class="block space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Tracking number</span>
                  <input
                    class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:ring-2 focus:ring-emerald-600/30"
                    [(ngModel)]="draft.trackingNumber"
                  />
                </label>

                <label class="block space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Status</span>
                  <select
                    class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:ring-2 focus:ring-emerald-600/30"
                    [(ngModel)]="draft.shipmentStatus"
                  >
                    <option *ngFor="let status of statuses" [ngValue]="status">{{ status }}</option>
                  </select>
                </label>

                <label class="block space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Estimated delivery</span>
                  <input
                    type="date"
                    class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:ring-2 focus:ring-emerald-600/30"
                    [(ngModel)]="draft.estimatedDeliveryDate"
                  />
                </label>

                <label class="block space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Event note</span>
                  <textarea
                    rows="3"
                    class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:ring-2 focus:ring-emerald-600/30"
                    [(ngModel)]="draft.description"
                  ></textarea>
                </label>

                <label class="block space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Location</span>
                  <input
                    class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-emerald-300 focus:ring-2 focus:ring-emerald-600/30"
                    [(ngModel)]="draft.location"
                  />
                </label>

                <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <input type="checkbox" [(ngModel)]="draft.isTestMode" />
                  <span class="text-sm font-bold text-slate-800">Test mode shipment</span>
                </label>

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    class="btn-primary !px-5 !py-3"
                    [disabled]="savingOrderId === shipment.orderId"
                    (click)="saveShipment(shipment)"
                  >
                    {{ savingOrderId === shipment.orderId ? 'Saving...' : 'Save Shipment' }}
                  </button>
                  <a [routerLink]="['/track-order', shipment.orderId]" class="btn-secondary !px-5 !py-3">View Track Page</a>
                </div>
              </div>
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

  constructor(
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.isLoading = true;

    this.vendorService.getAdminShipments().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.summary = response?.summary || null;
        this.shipments = (response?.shipments || []).map((shipment: any) => this.mapShipment(shipment));
        this.drafts = this.buildDraftMap(this.shipments);
      },
      error: () => {
        this.isLoading = false;
        this.shipments = [];
        this.summary = null;
        this.drafts = {};
      }
    });
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
        return 'bg-emerald-100 text-emerald-700';
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Created':
        return 'bg-emerald-100 text-emerald-700';
      case 'Exception':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
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
}
