import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 blur-[120px] rounded-full animate-float"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 blur-[120px] rounded-full animate-float" style="animation-delay: 2s"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Reset Password</h2>
        <p class="text-slate-500 font-medium tracking-wide">Create a new password for your account</p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="glass-card p-10">
          <div *ngIf="!token" class="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Reset link is missing or invalid. Please request a new one.
          </div>

          <form class="space-y-8" (ngSubmit)="onSubmit()" *ngIf="token">
            <div class="space-y-2">
              <label for="newPassword" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">New Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  🔑
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="newPassword"
                  placeholder="Enter a new password"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-16 text-slate-900 font-bold focus:ring-2 focus:ring-amber-600 transition-all shadow-inner"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Confirm Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  🔒
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="confirmPassword"
                  placeholder="Confirm your new password"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-16 text-slate-900 font-bold focus:ring-2 focus:ring-amber-600 transition-all shadow-inner"
                >
                <button
                  type="button"
                  (click)="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                >
                  {{ showConfirmPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-4 text-lg">
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-sm font-medium text-slate-500">
              <a routerLink="/login" class="text-amber-700 font-black hover:text-amber-800 transition-colors uppercase tracking-tighter">Back to Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit(): void {
    if (!this.token) {
      this.errorService.showToast('Reset link is missing or invalid.', 'error');
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.errorService.showToast('Please enter and confirm your new password.', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorService.showToast('Passwords do not match.', 'error');
      return;
    }

    this.isLoading = true;

    this.authService
      .resetPassword({ token: this.token, newPassword: this.newPassword })
      .pipe(
        catchError((error) => {
          this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((res) => {
        if (res?.success) {
          this.errorService.showToast(res.message || 'Password reset successfully.', 'success');
          this.router.navigate(['/login']);
        }
      });
  }
}

