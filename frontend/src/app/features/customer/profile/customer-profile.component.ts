import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AuthService } from '../../../core/services/auth.service';
import { VendorService } from '../../../core/services/vendor.service';
import { CustomerEditProfileModalComponent } from '../edit-profile-modal/customer-edit-profile-modal.component';
import { CustomerChangePasswordPanelComponent } from '../change-password-panel/customer-change-password-panel.component';
import { CustomerPersonalDetailsComponent } from '../personal-details/customer-personal-details.component';
import { CustomerProfileHeaderComponent } from '../profile-header/customer-profile-header.component';
import { CustomerProfileSidebarComponent } from '../profile-sidebar/customer-profile-sidebar.component';
import { CustomerUser, CustomerVendorProfile } from '../../../core/models/customer.models';
import { PageShellComponent } from '../../../shared/ui/page-shell.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CustomerProfileHeaderComponent,
    CustomerProfileSidebarComponent,
    CustomerPersonalDetailsComponent,
    CustomerChangePasswordPanelComponent,
    CustomerEditProfileModalComponent,
    PageShellComponent
  ],
  template: `
    <app-page-shell
      eyebrow="Account"
      eyebrowClass="text-indigo-500"
      title="Your profile"
      description="Manage your account details, password, and vendor profile information from one place."
    >
      <div page-shell-content class="space-y-8">
        <app-customer-profile-header
          [isAdmin]="isAdmin()"
          [isVendor]="isVendor()"
          [vendorProfile]="vendorProfile"
          (logout)="onLogout()"
        />

        <div *ngIf="!user && !error" class="app-section flex flex-col items-center gap-4 px-4 py-16 text-center sm:py-20">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          <p class="max-w-sm font-medium tracking-wide text-slate-500">Syncing account data. Your profile will appear here in a moment.</p>
        </div>

        <div *ngIf="error" class="app-section mb-8 border-rose-100 bg-rose-50/50 p-4 text-rose-700 sm:p-6">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-black text-rose-700">
              !
            </span>
            <div>
              <p class="text-lg font-black">We couldn’t load your profile</p>
              <p class="mt-1 text-sm font-medium leading-7 text-rose-700/80">{{ error }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="user" class="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-start">
          <div class="space-y-6 xl:sticky xl:top-24">
            <app-customer-profile-sidebar
              [user]="user"
              [roles]="getRoles()"
              [memberYear]="getYear()"
              (editProfile)="openEditProfileModal()"
              (changePassword)="openPasswordModal()"
            />
          </div>

          <div class="space-y-6">
            <app-customer-personal-details [user]="user" />
          </div>
        </div>

        <app-customer-change-password-panel
          [open]="isPasswordModalOpen"
          (closed)="closePasswordModal()"
        />

        <app-customer-edit-profile-modal
          [open]="isEditProfileModalOpen"
          [user]="user"
          (closed)="closeEditProfileModal()"
          (saved)="handleProfileSaved($event)"
        />
      </div>
    </app-page-shell>
  `
})
export class ProfileComponent implements OnInit {
  user: CustomerUser | null = null;
  vendorProfile: CustomerVendorProfile | null = null;
  error = '';
  isEditProfileModalOpen = false;
  isPasswordModalOpen = false;

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
          if (this.isAdmin() || this.isVendor()) {
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
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }

  openPasswordModal(): void {
    this.isPasswordModalOpen = true;
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen = false;
  }

  openEditProfileModal(): void {
    this.isEditProfileModalOpen = true;
  }

  closeEditProfileModal(): void {
    this.isEditProfileModalOpen = false;
  }

  handleProfileSaved(updatedUser: CustomerUser): void {
    this.user = updatedUser;
  }
}
