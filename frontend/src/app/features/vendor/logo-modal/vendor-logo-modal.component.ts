import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-logo-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-4 sm:items-center">
      <div class="glass-card my-auto w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto p-5 shadow-2xl sm:p-8">
        <div class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="vendor-stat-label">Edit Store Logo</p>
            <h3 class="vendor-panel-title">Upload a New Brand Image</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary w-full !px-4 !py-2 text-xs sm:w-auto">
            Close
          </button>
        </div>

        <div class="mt-8 space-y-6">
          <div class="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
            <div class="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-amber-700 text-4xl font-black text-white shadow-xl shadow-amber-100">
              <img *ngIf="logoPreview || vendor?.vendorLogo" [src]="logoPreview || vendor?.vendorLogo" alt="Logo preview" class="h-full w-full object-cover">
              <span *ngIf="!logoPreview && !vendor?.vendorLogo">{{ vendor?.shopName?.charAt(0) }}</span>
            </div>
            <input id="vendor-logo-input" type="file" accept="image/*" class="hidden" (change)="selectLogo.emit($event)">
            <label for="vendor-logo-input" class="btn-secondary cursor-pointer w-full !py-4">
              {{ selectedLogoName ? 'Replace Selected Logo' : 'Choose New Logo' }}
            </label>
            <p class="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {{ selectedLogoName || 'PNG, JPG, or WEBP recommended' }}
            </p>
          </div>

          <button
            type="button"
            (click)="submit.emit()"
            [disabled]="!selectedLogoName || isUploading"
            class="btn-primary w-full !py-4"
          >
            {{ isUploading ? 'Uploading Logo...' : 'Update Store Logo' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class VendorLogoModalComponent {
  @Input() open = false;
  @Input() vendor: VendorProfile | null = null;
  @Input() logoPreview: string | null = null;
  @Input() selectedLogoName = '';
  @Input() isUploading = false;
  @Output() close = new EventEmitter<void>();
  @Output() selectLogo = new EventEmitter<Event>();
  @Output() submit = new EventEmitter<void>();
}

