import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <!-- Background Glow Effects -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full animate-float"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full animate-float" style="animation-delay: 2s"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Login</h2>
        <p class="text-slate-500 font-medium tracking-wide">Enter your credentials to access your account</p>
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
                <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                  placeholder="Enter your email"
                  class="block w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
              </div>
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
                  autocomplete="current-password"
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

            <div *ngIf="errorMessage" class="bg-rose-50 text-rose-700 border border-rose-100 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
               <span>⚠️</span> {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-4 text-lg">
              {{ isLoading ? 'Logging in...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-10 pt-8 border-t border-slate-100 text-center">
            <p class="text-sm font-medium text-slate-500">
              Don't have an account?
              <a routerLink="/register" class="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1 uppercase tracking-tighter">Register Now</a>
            </p>
            <p class="mt-4 text-xs font-medium text-slate-400">
              First-time setup?
              <a routerLink="/admin-setup" class="ml-1 font-black uppercase tracking-[0.14em] text-slate-700 hover:text-indigo-600">
                Create admin store
              </a>
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
  errorMessage = '';
  redirectTo = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '';
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          const user = res.data?.user;
          const roles = Array.isArray(user?.role) ? user.role : [user?.role];

          if (roles.some((role: string) => String(role).toLowerCase() === 'admin')) {
            this.router.navigate(['/admin/dashboard']);
            return;
          }

          if (roles.some((role: string) => String(role).toLowerCase() === 'vendor')) {
            this.router.navigate(['/vendor/dashboard']);
            return;
          }

          if (this.redirectTo && this.redirectTo.startsWith('/')) {
            this.router.navigateByUrl(this.redirectTo);
            return;
          }

          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please verify credentials.';
      }
    });
  }
}
