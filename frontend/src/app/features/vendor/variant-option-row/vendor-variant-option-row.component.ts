import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorProductOptionForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-variant-option-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 sm:grid-cols-2 md:grid-cols-[0.8fr_1.2fr_auto] md:items-end">
      <div class="space-y-2">
        <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Option Name</label>
        <input
          type="text"
          [(ngModel)]="option.name"
          [name]="'option-name-' + index"
          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
          placeholder="Color"
        >
      </div>

      <div class="space-y-2">
        <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Values</label>
        <input
          type="text"
          [(ngModel)]="option.valuesText"
          [name]="'option-values-' + index"
          class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
          placeholder="Red, Blue, Black"
        >
      </div>

      <button type="button" (click)="remove.emit(index)" class="btn-secondary !border-rose-100 !text-rose-600 hover:!bg-rose-50">
        Remove
      </button>
    </div>
  `
})
export class VendorVariantOptionRowComponent {
  @Input({ required: true }) option!: VendorProductOptionForm;
  @Input() index = 0;

  @Output() remove = new EventEmitter<number>();
}

