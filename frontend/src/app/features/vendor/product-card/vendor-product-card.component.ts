import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorProductRecord } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="overflow-visible rounded-[1.75rem] border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
      <div
        role="button"
        tabindex="0"
        (click)="open.emit()"
        (keydown.enter)="open.emit()"
        (keydown.space)="open.emit(); $event.preventDefault()"
        class="grid w-full gap-4 px-5 py-5 text-left lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto] lg:items-center"
      >
        <div class="flex items-center gap-4">
          <div class="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
            <img
              *ngIf="imageUrl"
              [src]="imageUrl"
              [alt]="product.productName"
              class="h-full w-full object-cover"
            />
            <div
              *ngIf="!imageUrl"
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-black text-white"
            >
              {{ product.productName.charAt(0) }}
            </div>
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-black text-slate-900">
              {{ product.productName }}
            </p>
          </div>
        </div>
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Created</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">{{ createdLabel }}</p>
        </div>
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Variants</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">{{ variantCount }}</p>
        </div>
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Stock</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">{{ stockLabel }}</p>
        </div>
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Start Price</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">{{ priceLabel }}</p>
        </div>
        <div>
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
            [ngClass]="product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
          >
            {{ product.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            (click)="$event.stopPropagation(); edit.emit()"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            (click)="$event.stopPropagation(); toggleStatus.emit()"
            [disabled]="statusBusy"
            class="rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-70"
            [ngClass]="
              product.isActive
                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            "
          >
            {{ statusBusy ? 'Updating...' : product.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          <button
            type="button"
            (click)="$event.stopPropagation(); delete.emit()"
            [disabled]="deleteBusy"
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {{ deleteBusy ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>

      <ng-content />
    </article>
  `
})
export class VendorProductCardComponent {
  @Input({ required: true }) product!: VendorProductRecord;
  @Input() imageUrl?: string;
  @Input() createdLabel = '';
  @Input() variantCount = 0;
  @Input() stockLabel = '';
  @Input() priceLabel = '';
  @Input() statusBusy = false;
  @Input() deleteBusy = false;

  @Output() open = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() toggleStatus = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
