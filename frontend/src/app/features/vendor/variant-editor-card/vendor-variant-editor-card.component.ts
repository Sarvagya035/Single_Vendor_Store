import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorProductVariantForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-variant-editor-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vendor-card-compact flex flex-col gap-4 !p-4 sm:!p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Variant {{ index + 1 }}</p>
          <h3 class="mt-1 text-lg font-black text-slate-900 sm:text-xl">Variant details</h3>
        </div>
        <button type="button" (click)="remove.emit(index)" class="btn-secondary w-full !border-rose-100 !text-rose-600 hover:!bg-rose-50 sm:w-auto">
          Remove Variant
        </button>
      </div>

      <div class="grid gap-3">
        <div class="grid gap-1.5">
          <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Attributes</label>
          <input
            type="text"
            [(ngModel)]="variant.attributesText"
            [name]="'variant-attributes-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            placeholder="Color:Black, Size:XL"
          >
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="grid gap-1.5">
            <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Price</label>
          <input
            type="number"
            [(ngModel)]="variant.productPrice"
            [name]="'variant-price-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            min="0"
          >
          </div>

          <div class="grid gap-1.5">
            <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Offer / Discount</label>
            <input
              type="number"
              [(ngModel)]="variant.discountPercentage"
              [name]="'variant-discount-' + index"
              class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              min="0"
              max="100"
            >
          </div>

          <div class="grid gap-1.5">
            <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Stock</label>
            <input
              type="number"
              [(ngModel)]="variant.productStock"
              [name]="'variant-stock-' + index"
              class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              min="0"
            >
          </div>

          <div class="grid gap-1.5">
            <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">SKU</label>
            <input
              type="text"
              [(ngModel)]="variant.sku"
              [name]="'variant-sku-' + index"
              class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              placeholder="Optional"
            >
          </div>
        </div>

        <div class="grid gap-1.5">
          <div class="flex items-center justify-between gap-3">
            <label class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Variant Image</label>
            <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{{ variant.imageFiles?.length || 0 }}/5</span>
          </div>
          <label
            [for]="'variant-images-' + index"
            class="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:text-slate-800"
          >
            <span class="truncate">{{ (variant.imageFiles?.length || 0) ? ((variant.imageFiles?.length || 0) + ' image' + ((variant.imageFiles?.length || 0) > 1 ? 's' : '') + ' selected') : 'Upload images' }}</span>
            <span class="ml-3 shrink-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Browse</span>
          </label>
          <div *ngIf="(variant.imagePreviews?.length || 0)" class="flex flex-wrap gap-2">
            <div
              *ngFor="let preview of variant.imagePreviews; let imageIndex = index"
              class="group relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            >
              <img [src]="preview" alt="Variant preview" class="h-full w-full object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-black text-rose-600 shadow-sm"
                (click)="removeImage.emit({ index, imageIndex })"
                aria-label="Remove selected variant image"
              >
                ×
              </button>
            </div>
          </div>
          <input
            [id]="'variant-images-' + index"
            type="file"
            accept="image/*"
            multiple
            class="sr-only"
            (change)="imageSelected.emit({ event: $event, index })"
          >
          <p class="text-xs font-semibold text-slate-500">Upload up to 5 images for each variant.</p>
        </div>
      </div>
    </div>
  `
})
export class VendorVariantEditorCardComponent {
  @Input({ required: true }) variant!: VendorProductVariantForm;
  @Input() index = 0;

  @Output() remove = new EventEmitter<number>();
  @Output() imageSelected = new EventEmitter<{ event: Event; index: number }>();
  @Output() removeImage = new EventEmitter<{ index: number; imageIndex: number }>();
}

