import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerPasswordForm } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-password-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card space-y-8 p-10">
      <div class="border-b border-slate-100 pb-4">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Security</p>
        <h3 class="mt-2 text-lg text-xs font-black uppercase tracking-widest text-slate-900">Change Password</h3>
        <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
          Keep your account secure by updating your password whenever you feel it is needed.
        </p>
      </div>

      <form (ngSubmit)="submit.emit()" class="space-y-6">
        <div class="space-y-2">
          <label for="oldPassword" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Current Password</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔒</div>
            <input
              id="oldPassword"
              name="oldPassword"
              [type]="showPasswords ? 'text' : 'password'"
              [ngModel]="passwordForm.oldPassword"
              (ngModelChange)="updateField('oldPassword', $event)"
              placeholder="Enter current password"
              autocomplete="current-password"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-indigo-500"
            >
          </div>
        </div>

        <div class="space-y-2">
          <label for="newPassword" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">New Password</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">✨</div>
            <input
              id="newPassword"
              name="newPassword"
              [type]="showPasswords ? 'text' : 'password'"
              [ngModel]="passwordForm.newPassword"
              (ngModelChange)="updateField('newPassword', $event)"
              placeholder="Create a new password"
              autocomplete="new-password"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-indigo-500"
            >
          </div>
        </div>

        <div class="space-y-2">
          <label for="confirmPassword" class="ml-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Confirm New Password</label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">✅</div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              [type]="showPasswords ? 'text' : 'password'"
              [ngModel]="passwordForm.confirmPassword"
              (ngModelChange)="updateField('confirmPassword', $event)"
              placeholder="Repeat the new password"
              autocomplete="new-password"
              class="block w-full rounded-xl border-none bg-slate-50 py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-indigo-500"
            >
          </div>
        </div>

        <div class="flex items-center justify-between gap-4">
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" [ngModel]="showPasswords" (ngModelChange)="showPasswords = $event" [ngModelOptions]="{ standalone: true }" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
            Show passwords
          </label>
          <p class="text-xs font-semibold text-slate-400">Use 8+ characters for a stronger password.</p>
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
          {{ isSubmitting ? 'Updating...' : 'Change Password' }}
        </button>
      </form>
    </div>
  `
})
export class CustomerPasswordPanelComponent {
  @Input({ required: true }) passwordForm!: CustomerPasswordForm;
  @Input() message = '';
  @Input() isSuccess = false;
  @Input() isSubmitting = false;
  @Output() passwordFormChange = new EventEmitter<CustomerPasswordForm>();
  @Output() submit = new EventEmitter<void>();

  showPasswords = false;

  updateField(field: keyof CustomerPasswordForm, value: string): void {
    this.passwordFormChange.emit({ ...this.passwordForm, [field]: value });
  }
}
