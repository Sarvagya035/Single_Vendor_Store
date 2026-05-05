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
    <div class="min-h-screen relative flex flex-col justify-center overflow-hidden bg-[linear-gradient(180deg,#fff9f2_0%,#f5e6d3_18%,#fff9f2_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div class="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#f5e6d3]/40 blur-[120px] animate-float"></div>
      <div class="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#d4a017]/20 blur-[120px] animate-float" style="animation-delay: 2s"></div>

      <div class="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <h2 class="text-4xl font-semibold tracking-tight text-slate-900">Forgot Password</h2>
        <p class="font-medium tracking-wide text-slate-500">We’ll send a reset link to your email address</p>
      </div>

      <div class="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="app-surface app-panel-body p-10">
          <form class="space-y-8" (ngSubmit)="onSubmit()">
            <div class="space-y-2">
              <label for="email" class="app-label">Email Address</label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-amber-700">📧</div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  [(ngModel)]="email"
                  placeholder="Enter your email"
                  class="app-field pl-12"
                >
              </div>
            </div>

            <button type="submit" [disabled]="isLoading" class="btn-primary w-full !py-4 text-lg">
              {{ isLoading ? 'Sending Link...' : 'Send Reset Link' }}
            </button>
          </form>

          <div class="mt-8 border-t border-[#f1e4d4] pt-6 text-center">
            <p class="text-sm font-medium text-slate-500">
              Remember your password?
              <a routerLink="/login" class="text-amber-700 font-semibold hover:text-amber-800 transition-colors ml-1 uppercase tracking-tighter">Back to Login</a>
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

