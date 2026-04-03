import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-logo-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div
        #dialogRoot
        class="app-section w-full max-w-xl p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        tabindex="-1"
      >
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Edit Store Logo</p>
            <h3 [id]="titleId" class="mt-2 text-2xl font-black tracking-tight text-slate-900">Upload a New Brand Image</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary !px-4 !py-2 text-xs" aria-label="Close logo dialog">
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
  @Output() close = new EventEmitter<void>();
  @Output() selectLogo = new EventEmitter<Event>();
  @Output() submit = new EventEmitter<void>();
  readonly titleId = `vendor-logo-title-${Math.random().toString(36).slice(2, 9)}`;
  @ViewChild('dialogRoot') dialogRoot?: ElementRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      window.setTimeout(() => this.focusFirstElement());
    }
  }

  @HostListener('keydown', ['$event'])
  handleTabTrap(event: KeyboardEvent): void {
    if (!this.open || event.key !== 'Tab') {
      return;
    }

    const focusables = this.getFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      this.dialogRoot?.nativeElement.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }

  private focusFirstElement(): void {
    const focusables = this.getFocusableElements();
    (focusables[0] || this.dialogRoot?.nativeElement)?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const root = this.dialogRoot?.nativeElement;
    if (!root) {
      return [];
    }

    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('aria-hidden'));
  }
}
