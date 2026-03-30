import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorMessageType, VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-logo-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div class="glass-card w-full max-w-xl p-8 shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Edit Store Logo</p>
            <h3 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Upload a New Brand Image</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary !px-4 !py-2 text-xs">
            Close
          </button>
        </div>

        <div class="mt-8 space-y-6">
          <div class="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
            <div class="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-emerald-600 text-4xl font-black text-white shadow-xl shadow-emerald-100">
              <img *ngIf="logoPreview || vendor?.vendorLogo" [src]="logoPreview || vendor?.vendorLogo" alt="Logo preview" class="h-full w-full object-cover">
              <span *ngIf="!logoPreview && !vendor?.vendorLogo">{{ vendor?.shopName?.charAt(0) }}</span>
            </div>
            <input id="vendor-logo-input" type="file" accept="image/*" class="hidden" (change)="selectLogo.emit($event)">
            <label for="vendor-logo-input" class="btn-secondary cursor-pointer !w-full !py-4">
              {{ selectedLogoName ? 'Replace Selected Logo' : 'Choose New Logo' }}
            </label>
            <p class="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {{ selectedLogoName || 'PNG, JPG, or WEBP recommended' }}
            </p>
          </div>

          <div *ngIf="message" class="rounded-2xl border p-4 text-sm font-bold" [ngClass]="messageClass()">
            {{ message }}
          </div>

          <button
            type="button"
            (click)="submit.emit()"
            [disabled]="!selectedLogoName || isUploading"
            class="btn-primary !w-full !py-4"
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
  @Input() message = '';
  @Input() messageType: VendorMessageType = 'success';
  @Output() close = new EventEmitter<void>();
  @Output() selectLogo = new EventEmitter<Event>();
  @Output() submit = new EventEmitter<void>();

  messageClass(): string {
    return this.messageType === 'success'
      ? 'border-emerald-100 bg-emerald-50/80 text-emerald-700'
      : 'border-rose-100 bg-rose-50/80 text-rose-700';
  }
}
