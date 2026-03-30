import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AuthService } from '../../../core/services/auth.service';
import { VendorService } from '../../../core/services/vendor.service';
import { CustomerPersonalDetailsComponent } from '../personal-details/customer-personal-details.component';
import { CustomerProfileHeaderComponent } from '../profile-header/customer-profile-header.component';
import { CustomerProfileSidebarComponent } from '../profile-sidebar/customer-profile-sidebar.component';
import { CustomerUser, CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CustomerProfileHeaderComponent,
    CustomerProfileSidebarComponent,
    CustomerPersonalDetailsComponent
  ],
  template: `
    <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_24%,#f8fafc_100%)] pt-16 pb-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <app-customer-profile-header
          [isAdmin]="isAdmin()"
          [isVendor]="isVendor()"
          [vendorProfile]="vendorProfile"
          (logout)="onLogout()"
        />

        <div *ngIf="!user && !error" class="flex flex-col items-center gap-4 py-20">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          <p class="font-medium tracking-wide text-slate-500">Syncing account data...</p>
        </div>

        <div *ngIf="error" class="glass-card mb-8 border-rose-100 bg-rose-50/50 p-6 font-bold text-rose-700">
          ⚠️ {{ error }}
        </div>

        <div *ngIf="user" class="grid grid-cols-1 gap-8 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-start">
          <div class="space-y-6 xl:sticky xl:top-24">
            <app-customer-profile-sidebar
              [user]="user"
              [roles]="getRoles()"
              [memberYear]="getYear()"
            />
          </div>

          <div class="space-y-6">
            <app-customer-personal-details [user]="user" />
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: CustomerUser | null = null;
  vendorProfile: CustomerVendorProfile | null = null;
  error = '';

  constructor(
    private authService: AuthService,
    private vendorService: VendorService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit() {
    this.fetchUser();
  }

  getRoles(): string {
    if (!this.user?.role) {
      return 'customer';
    }
    if (Array.isArray(this.user.role)) {
      return this.user.role.join(', ');
    }
    return String(this.user.role);
  }

  isAdmin(): boolean {
    if (!this.user?.role) {
      return false;
    }
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((role: string) => role.toLowerCase() === 'admin');
    }
    return String(this.user.role).toLowerCase() === 'admin';
  }

  isVendor(): boolean {
    if (!this.user?.role) {
      return false;
    }
    if (Array.isArray(this.user.role)) {
      return this.user.role.some((role: string) => role.toLowerCase() === 'vendor');
    }
    return String(this.user.role).toLowerCase() === 'vendor';
  }

  getYear(): string {
    if (!this.user?.createdAt) {
      return 'N/A';
    }
    return new Date(this.user.createdAt).getFullYear().toString();
  }

  fetchUser() {
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        if (res?.success) {
          this.user = res.data;
          this.appRefreshService.notify('auth');
          if (!this.isAdmin() && !this.isVendor()) {
            this.fetchVendorProfile();
          }
        } else {
          this.error = 'Failed to load profile data.';
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  fetchVendorProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        if (res?.success) {
          this.vendorProfile = res.data;
        }
      },
      error: () => {
        this.vendorProfile = null;
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
