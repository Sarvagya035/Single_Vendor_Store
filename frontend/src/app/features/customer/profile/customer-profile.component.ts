import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AuthService } from '../../../core/services/auth.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { CustomerEditProfileModalComponent } from '../edit-profile-modal/customer-edit-profile-modal.component';
import { CustomerChangePasswordPanelComponent } from '../change-password-panel/customer-change-password-panel.component';
import { CustomerPersonalDetailsComponent } from '../personal-details/customer-personal-details.component';
import { CustomerProfileSidebarComponent } from '../profile-sidebar/customer-profile-sidebar.component';
import { CustomerUser, CustomerVendorProfile } from '../../../core/models/customer.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CustomerProfileSidebarComponent,
    CustomerPersonalDetailsComponent,
    CustomerChangePasswordPanelComponent,
    CustomerEditProfileModalComponent,
    PageHeaderComponent
  ],
  template: `
    <section class="storefront-section">
      <div class="mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        <div class="mb-4 border-b border-[#ead8c2] pb-4 sm:mb-6 sm:pb-5 lg:mb-7 lg:pb-6">
          <app-page-header
            eyebrow="Account Center"
            title="Customer Profile"
            titleClass="!mt-2 !text-[1.95rem] sm:!text-[2.35rem]"
          />
        </div>

        <div *ngIf="!user && !error" class="mb-5 flex flex-col items-center gap-4 rounded-[28px] border border-[#ead8c2] bg-white/90 px-6 py-12 shadow-sm sm:mb-6 sm:py-14">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-[#e7dac9] border-t-amber-700"></div>
          <p class="font-medium tracking-wide text-slate-500">Syncing account data...</p>
        </div>

        <div *ngIf="error" class="mb-5 rounded-[28px] border border-rose-100 bg-rose-50/60 p-4 text-sm font-medium text-rose-700 shadow-sm sm:mb-6 sm:p-5">
          {{ error }}
        </div>

        <div *ngIf="user" class="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.6fr)_320px] lg:gap-6 lg:items-start">
          <div class="min-w-0">
            <app-customer-personal-details
              [user]="user"
              [roles]="getRoles()"
              [memberSince]="getMemberSince()"
              [isStoreLinked]="isAdmin() || isVendor()"
            />
          </div>

          <div class="space-y-5 sm:space-y-6">
            <app-customer-profile-sidebar
              [user]="user"
              [roles]="getRoles()"
              [memberSince]="getMemberSince()"
              [hasStoreAccess]="isAdmin() || isVendor()"
              [vendorProfile]="vendorProfile"
              (editProfile)="openEditProfileModal()"
              (changePassword)="openPasswordModal()"
            />
          </div>
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
    </section>
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

  getMemberSince(): string {
    if (!this.user?.createdAt) {
      return 'Recently joined';
    }
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(this.user.createdAt));
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

