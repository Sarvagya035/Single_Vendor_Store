import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerProfileForm } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card space-y-8 p-10">
      <h3 class="border-b border-slate-100 pb-4 text-lg text-xs font-black uppercase tracking-widest text-slate-900">Account Details</h3>

      <form (ngSubmit)="submit.emit()" class="space-y-6">
        <div class="space-y-2">
          <label for="username" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Full Name</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">👤</div>
            <input
              type="text"
              id="username"
              name="username"
              [ngModel]="user.username"
              (ngModelChange)="updateField('username', $event)"
              placeholder="e.g. John Wick"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-indigo-500"
            >
          </div>
        </div>

        <div class="space-y-2">
          <label for="phone" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Phone Number</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">📞</div>
            <input
              type="text"
              id="phone"
              name="phone"
              [ngModel]="user.phone"
              (ngModelChange)="updateField('phone', $event)"
              placeholder="+1 (555) 000-0000"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-indigo-500"
            >
          </div>
        </div>

        <div
          *ngIf="message"
          [ngClass]="{ 'border-emerald-100 bg-emerald-50 text-emerald-700': isSuccess, 'border-rose-100 bg-rose-50 text-rose-700': !isSuccess }"
          class="flex items-center gap-2 rounded-xl border p-4 text-sm font-bold"
        >
          <span *ngIf="isSuccess">✅</span>
          <span *ngIf="!isSuccess">⚠️</span>
          {{ message }}
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
  @Input() message = '';
  @Input() isSuccess = false;
  @Input() isSubmitting = false;
  @Output() userChange = new EventEmitter<CustomerProfileForm>();
  @Output() submit = new EventEmitter<void>();

  updateField(field: keyof CustomerProfileForm, value: string) {
    this.userChange.emit({ ...this.user, [field]: value });
  }
}
