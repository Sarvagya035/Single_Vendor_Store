import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorService } from '../../../core/services/error.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-customer-change-password-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        class="absolute inset-0 bg-[#2f1b14]/40 backdrop-blur-[2px]"
        (click)="closeModal()"
        aria-label="Close password dialog"
      ></button>

      <div class="relative z-[101] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#e7dac9] bg-white shadow-[0_30px_80px_rgba(111,78,55,0.2)]">
        <div class="border-b border-[#f1e4d4] bg-[linear-gradient(180deg,#fffaf5_0%,#fffdf9_100%)] app-card-body">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-700">Security</p>
              <h3 class="mt-2 text-2xl font-medium tracking-tight text-slate-900">Change Password</h3>
              <p class="mt-2 text-sm leading-7 text-slate-500">
                Update your account password to keep your profile secure.
              </p>
            </div>

            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-50"
              (click)="closeModal()"
            >
              Close
            </button>
          </div>
        </div>

        <div class="space-y-8 bg-[#fffdfa] app-card-body">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div class="space-y-2">
              <label for="oldPassword" class="ml-1 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                Current Password
              </label>
              <div class="relative">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  [(ngModel)]="oldPassword"
                  [type]="showOldPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter your current password"
                  class="block w-full rounded-2xl border border-slate-200 bg-[#fff7ed] px-4 py-4 pr-16 font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                  (click)="showOldPassword = !showOldPassword"
                >
                  {{ showOldPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label for="newPassword" class="ml-1 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                New Password
              </label>
              <div class="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  [(ngModel)]="newPassword"
                  [type]="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Enter your new password"
                  class="block w-full rounded-2xl border border-slate-200 bg-[#fff7ed] px-4 py-4 pr-16 font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                  (click)="showNewPassword = !showNewPassword"
                >
                  {{ showNewPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="ml-1 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                Confirm Password
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  [(ngModel)]="confirmPassword"
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Re-enter your new password"
                  class="block w-full rounded-2xl border border-slate-200 bg-[#fff7ed] px-4 py-4 pr-16 font-medium text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                  (click)="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-xs font-medium text-slate-500">
                Use at least 8 characters and keep it unique.
              </p>
              <div class="flex gap-3">
                <button type="button" class="btn-secondary !px-5 !py-3" (click)="closeModal()">Cancel</button>
                <button type="submit" [disabled]="isSubmitting" class="btn-primary !px-6 !py-3">
                  {{ isSubmitting ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CustomerChangePasswordPanelComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  constructor(
    private userService: UserService,
    private errorService: ErrorService
  ) {}

  onSubmit(): void {
    const currentPassword = this.oldPassword.trim();
    const nextPassword = this.newPassword.trim();
    const confirmPassword = this.confirmPassword.trim();

    if (!currentPassword || !nextPassword || !confirmPassword) {
      this.errorService.showToast('Current password, new password, and confirmation are required.', 'error');
      return;
    }

    if (nextPassword !== confirmPassword) {
      this.errorService.showToast('New password and confirmation do not match.', 'error');
      return;
    }

    this.isSubmitting = true;

    this.userService.changePassword({
      oldPassword: currentPassword,
      newPassword: nextPassword
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.success) {
          this.errorService.showToast(res?.message || 'Password updated successfully.', 'success');
          this.resetForm();
          this.closeModal();
          return;
        }

        this.errorService.showToast(res?.message || 'Unable to update password.', 'error');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorService.showToast(err?.error?.message || 'Unable to update password.', 'error');
      }
    });
  }

  private resetForm(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showOldPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  closeModal(): void {
    this.resetForm();
    this.closed.emit();
  }
}

