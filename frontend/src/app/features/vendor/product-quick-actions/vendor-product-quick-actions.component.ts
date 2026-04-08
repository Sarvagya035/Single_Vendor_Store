import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorProductRecord } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-product-quick-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div class="border-b border-slate-100 pb-4">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Quick Actions</p>
        <h3 class="mt-2 text-xl font-black text-slate-900">Status and removal</h3>
      </div>
      <div class="mt-5 space-y-4">
        <button
          type="button"
          (click)="toggleStatus.emit()"
          [disabled]="statusBusy"
          class="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>
            <span class="block text-sm font-black text-slate-900">Product visibility</span>
            <span class="mt-1 block text-xs font-medium text-slate-500">
              {{ product.isActive ? 'Currently active and visible.' : 'Currently inactive and hidden.' }}
            </span>
          </span>

          <span class="flex items-center gap-3">
            <span
              class="text-xs font-black uppercase tracking-[0.18em]"
              [ngClass]="product.isActive ? 'text-amber-700' : 'text-slate-500'"
            >
              {{ statusBusy ? 'Updating...' : product.isActive ? 'Active' : 'Inactive' }}
            </span>
            <span
              class="relative inline-flex h-8 w-14 items-center rounded-full transition"
              [ngClass]="product.isActive ? 'bg-amber-600' : 'bg-slate-300'"
            >
              <span
                class="inline-block h-6 w-6 rounded-full bg-white shadow transition-transform"
                [ngClass]="product.isActive ? 'translate-x-7' : 'translate-x-1'"
              ></span>
            </span>
          </span>
        </button>

        <button
          type="button"
          (click)="delete.emit()"
          [disabled]="deleteBusy"
          class="flex w-full items-center justify-between rounded-3xl border border-rose-100 bg-rose-50 px-5 py-4 text-left transition hover:bg-rose-100"
        >
          <span>
            <span class="block text-sm font-black text-rose-700">Delete product</span>
            <span class="mt-1 block text-xs font-medium text-rose-500">Removes the whole product and its variants.</span>
          </span>
          <span class="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
            {{ deleteBusy ? 'Deleting...' : 'Delete' }}
          </span>
        </button>
      </div>
    </section>
  `
})
export class VendorProductQuickActionsComponent {
  @Input({ required: true }) product!: VendorProductRecord;
  @Input() statusBusy = false;
  @Input() deleteBusy = false;

  @Output() toggleStatus = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}

