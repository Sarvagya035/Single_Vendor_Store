import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerProfileForm } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-surface space-y-8 p-10">
      <h3 class="border-b border-[#f1e4d4] pb-4 text-lg text-xs font-black uppercase tracking-widest text-slate-900">Account Details</h3>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-2">
          <label for="username" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Full Name</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-amber-700">👤</div>
            <input
              type="text"
              id="username"
              name="username"
              [ngModel]="user.username"
              (ngModelChange)="updateField('username', $event)"
              placeholder="e.g. John Wick"
              [class.ring-2]="!!usernameError"
              [class.ring-red-500]="!!usernameError"
              [class.focus:ring-red-500]="!!usernameError"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
            >
          </div>
          <p *ngIf="usernameError" class="ml-1 text-xs font-semibold text-red-500">
            {{ usernameError }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="phone" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Phone Number</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-amber-700">📞</div>
            <input
              type="text"
              id="phone"
              name="phone"
              inputmode="numeric"
              pattern="[0-9]{10}"
              maxlength="10"
              [ngModel]="user.phone"
              (ngModelChange)="updateField('phone', $event)"
              placeholder="Enter 10-digit number"
              [class.ring-2]="!!phoneError"
              [class.ring-red-500]="!!phoneError"
              [class.focus:ring-red-500]="!!phoneError"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
            >
          </div>
          <p *ngIf="phoneError" class="ml-1 text-xs font-semibold text-red-500">
            {{ phoneError }}
          </p>
        </div>

        <button type="submit" [disabled]="isSubmitting" class="btn-primary !w-full !py-4 text-lg">
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  `
})
export class CustomerAccountFormComponent {
  @Input({ required: true }) user!: CustomerProfileForm;
  @Input() isSubmitting = false;
  @Output() userChange = new EventEmitter<CustomerProfileForm>();
  @Output() submit = new EventEmitter<void>();
  usernameError = '';
  phoneError = '';

  updateField(field: keyof CustomerProfileForm, value: string) {
    this.userChange.emit({ ...this.user, [field]: value });

    if (field === 'username') {
      this.validateUsername(value);
    }

    if (field === 'phone') {
      this.validatePhone(value);
    }
  }

  onSubmit(): void {
    const usernameValid = this.validateUsername(this.user.username);
    const phoneValid = this.validatePhone(this.user.phone);

    if (!usernameValid || !phoneValid) {
      return;
    }

    this.submit.emit();
  }

  private validateUsername(value: string): boolean {
    const normalized = String(value || '').trim();
    if (!normalized) {
      this.usernameError = 'Name is required.';
      return false;
    }

    const alphabetOnlyName = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    this.usernameError = alphabetOnlyName.test(normalized)
      ? ''
      : 'Use letters only. Numbers and symbols are not allowed.';
    return !this.usernameError;
  }

  private validatePhone(value: string): boolean {
    const normalized = String(value || '').trim();
    if (!normalized) {
      this.phoneError = 'Phone number is required.';
      return false;
    }

    this.phoneError = /^\d{10}$/.test(normalized)
      ? ''
      : 'Enter a 10-digit phone number.';
    return !this.phoneError;
  }
}

