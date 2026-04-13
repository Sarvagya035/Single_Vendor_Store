import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorProductVariantForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-variant-editor-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Variant {{ index + 1 }}</p>
          <h3 class="mt-2 text-xl font-black text-slate-900">Variant details</h3>
        </div>
        <button type="button" (click)="remove.emit(index)" class="btn-secondary !border-rose-100 !text-rose-600 hover:!bg-rose-50">
          Remove Variant
        </button>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="space-y-2 md:col-span-2 xl:col-span-4">
          <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Attributes</label>
          <input
            type="text"
            [(ngModel)]="variant.attributesText"
            [name]="'variant-attributes-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            placeholder="Color:Black, Size:XL"
          >
        </div>

        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Price</label>
          <input
            type="number"
            [(ngModel)]="variant.productPrice"
            [name]="'variant-price-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            min="0"
          >
        </div>

        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Discount %</label>
          <input
            type="number"
            [(ngModel)]="variant.discountPercentage"
            [name]="'variant-discount-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            min="0"
            max="100"
          >
        </div>

        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Stock</label>
          <input
            type="number"
            [(ngModel)]="variant.productStock"
            [name]="'variant-stock-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            min="0"
          >
        </div>

        <div class="space-y-2">
          <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">SKU</label>
          <input
            type="text"
            [(ngModel)]="variant.sku"
            [name]="'variant-sku-' + index"
            class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            placeholder="Optional"
          >
        </div>

        <div class="space-y-2 md:col-span-2 xl:col-span-4">
          <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Variant Image</label>
          <input
            type="file"
            accept="image/*"
            class="block w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600"
            (change)="imageSelected.emit({ event: $event, index })"
          >
          <p class="text-xs font-semibold text-slate-500">{{ variant.imageFile?.name || 'Optional image for this variant' }}</p>
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
}

