import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorProductsPanelComponent } from '../products-panel/vendor-products-panel.component';
import { VendorProductRecord } from '../../../core/models/vendor.models';

interface VendorProductsPagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

@Component({
  selector: 'app-vendor-products-page',
  standalone: true,
  imports: [CommonModule, VendorProductsPanelComponent],
  template: `
    <section class="space-y-6">
      <app-vendor-products-panel
        [products]="products"
        [isLoading]="isProductsLoading"
        (refreshRequested)="loadVendorProducts(currentPage)"
      />

      <div
        *ngIf="!isProductsLoading && totalPages > 1"
        class="glass-card flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <div class="text-sm font-semibold text-slate-600">
          Showing
          <span class="font-black text-slate-900">{{ products.length }}</span>
          of
          <span class="font-black text-slate-900">{{ totalDocs }}</span>
          products
          <span class="text-slate-400">|</span>
          Page
          <span class="font-black text-slate-900">{{ currentPage }}</span>
          of
          <span class="font-black text-slate-900">{{ totalPages }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="loadVendorProducts(currentPage - 1)"
            [disabled]="!hasPrevPage || isProductsLoading"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            *ngFor="let page of visiblePages; trackBy: trackByPage"
            type="button"
            (click)="loadVendorProducts(page)"
            [disabled]="isProductsLoading"
            class="rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-50"
            [ngClass]="
              page === currentPage
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            "
          >
            {{ page }}
          </button>

          <button
            type="button"
            (click)="loadVendorProducts(currentPage + 1)"
            [disabled]="!hasNextPage || isProductsLoading"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  `
})
export class VendorProductsPageComponent implements OnInit {
  products: VendorProductRecord[] = [];
  isProductsLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalDocs = 0;
  hasPrevPage = false;
  hasNextPage = false;
  limit = 10;
  visiblePages: number[] = [];

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.loadVendorProducts(1);
  }

  loadVendorProducts(page = this.currentPage) {
    this.isProductsLoading = true;
    const normalizedPage = Math.max(1, page);

    this.vendorService.getMyProducts(normalizedPage, this.limit).subscribe({
      next: (res) => {
        this.isProductsLoading = false;
        this.products = res?.data?.docs || [];
        this.currentPage = Number(res?.data?.page || normalizedPage);
        this.totalPages = Number(res?.data?.totalPages || 1);
        this.totalDocs = Number(res?.data?.totalDocs || this.products.length);
        this.hasPrevPage = Boolean(res?.data?.hasPrevPage);
        this.hasNextPage = Boolean(res?.data?.hasNextPage);
        this.visiblePages = this.buildVisiblePages(this.currentPage, this.totalPages);
      },
      error: () => {
        this.isProductsLoading = false;
        this.products = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalDocs = 0;
        this.hasPrevPage = false;
        this.hasNextPage = false;
        this.visiblePages = [];
      }
    });
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  private buildVisiblePages(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 1) {
      return [1];
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    pages.add(currentPage);
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }
}
