import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { catchError, finalize, EMPTY } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-124px)] flex flex-col justify-start relative overflow-hidden px-4 pb-10 pt-2 sm:px-6 lg:px-8 lg:pb-14 lg:pt-4 bg-[linear-gradient(180deg,#fff9f2_0%,#f5e6d3_18%,#fff9f2_100%)]">
      <!-- Background Glow Effects -->
      <div class="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#f5e6d3]/40 blur-[120px] animate-float"></div>
      <div class="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#d4a017]/20 blur-[120px] animate-float" style="animation-delay: 2s"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2 pt-1 sm:pt-2">
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Login</h2>
        <p class="text-slate-500 font-medium tracking-wide">Enter your credentials to access your account</p>
      </div>

      <div class="mt-5 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="app-surface p-8 sm:p-10">
          <form class="space-y-8" (ngSubmit)="onSubmit()">
            
            <div class="space-y-2">
              <label for="email" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Email Address</label>
              <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4 text-amber-700">
                  📧
                </div>
                <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                  placeholder="Enter your email"
                  class="block w-full rounded-xl border-none bg-[#fff7ed] py-4 pl-12 pr-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600">
              </div>
            </div>

            <div class="space-y-2">
              <label for="password" class="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em] ml-1">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4 text-amber-700">
                  🔑
                </div>
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  class="block w-full rounded-xl border-none bg-[#fff7ed] py-4 pl-12 pr-16 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
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
              {{ isLoading ? 'Logging in...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-10 border-t border-[#f1e4d4] pt-8 text-center">
            <p class="text-sm font-medium text-slate-500">
              Don't have an account?
              <a routerLink="/register" class="text-amber-700 font-black hover:text-amber-800 transition-colors ml-1 uppercase tracking-tighter">Register Now</a>
            </p>
            <p class="mt-3 text-sm font-medium text-slate-500">
              Forgot your password?
              <a routerLink="/forgot-password" class="text-amber-700 font-black hover:text-amber-800 transition-colors ml-1 uppercase tracking-tighter">Reset it here</a>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  redirectTo = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService
  ) {
    this.redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '';
  }

  onSubmit() {
    this.isLoading = true;

    this.authService
      .login({ email: this.email, password: this.password })
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
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Login failed. Please verify credentials.', 'error');
          return;
        }

        const user = res.data?.user;
        const roles = Array.isArray(user?.role) ? user.role : [user?.role];

        if (
          roles.some((role: string) => String(role).toLowerCase() === 'vendor') ||
          roles.some((role: string) => String(role).toLowerCase() === 'admin')
        ) {
          this.router.navigate(['/vendor/dashboard']);
          return;
        }

        if (this.redirectTo && this.redirectTo.startsWith('/')) {
          this.router.navigateByUrl(this.redirectTo);
          return;
        }

        this.router.navigate(['/']);
      });
  }
}

