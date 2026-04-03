import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { catchError, finalize, EMPTY } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[130px] animate-float"></div>
        <div class="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[130px] animate-float" style="animation-delay: 2s"></div>
      </div>

      <div class="relative z-10 mx-auto w-full max-w-md text-center space-y-3">
        <p class="text-[11px] font-black uppercase tracking-[0.28em] text-indigo-500">Create account</p>
        <h2 class="text-4xl font-black tracking-tight text-slate-900">Join the marketplace</h2>
        <p class="text-slate-500 font-medium tracking-wide">Create your profile to browse, buy, and track orders.</p>
      </div>

      <div class="relative z-10 mt-10 mx-auto w-full max-w-md">
        <div class="app-section p-8 sm:p-10">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            
            <div class="space-y-2">
              <label for="username" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Full name</label>
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="name"
                inputmode="text"
                pattern="[A-Za-z ]+"
                title="Use letters only"
                required
                [(ngModel)]="username"
                (ngModelChange)="validateUsername($event)"
                placeholder="Enter your full name"
                [class.ring-2]="!!usernameError"
                [class.ring-red-500]="!!usernameError"
                [class.focus:ring-red-500]="!!usernameError"
                class="app-input-soft">
              <p *ngIf="usernameError" class="ml-1 text-xs font-semibold text-red-500">
                {{ usernameError }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="email" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                [(ngModel)]="email"
                placeholder="Enter your email"
                class="app-input-soft">
            </div>

            <div class="space-y-2">
              <label for="phone" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]{10}"
                maxlength="10"
                required
                [(ngModel)]="phone"
                (ngModelChange)="validatePhone($event)"
                placeholder="Enter your phone number"
                [class.ring-2]="!!phoneError"
                [class.ring-red-500]="!!phoneError"
                [class.focus:ring-red-500]="!!phoneError"
                class="app-input-soft">
              <p *ngIf="phoneError" class="ml-1 text-xs font-semibold text-red-500">
                {{ phoneError }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="password" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Password</label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  class="app-input-soft pr-16"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-4 text-lg">
              {{ isLoading ? 'Creating Account...' : 'Register' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-sm font-medium text-slate-500">
              Already have an account?
              <a routerLink="/login" class="ml-1 font-black uppercase tracking-tighter text-indigo-600 transition-colors hover:text-indigo-700">Sign in</a>
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  phone = '';
  password = '';
  isLoading = false;
  showPassword = false;
  usernameError = '';
  phoneError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private errorService: ErrorService
  ) { }

  onSubmit() {
    this.isLoading = true;
    const normalizedUsername = this.username.trim().replace(/\s+/g, ' ');
    const alphabetOnlyName = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const phoneOnlyDigits = /^\d{10}$/;

    if (!alphabetOnlyName.test(normalizedUsername)) {
      this.isLoading = false;
      this.usernameError = 'Name must contain only letters and spaces.';
      this.errorService.showToast(this.usernameError, 'error');
      return;
    }

    if (!phoneOnlyDigits.test(this.phone.trim())) {
      this.isLoading = false;
      this.phoneError = 'Phone number must be exactly 10 digits.';
      this.errorService.showToast(this.phoneError, 'error');
      return;
    }

    this.authService
      .register({ username: normalizedUsername, email: this.email, phone: this.phone, password: this.password })
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
          this.errorService.showToast(res.message || 'Registration successful.', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 900);
        }
      });
  }

  resetForm(): void {
    this.username = '';
    this.email = '';
    this.phone = '';
    this.password = '';
    this.usernameError = '';
    this.phoneError = '';
  }

  validateUsername(value: string): void {
    this.username = value;

    const normalized = value.trim();
    if (!normalized) {
      this.usernameError = '';
      return;
    }

    const alphabetOnlyName = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    this.usernameError = alphabetOnlyName.test(normalized)
      ? ''
      : 'Use letters only. Numbers and symbols are not allowed.';
  }

  validatePhone(value: string): void {
    this.phone = value;

    const normalized = value.trim();
    if (!normalized) {
      this.phoneError = '';
      return;
    }

    this.phoneError = /^\d{10}$/.test(normalized)
      ? ''
      : 'Enter a 10-digit phone number.';
  }
}
