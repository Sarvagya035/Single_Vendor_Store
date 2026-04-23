import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  ShipmentEventRecord,
  ShipmentRecord
} from '../../core/models/order.models';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mt-4 space-y-6 px-4 sm:mt-5 sm:px-6 lg:mt-6 lg:px-8">
      <div class="mx-auto w-full max-w-7xl">
        <div *ngIf="successMessage" class="mx-4 mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 sm:mx-5 lg:mx-6">
          {{ successMessage }}
        </div>

        <div *ngIf="isLoading" class="px-4 py-10 text-sm font-semibold text-slate-500 sm:px-5 lg:px-6">Loading order details...</div>

        <div *ngIf="!isLoading && order as currentOrder" [ngClass]="isVendorView() ? 'mt-0' : 'mt-8'">
          <ng-container *ngIf="isVendorView(); else customerOrderLayout">
            <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm overflow-hidden sm:p-6 lg:p-7">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1">
                  <p class="vendor-stat-label">Vendor Order</p>
                  <h2 class="vendor-panel-title mt-2 truncate">Order #{{ shortOrderId(currentOrder._id) }}</h2>
                  <p class="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500">
                    Review item totals, shipping details, payment status, and tracking from one clean vendor-friendly layout.
                  </p>
                </div>

                <div class="flex flex-wrap gap-3">
                  <a [routerLink]="backLink" class="btn-secondary !px-5 !py-3">Back To Orders</a>
                  <a *ngIf="currentOrder._id as orderId" [routerLink]="trackOrderLink(orderId)" class="btn-primary !px-5 !py-3">
                    Track Order
                  </a>
                </div>
              </div>

              <div class="mt-6 grid gap-4 md:grid-cols-3">
                <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
                  <p class="vendor-stat-label !text-amber-700">Order Total</p>
                  <p class="vendor-stat-value">{{ formatCurrency(displayTotal) }}</p>
                </article>
                <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
                  <p class="vendor-stat-label !text-amber-700">Items</p>
                  <p class="vendor-stat-value">{{ visibleItems.length }}</p>
                </article>
                <article class="vendor-stat-card !border-amber-100 !bg-[#fff7ed]/80">
                  <p class="vendor-stat-label !text-amber-600">Status</p>
                  <p class="vendor-stat-value">{{ displayStatus }}</p>
                </article>
              </div>

              <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                <div class="space-y-6">
                  <section class="rounded-[1.75rem] border border-slate-200 bg-[#fffaf4] p-5 sm:p-6">
                    <div class="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <p class="vendor-stat-label">Order Items</p>
                        <h2 class="vendor-panel-title mt-2">Purchased products</h2>
                      </div>
                      <p class="text-sm font-medium text-slate-500">{{ visibleItems.length }} item{{ visibleItems.length === 1 ? '' : 's' }}</p>
                    </div>

                    <div *ngIf="visibleItems.length === 0" class="py-8 text-sm font-semibold text-slate-500">
                      No order items are attached to this order.
                    </div>

                    <div *ngIf="visibleItems.length" class="mt-5 space-y-4">
                      <article
                        *ngFor="let item of visibleItems; trackBy: trackByItem"
                        class="rounded-[1.4rem] border border-slate-200 bg-white/90 px-5 py-4"
                      >
                        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div class="min-w-0">
                            <p class="text-lg font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                            <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                            </p>
                          </div>

                          <div class="flex flex-wrap items-center gap-2">
                            <span class="rounded-full bg-[#fffaf4] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                              {{ formatCurrency(itemTotal(item)) }}
                            </span>
                            <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]" [ngClass]="statusClass(item.orderItemStatus)">
                              {{ item.orderItemStatus || 'Processing' }}
                            </span>
                          </div>
                        </div>
                      </article>
                    </div>
                  </section>

                  <section class="rounded-[1.75rem] border border-slate-200 bg-[#2f1b14] p-5 text-white sm:p-6">
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Vendor Summary</p>
                    <div class="mt-5 grid gap-3 sm:grid-cols-3">
                      <div class="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Visible Items</p>
                        <p class="mt-2 text-lg font-black text-white">{{ formatCurrency(displayItemsPrice) }}</p>
                      </div>
                      <div class="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Payment</p>
                        <p class="mt-2 text-lg font-black text-white">{{ order.paymentInfo?.status || 'Pending' }}</p>
                      </div>
                      <div class="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Method</p>
                        <p class="mt-2 text-lg font-black text-white">{{ order.paymentInfo?.method || 'Payment' }}</p>
                      </div>
                    </div>
                    <div class="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <span class="text-sm font-bold text-slate-300">Vendor Total</span>
                      <span class="text-2xl font-black">{{ formatCurrency(displayTotal) }}</span>
                    </div>
                  </section>
                </div>

                <div class="space-y-6">
                  <section class="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6">
                    <div class="flex flex-col gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <p class="vendor-stat-label">Delivery</p>
                        <h2 class="vendor-panel-title mt-2">Shipping address</h2>
                      </div>
                      <span class="w-fit rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" [ngClass]="order.shippingAddress ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                        {{ order.shippingAddress ? 'Address available' : 'No shipping address' }}
                      </span>
                    </div>

                    <div *ngIf="order.shippingAddress; else vendorNoShipping" class="mt-5 grid gap-4 sm:grid-cols-2">
                      <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4 sm:col-span-2">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Address</p>
                        <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress.address || 'Not provided' }}</p>
                      </div>
                      <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">City</p>
                        <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress.city || 'Not provided' }}</p>
                      </div>
                      <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Pincode</p>
                        <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress.pincode || 'Not provided' }}</p>
                      </div>
                      <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4 sm:col-span-2">
                        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Phone</p>
                        <p class="mt-2 text-sm font-black text-slate-900">{{ order.shippingAddress.phone || 'Not provided' }}</p>
                      </div>
                    </div>

                    <ng-template #vendorNoShipping>
                      <p class="mt-5 text-sm font-medium leading-7 text-slate-500">
                        Shipping address has not been attached to this order yet.
                      </p>
                    </ng-template>
                  </section>

                  <section class="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6">
                    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <p class="vendor-stat-label">Tracking</p>
                        <h2 class="vendor-panel-title mt-2">Shipment progress</h2>
                      </div>
                      <div class="flex items-center gap-2">
                        <span *ngIf="shipment?.isTestMode" class="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-800">
                          Test Mode
                        </span>
                        <button
                          *ngIf="canRefreshShipment()"
                          type="button"
                          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-800 transition hover:bg-amber-100"
                          (click)="refreshShipment()"
                        >
                          Refresh Tracking
                        </button>
                      </div>
                    </div>

                    <div *ngIf="shipment; else vendorNoShipment" class="mt-5 space-y-4">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4">
                          <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Courier</p>
                          <p class="mt-2 text-base font-black text-slate-900">{{ shipment.courierName || 'DHL' }}</p>
                        </div>
                        <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4">
                          <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Tracking Number</p>
                          <p class="mt-2 break-all text-base font-black text-slate-900">{{ shipment.trackingNumber || 'Not assigned yet' }}</p>
                        </div>
                      </div>

                      <div class="rounded-[1.4rem] border border-slate-200 bg-[#fffaf4] p-4">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Shipment Status</p>
                            <p class="mt-2 text-lg font-black text-slate-900">{{ shipment.shipmentStatus || 'Created' }}</p>
                          </div>
                          <span class="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(shipment.shipmentStatus)">
                            {{ shipment.shipmentStatus || 'Created' }}
                          </span>
                        </div>
                        <div class="mt-4 text-sm font-medium leading-7 text-slate-600">
                          <p *ngIf="shipment.estimatedDeliveryDate">Estimated delivery: {{ formatDate(shipment.estimatedDeliveryDate) }}</p>
                          <p *ngIf="shipment.lastSyncedAt">Last synced: {{ formatDateTime(shipment.lastSyncedAt) }}</p>
                        </div>
                      </div>

                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Timeline</p>
                          <p class="text-xs font-semibold text-slate-500">{{ shipment.trackingEvents?.length || 0 }} updates</p>
                        </div>

                        <div *ngIf="shipment.trackingEvents?.length; else vendorNoEvents" class="space-y-3">
                          <article
                            *ngFor="let event of shipment.trackingEvents; trackBy: trackByEvent"
                            class="rounded-[1.2rem] border border-slate-200 bg-white p-4"
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
                            <p *ngIf="event.location" class="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                              {{ event.location }}
                            </p>
                          </article>
                        </div>
                      </div>
                    </div>

                    <ng-template #vendorNoShipment>
                      <div class="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-[#fffaf4] p-5">
                        <p class="text-sm font-semibold text-slate-600">
                          Shipment details will appear here after payment verification creates a tracking record.
                        </p>
                      </div>
                    </ng-template>

                    <ng-template #vendorNoEvents>
                      <div class="rounded-[1.5rem] border border-dashed border-slate-200 bg-[#fffaf4] p-5">
                        <p class="text-sm font-semibold text-slate-600">No tracking events recorded yet.</p>
                      </div>
                    </ng-template>
                  </section>
                </div>
              </div>
            </section>
          </ng-container>

          <ng-template #customerOrderLayout>
            <div class="px-4 pb-6 sm:px-5 lg:px-6">
              <section class="overflow-hidden rounded-[2.25rem] border border-[#e7dac9] bg-white shadow-[0_18px_50px_rgba(111,78,55,0.06)]">
                <div class="border-b border-[#f1e4d4] px-6 py-6 sm:px-7">
                  <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div class="min-w-0">
                      <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Order Overview</p>
                      <h2 class="mt-2 text-2xl font-medium text-slate-900">Order #{{ shortOrderId(order._id) }}</h2>
                      <p class="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                        Review the status, shipment progress, items, address, and payment in one unified card.
                      </p>
                    </div>

                    <div class="flex flex-wrap gap-3">
                      <a [routerLink]="backLink" class="btn-secondary !px-5 !py-3">Back To Orders</a>
                      <a *ngIf="order._id as orderId" [routerLink]="trackOrderLink(orderId)" class="btn-primary !px-5 !py-3">
                        Track Order
                      </a>
                      <button
                        *ngIf="canCancel()"
                        type="button"
                        class="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                        (click)="cancelOrder()"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid gap-6 px-6 py-6 sm:px-7 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <div class="space-y-6">
                    <section class="rounded-[1.75rem] border border-[#e7dac9] bg-[#fffaf4] p-5 sm:p-6">
                      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#f1e4d4] pb-4">
                        <div>
                          <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Status</p>
                          <h3 class="mt-2 text-2xl font-medium text-slate-900">Order progress</h3>
                        </div>
                        <span class="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.18em]" [ngClass]="statusClass(displayStatus)">
                          {{ displayStatus }}
                        </span>
                      </div>

                      <div class="mt-5 grid gap-4 md:grid-cols-2">
                        <div class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5">
                          <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Placed On</p>
                          <p class="mt-3 text-base font-medium text-slate-900">{{ formatDate(order.createdAt) }}</p>
                        </div>

                        <div class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5">
                          <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Payment</p>
                          <p class="mt-3 text-base font-medium text-slate-900">
                            {{ isVendorView() ? 'Handled by marketplace' : (order.paymentInfo?.status || 'Pending') }}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section class="rounded-[1.75rem] border border-[#e7dac9] bg-[#fffaf4] p-5 sm:p-6">
                      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e4d4] pb-4">
                        <div>
                          <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Tracking</p>
                          <h3 class="mt-2 text-2xl font-medium text-slate-900">Shipment progress</h3>
                        </div>
                        <div class="flex items-center gap-2">
                          <span *ngIf="shipment?.isTestMode" class="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-800">
                            Test Mode
                          </span>
                          <button
                            *ngIf="canRefreshShipment()"
                            type="button"
                            class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-amber-800 transition hover:bg-amber-100"
                            (click)="refreshShipment()"
                          >
                            Refresh Tracking
                          </button>
                        </div>
                      </div>

                      <div *ngIf="shipment; else noShipment" class="mt-5 space-y-4">
                        <div class="grid gap-4 md:grid-cols-2">
                          <div class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5">
                            <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Courier</p>
                            <p class="mt-3 text-base font-medium text-slate-900">{{ shipment.courierName || 'DHL' }}</p>
                          </div>
                          <div class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5">
                            <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Tracking Number</p>
                            <p class="mt-3 break-all text-base font-medium text-slate-900">{{ shipment.trackingNumber || 'Not assigned yet' }}</p>
                          </div>
                        </div>

                        <div class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5">
                          <div class="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Shipment Status</p>
                              <p class="mt-2 text-lg font-medium text-slate-900">{{ shipment.shipmentStatus || 'Created' }}</p>
                            </div>
                            <span class="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.18em]" [ngClass]="statusClass(shipment.shipmentStatus)">
                              {{ shipment.shipmentStatus || 'Created' }}
                            </span>
                          </div>
                          <div class="mt-4 text-sm font-medium leading-7 text-slate-600">
                            <p *ngIf="shipment.estimatedDeliveryDate">Estimated delivery: {{ formatDate(shipment.estimatedDeliveryDate) }}</p>
                            <p *ngIf="shipment.lastSyncedAt">Last synced: {{ formatDateTime(shipment.lastSyncedAt) }}</p>
                          </div>
                        </div>

                        <div class="space-y-3">
                          <div class="flex items-center justify-between">
                            <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Timeline</p>
                            <p class="text-xs font-semibold text-slate-500">{{ shipment.trackingEvents?.length || 0 }} updates</p>
                          </div>

                          <div *ngIf="shipment.trackingEvents?.length; else noEvents" class="space-y-3">
                            <article
                              *ngFor="let event of shipment.trackingEvents; trackBy: trackByEvent"
                              class="rounded-[1.2rem] border border-[#e7dac9] bg-white p-4"
                            >
                              <div class="flex items-start justify-between gap-4">
                                <div>
                                  <p class="text-sm font-medium text-slate-900">{{ event.status }}</p>
                                  <p class="mt-1 text-sm font-medium text-slate-600">{{ event.description || 'Tracking update' }}</p>
                                </div>
                                <p class="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  {{ formatDateTime(event.eventTime) }}
                                </p>
                              </div>
                              <p *ngIf="event.location" class="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-amber-700">
                                {{ event.location }}
                              </p>
                            </article>
                          </div>
                        </div>
                      </div>

                      <ng-template #noShipment>
                        <div class="mt-5 rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-white p-5">
                          <p class="text-sm font-semibold text-slate-600">
                            Shipment details will appear here after payment verification creates a tracking record.
                          </p>
                        </div>
                      </ng-template>

                      <ng-template #noEvents>
                        <div class="rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-white p-5">
                          <p class="text-sm font-semibold text-slate-600">No tracking events recorded yet.</p>
                        </div>
                      </ng-template>
                    </section>

                    <section class="rounded-[1.75rem] border border-[#e7dac9] bg-[#fffaf4] p-5 sm:p-6">
                      <div class="border-b border-[#f1e4d4] pb-4">
                        <p class="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Items</p>
                        <h3 class="mt-2 text-2xl font-black text-slate-900">Purchased products</h3>
                      </div>

                      <div class="mt-5 space-y-4">
                        <article
                          *ngFor="let item of visibleItems; trackBy: trackByItem"
                          class="rounded-[1.5rem] border border-[#e7dac9] bg-white p-5"
                        >
                          <div class="flex items-start justify-between gap-4">
                            <div>
                              <p class="text-lg font-black text-slate-900">{{ item.name || 'Order item' }}</p>
                              <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                {{ item.sku || 'Variant' }} • Qty {{ item.quantity || 0 }}
                              </p>
                            </div>
                            <div class="text-right">
                              <p class="text-base font-black text-slate-900">{{ formatCurrency(itemTotal(item)) }}</p>
                              <p class="mt-2 text-xs font-black uppercase tracking-[0.18em]" [ngClass]="statusClass(item.orderItemStatus)">
                                {{ item.orderItemStatus || 'Processing' }}
                              </p>
                            </div>
                          </div>
                        </article>
                      </div>
                    </section>
                  </div>

                  <aside class="space-y-6">
                    <section class="rounded-[1.75rem] border border-[#e7dac9] bg-white p-6">
                      <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">Delivery</p>
                      <h3 class="mt-2 text-2xl font-medium text-slate-900">Shipping address</h3>
                      <p class="mt-4 text-sm font-medium leading-7 text-slate-600">
                        {{ order.shippingAddress?.address || 'Address unavailable' }}
                      </p>
                      <p class="mt-2 text-sm font-semibold text-slate-700">
                        {{ order.shippingAddress?.city || '-' }}, {{ order.shippingAddress?.pincode || '-' }}
                      </p>
                      <p class="mt-2 text-sm font-semibold text-slate-700">{{ order.shippingAddress?.phone || '-' }}</p>
                    </section>

                    <section class="rounded-[1.75rem] border border-[#e7dac9] bg-[#2f1b14] p-6 text-white shadow-[0_18px_50px_rgba(111,78,55,0.16)]">
                      <p class="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                        {{ isVendorView() ? 'Vendor Summary' : 'Bill Summary' }}
                      </p>
                      <div class="mt-6 space-y-3 text-sm font-medium text-slate-300">
                        <div class="flex items-center justify-between">
                          <span>{{ isVendorView() ? 'Visible Items' : 'Items' }}</span>
                          <span>{{ formatCurrency(displayItemsPrice) }}</span>
                        </div>
                        <div *ngIf="!isVendorView()" class="flex items-center justify-between">
                          <span>Shipping</span>
                          <span>{{ formatCurrency(order.shippingPrice || 0) }}</span>
                        </div>
                      </div>

                      <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                        <span class="text-sm font-bold text-slate-300">{{ isVendorView() ? 'Vendor Total' : 'Total' }}</span>
                        <span class="text-2xl font-black">{{ formatCurrency(displayTotal) }}</span>
                      </div>
                    </section>
                  </aside>
                </div>
              </section>
            </div>
          </ng-template>
        </div>
      </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order: OrderRecord | null = null;
  shipment: ShipmentRecord | null = null;
  isLoading = false;
  successMessage = '';
  currentRoles: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
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

    this.loadOrder();
  }

  get backLink(): string {
    return this.isVendorView() ? '/vendor/orders' : '/orders';
  }

  trackOrderLink(orderId?: string): string | string[] {
    if (!orderId) {
      return this.isVendorView() ? '/vendor/orders' : '/orders';
    }

    return this.isVendorView() ? ['/vendor/orders', orderId, 'tracking'] : ['/track-order', orderId];
  }

  get visibleItems(): OrderItemRecord[] {
    return this.order?.orderItems || [];
  }

  get displayStatus(): OrderStatus {
    if (!this.isVendorView()) {
      return this.order?.orderStatus || 'Processing';
    }

    const statuses = this.visibleItems.map((item) => item.orderItemStatus || 'Processing');

    if (!statuses.length) {
      return 'Processing';
    }

    if (statuses.every((status) => status === 'Cancelled')) {
      return 'Cancelled';
    }

    if (statuses.every((status) => status === 'Delivered')) {
      return 'Delivered';
    }

    if (statuses.every((status) => status === 'Shipped' || status === 'Delivered')) {
      return 'Shipped';
    }

    return 'Processing';
  }

  get displayItemsPrice(): number {
    if (!this.isVendorView()) {
      return this.order?.itemsPrice || 0;
    }

    return this.visibleItems.reduce((sum, item) => sum + this.itemTotal(item), 0);
  }

  get displayTotal(): number {
    return this.displayItemsPrice + (this.isVendorView() ? 0 : (this.order?.shippingPrice || 0));
  }

  loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      this.errorService.showToast('Order id is missing.', 'error');
      return;
    }

    this.isLoading = true;

    this.orderService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.order = order;
        this.shipment = order?.shipment || null;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  refreshShipment(): void {
    if (!this.order?._id) {
      return;
    }

    this.orderService.syncShipmentStatus(this.order._id).subscribe({
      next: (shipment) => {
        this.shipment = shipment;
        if (this.order) {
          this.order = {
            ...this.order,
            shipment
          };
        }
        this.successMessage = 'Tracking updated successfully.';
      },
      error: () => {}
    });
  }

  cancelOrder(): void {
    if (!this.order?._id) {
      return;
    }

    const confirmed = window.confirm(`Cancel order #${this.shortOrderId(this.order._id)}?`);
    if (!confirmed) {
      return;
    }

    this.orderService.cancelOrder(this.order._id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Order cancelled successfully.';
        this.loadOrder();
      },
      error: () => {}
    });
  }

  canCancel(): boolean {
    return !this.isVendorView() && this.order?.orderStatus === 'Processing';
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-amber-100 text-amber-800';
      case 'Shipped':
        return 'bg-amber-100 text-amber-800';
      case 'Out for Delivery':
      case 'In Transit':
      case 'Picked Up':
      case 'Created':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
      case 'Exception':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  trackByItem(index: number, item: any): string {
    return item.variantId || item.product || String(index);
  }

  trackByEvent(index: number, event: ShipmentEventRecord): string {
    return `${event.status}-${event.eventTime || index}`;
  }

  itemTotal(item: OrderItemRecord): number {
    return Number(item.price || 0) * Number(item.quantity || 0);
  }

  isVendorView(): boolean {
    return this.router.url.startsWith('/vendor/') || this.currentRoles.includes('vendor') || this.currentRoles.includes('admin');
  }

  canRefreshShipment(): boolean {
    return this.currentRoles.includes('admin');
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

