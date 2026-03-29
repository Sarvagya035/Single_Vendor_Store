import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <!-- Background Glow Effects -->
      <div class="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full animate-float"></div>
      <div class="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full animate-float" style="animation-delay: 2s"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
        <p class="text-slate-500 font-medium tracking-wide">Join our marketplace community</p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="glass-card p-10">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            
            <div class="space-y-2">
              <label for="username" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Full Name</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  👤
                </div>
                <input id="username" name="username" type="text" required [(ngModel)]="username"
                  placeholder="Enter your username"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
              </div>
            </div>

            <div class="space-y-2">
              <label for="email" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  📧
                </div>
                <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                  placeholder="Enter your email"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
              </div>
            </div>

            <div class="space-y-2">
              <label for="phone" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Phone Number</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  📞
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputmode="numeric"
                  required
                  [(ngModel)]="phone"
                  (ngModelChange)="validatePhone()"
                  (blur)="phoneTouched = true; validatePhone()"
                  placeholder="Enter your phone number"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
              </div>
              <p *ngIf="phoneTouched && phoneError" class="text-sm font-bold text-rose-600">
                {{ phoneError }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="password" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
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
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-16 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
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

            <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-4 text-lg">
              {{ isLoading ? 'Creating Account...' : 'Register' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-sm font-medium text-slate-500">
              Already have an account?
              <a routerLink="/login" class="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1 uppercase tracking-tighter">Login here</a>
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
  successMessage = '';
  showPassword = false;
  phoneTouched = false;
  phoneError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  onSubmit() {
    this.isLoading = true;
    this.successMessage = '';
    this.phoneTouched = true;
    this.validatePhone();

    if (this.phoneError) {
      this.isLoading = false;
      return;
    }

    this.authService.register({ username: this.username, email: this.email, phone: this.normalizePhone(this.phone), password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = res.message || 'Registration successful.';
          this.notificationService.success(this.successMessage, 'Account created');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 900);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(
          err.error?.message || 'Registration failed. Please try again.',
          'Registration failed'
        );
      }
    });
  }

  resetForm(): void {
    this.username = '';
    this.email = '';
    this.phone = '';
    this.password = '';
    this.successMessage = '';
    this.phoneTouched = false;
    this.phoneError = '';
  }

  validatePhone(): void {
    const digitsOnly = this.normalizePhone(this.phone);
    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      this.phoneError = 'Phone number must be at least 10 digits.';
      return;
    }

    this.phoneError = '';
  }

  private normalizePhone(value: string): string {
    return String(value || '').replace(/\D/g, '');
  }
}
