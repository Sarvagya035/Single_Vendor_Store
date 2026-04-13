import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorDetailsForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-[#2f1b14]/45 px-4">
      <div class="glass-card w-full max-w-2xl p-8 shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-[#f1e4d4] pb-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.28em] text-amber-700">Edit Store Details</p>
            <h3 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Update Vendor Information</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary !px-4 !py-2 text-xs">
            Close
          </button>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="submit.emit()">
          <div class="space-y-2">
            <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Business Address</label>
            <input
              type="text"
              name="vendorAddress"
              [ngModel]="form.vendorAddress"
              (ngModelChange)="updateField('vendorAddress', $event)"
              class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              placeholder="Your store address"
            >
          </div>

          <div class="space-y-2">
            <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand Description</label>
            <textarea
              rows="5"
              name="vendorDescription"
              [ngModel]="form.vendorDescription"
              (ngModelChange)="updateField('vendorDescription', $event)"
              class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              placeholder="Describe your store and what makes it special"
            ></textarea>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" [disabled]="isSaving" class="btn-primary !px-8 !py-4">
              {{ isSaving ? 'Saving Changes...' : 'Update Store Details' }}
            </button>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Changes sync directly with your vendor profile
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VendorDetailsModalComponent {
  @Input() open = false;
  @Input({ required: true }) form!: VendorDetailsForm;
  @Input() isSaving = false;
  @Output() formChange = new EventEmitter<VendorDetailsForm>();
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  updateField(field: keyof VendorDetailsForm, value: string) {
    this.formChange.emit({ ...this.form, [field]: value });
  }
}

