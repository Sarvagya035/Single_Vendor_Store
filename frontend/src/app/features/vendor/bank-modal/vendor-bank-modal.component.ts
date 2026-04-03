import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VendorBankDetailsForm } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-bank-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div
        #dialogRoot
        class="app-section w-full max-w-2xl p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        tabindex="-1"
      >
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Bank Details</p>
            <h3 [id]="titleId" class="mt-2 text-2xl font-black tracking-tight text-slate-900">Update Payout Information</h3>
          </div>
          <button type="button" (click)="close.emit()" class="btn-secondary !px-4 !py-2 text-xs" aria-label="Close payout details dialog">
            Close
          </button>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="submit.emit()">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2 md:col-span-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                [ngModel]="form.accountHolderName"
                (ngModelChange)="updateField('accountHolderName', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="Name as registered with the bank"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                [ngModel]="form.accountNumber"
                (ngModelChange)="updateField('accountNumber', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="Primary payout account"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                [ngModel]="form.ifscCode"
                (ngModelChange)="updateField('ifscCode', normalizeIfsc($event))"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold uppercase text-slate-900 shadow-inner transition-all focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="e.g. SBIN0000123"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Bank Name</label>
              <input
                type="text"
                name="bankName"
                [ngModel]="form.bankName"
                (ngModelChange)="updateField('bankName', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="Bank issuing payouts"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">UPI ID</label>
              <input
                type="text"
                name="upiId"
                [ngModel]="form.upiId"
                (ngModelChange)="updateField('upiId', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="Optional"
              >
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" [disabled]="isSaving" class="btn-primary !px-8 !py-4">
              {{ isSaving ? 'Saving Bank Details...' : 'Update Bank Details' }}
            </button>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Primary payout fields are required
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VendorBankModalComponent {
  @Input() open = false;
  @Input({ required: true }) form!: VendorBankDetailsForm;
  @Input() isSaving = false;
  @Output() formChange = new EventEmitter<VendorBankDetailsForm>();
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  readonly titleId = `vendor-bank-title-${Math.random().toString(36).slice(2, 9)}`;
  @ViewChild('dialogRoot') dialogRoot?: ElementRef<HTMLElement>;

  updateField(field: keyof VendorBankDetailsForm, value: string) {
    this.formChange.emit({ ...this.form, [field]: value });
  }

  normalizeIfsc(value: string): string {
    return String(value || '').toUpperCase();
  }

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
