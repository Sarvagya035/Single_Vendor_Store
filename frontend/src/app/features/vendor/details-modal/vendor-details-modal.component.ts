import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorDetailsForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#2f1b14]/45 px-3 py-3 sm:px-4 sm:py-4 sm:items-center">
      <div class="glass-card my-auto w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto p-5 shadow-2xl sm:p-8">
        <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="vendor-stat-label !text-amber-700">Edit Store Details</p>
            <h3 class="vendor-panel-title">Update Vendor Information</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary w-full !px-4 !py-2 text-xs sm:w-auto">
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
            <button type="submit" [disabled]="isSaving" class="btn-primary w-full !px-8 !py-4 sm:w-auto">
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

