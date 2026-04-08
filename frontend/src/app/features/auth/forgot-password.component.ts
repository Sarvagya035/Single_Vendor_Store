import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 blur-[120px] rounded-full animate-float"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 blur-[120px] rounded-full animate-float" style="animation-delay: 2s"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
        <p class="text-slate-500 font-medium tracking-wide">We’ll send a reset link to your email address</p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="glass-card p-10">
          <form class="space-y-8" (ngSubmit)="onSubmit()">
            <div class="space-y-2">
              <label for="email" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  📧
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  [(ngModel)]="email"
                  placeholder="Enter your email"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-600 transition-all shadow-inner"
                >
              </div>
            </div>

            <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-4 text-lg">
              {{ isLoading ? 'Sending Link...' : 'Send Reset Link' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-sm font-medium text-slate-500">
              Remember your password?
              <a routerLink="/login" class="text-amber-700 font-black hover:text-amber-800 transition-colors ml-1 uppercase tracking-tighter">Back to Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  onSubmit(): void {
    this.isLoading = true;

    this.authService
      .requestPasswordReset({ email: this.email.trim() })
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
          this.errorService.showToast(
            res.message || 'If your email exists, a reset link has been sent.',
            'success'
          );
          this.email = '';
        }
      });
  }
}

