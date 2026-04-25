import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { GuestDataService } from '../../core/services/guest-data.service';
import { catchError, finalize, switchMap, EMPTY, of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-124px)] flex flex-col justify-start relative overflow-hidden px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14 lg:pt-4 bg-[linear-gradient(180deg,#fff9f2_0%,#f5e6d3_18%,#fff9f2_100%)]">
      <!-- Background Glow Effects -->
      <div class="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#f5e6d3]/40 blur-[130px] animate-float"></div>
      <div class="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#d4a017]/20 blur-[130px] animate-float" style="animation-delay: 2s"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2 pt-1 sm:pt-2">
        <h2 class="text-3xl font-semibold text-slate-900 tracking-tight sm:text-4xl">Create Account</h2>
      </div>

      <div class="mt-5 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="app-surface p-6 sm:p-8 lg:p-10">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            
            <div class="space-y-2">
              <label for="username" class="text-[10px] uppercase font-semibold text-slate-400 tracking-[0.15em] ml-1">Full Name</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4 text-amber-700">
                  👤
                </div>
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
                  class="block w-full rounded-xl border-none bg-[#fff7ed] py-4 pl-12 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600">
              </div>
              <p *ngIf="usernameError" class="ml-1 text-xs font-semibold text-red-500">
                {{ usernameError }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="email" class="text-[10px] uppercase font-semibold text-slate-400 tracking-[0.15em] ml-1">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4 text-amber-700">
                  📧
                </div>
                <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                  placeholder="Enter your email"
                  class="block w-full rounded-xl border-none bg-[#fff7ed] py-4 pl-12 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600">
              </div>
            </div>

            <div class="space-y-2">
              <label for="phone" class="text-[10px] uppercase font-semibold text-slate-400 tracking-[0.15em] ml-1">Phone Number</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4 text-amber-700">
                  📞
                </div>
                <input id="phone" name="phone" type="tel" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required [(ngModel)]="phone"
                  (ngModelChange)="validatePhone($event)"
                  placeholder="Enter your phone number"
                  [class.ring-2]="!!phoneError"
                  [class.ring-red-500]="!!phoneError"
                  [class.focus:ring-red-500]="!!phoneError"
                  class="block w-full rounded-xl border-none bg-[#fff7ed] py-4 pl-12 pr-4 font-medium text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600">
              </div>
              <p *ngIf="phoneError" class="ml-1 text-xs font-semibold text-red-500">
                {{ phoneError }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="password" class="text-[10px] uppercase font-semibold text-slate-400 tracking-[0.15em] ml-1">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4 text-amber-700">
                  🔑
                </div>
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  class="block w-full rounded-xl border-none bg-[#fff7ed] py-4 pl-12 pr-16 font-medium text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-4 text-lg">
              {{ isLoading ? 'Creating Account...' : 'Register' }}
            </button>
          </form>

          <div class="mt-8 border-t border-[#f1e4d4] pt-6 text-center">
            <p class="text-sm font-medium text-slate-500">
              Already have an account?
              <a routerLink="/login" class="text-amber-700 font-semibold hover:text-amber-800 transition-colors ml-1 uppercase tracking-tighter">Login here</a>
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
    private guestDataService: GuestDataService,
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
        switchMap((res) => {
          if (!res?.success) {
            this.errorService.showToast(res?.message || 'Registration failed. Please try again.', 'error');
            return EMPTY;
          }

          this.errorService.showToast(res.message || 'Registration successful.', 'success');

          return this.authService.login({ email: this.email, password: this.password }).pipe(
            switchMap(() =>
              this.guestDataService.mergeGuestDataAfterAuth().pipe(
                catchError((error) => {
                  this.errorService.showToast(this.errorService.extractErrorMessage(error), 'warning');
                  return of(null);
                })
              )
            )
          );
        }),
        catchError((error) => {
          this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((mergeResult) => {
        if (mergeResult?.hasFailures) {
          this.errorService.showToast(mergeResult.message, 'warning');
        }

        this.router.navigate(['/']);
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

