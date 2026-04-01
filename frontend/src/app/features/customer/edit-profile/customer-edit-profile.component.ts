import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CustomerAccountFormComponent } from '../account-form/customer-account-form.component';
import { CustomerAvatarPanelComponent } from '../avatar-panel/customer-avatar-panel.component';
import { CustomerEditHeaderComponent } from '../edit-header/customer-edit-header.component';
import { CustomerPasswordForm, CustomerProfileForm } from '../../../core/models/customer.models';
import { CustomerPasswordPanelComponent } from '../password-panel/customer-password-panel.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    CustomerEditHeaderComponent,
    CustomerAccountFormComponent,
    CustomerAvatarPanelComponent,
    CustomerPasswordPanelComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 pt-16 pb-32">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <app-customer-edit-header />

        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <app-customer-account-form
            [user]="user"
            [message]="profileMessage"
            [isSuccess]="isProfileSuccess"
            [isSubmitting]="isUpdatingProfile"
            (userChange)="updateUser($event)"
            (submit)="onUpdateProfile()"
          />

          <app-customer-avatar-panel
            [user]="user"
            [previewUrl]="previewUrl"
            [selectedFileName]="selectedFile?.name || ''"
            [message]="avatarMessage"
            [isSuccess]="isAvatarSuccess"
            [isSubmitting]="isUpdatingAvatar"
            (fileSelected)="onFileSelected($event)"
            (submit)="onUpdateAvatar()"
          />

          <div class="lg:col-span-2">
            <app-customer-password-panel
              [passwordForm]="passwordForm"
              [message]="passwordMessage"
              [isSuccess]="isPasswordSuccess"
              [isSubmitting]="isChangingPassword"
              (passwordFormChange)="updatePasswordForm($event)"
              (submit)="onChangePassword()"
            />
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditProfileComponent implements OnInit {
  user: CustomerProfileForm = { username: '', phone: '', avatar: '' };
  passwordForm: CustomerPasswordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  isUpdatingProfile = false;
  profileMessage = '';
  isProfileSuccess = false;

  isUpdatingAvatar = false;
  avatarMessage = '';
  isAvatarSuccess = false;

  isChangingPassword = false;
  passwordMessage = '';
  isPasswordSuccess = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        if (res.success) {
          this.user = { ...res.data };
        }
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  updateUser(user: CustomerProfileForm) {
    this.user = user;
  }

  updatePasswordForm(passwordForm: CustomerPasswordForm): void {
    this.passwordForm = passwordForm;
    this.passwordMessage = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onUpdateProfile() {
    this.isUpdatingProfile = true;
    this.profileMessage = '';
    this.userService.updateProfile({ username: this.user.username, phone: this.user.phone }).subscribe({
      next: (res) => {
        this.isUpdatingProfile = false;
        if (res.success) {
          this.profileMessage = 'Profile updated successfully!';
          this.isProfileSuccess = true;
          this.authService.refreshCurrentUser().subscribe({
            next: (userRes) => {
              if (userRes?.success) {
                this.user = { ...userRes.data };
                this.appRefreshService.notify('auth');
              }
            },
            error: () => this.appRefreshService.notify('auth')
          });
        } else {
          this.profileMessage = res.message || 'Update failed.';
          this.isProfileSuccess = false;
        }
      },
      error: (err) => {
        this.isUpdatingProfile = false;
        this.profileMessage = err.error?.message || 'Update failed.';
        this.isProfileSuccess = false;
      }
    });
  }

  onUpdateAvatar() {
    if (!this.selectedFile) {
      return;
    }
    this.isUpdatingAvatar = true;
    this.avatarMessage = '';
    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (res) => {
        this.isUpdatingAvatar = false;
        if (res.success) {
          this.avatarMessage = 'Avatar updated successfully!';
          this.isAvatarSuccess = true;
          this.user.avatar = res.data.avatar;
          this.selectedFile = null;
          this.previewUrl = null;
          this.authService.refreshCurrentUser().subscribe({
            next: (userRes) => {
              if (userRes?.success) {
                this.user = { ...userRes.data };
                this.appRefreshService.notify('auth');
              }
            },
            error: () => this.appRefreshService.notify('auth')
          });
        } else {
          this.avatarMessage = res.message || 'Upload failed.';
          this.isAvatarSuccess = false;
        }
      },
      error: (err) => {
        this.isUpdatingAvatar = false;
        this.avatarMessage = err.error?.message || 'Upload failed.';
        this.isAvatarSuccess = false;
      }
    });
  }

  onChangePassword(): void {
    if (!this.passwordForm.oldPassword.trim() || !this.passwordForm.newPassword.trim()) {
      this.passwordMessage = 'Current password and new password are required.';
      this.isPasswordSuccess = false;
      return;
    }

    if (this.passwordForm.newPassword.trim().length < 8) {
      this.passwordMessage = 'New password should be at least 8 characters long.';
      this.isPasswordSuccess = false;
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordMessage = 'New password and confirmation do not match.';
      this.isPasswordSuccess = false;
      return;
    }

    this.isChangingPassword = true;
    this.passwordMessage = '';

    this.userService.changePassword({
      oldPassword: this.passwordForm.oldPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        if (res.success) {
          this.passwordMessage = 'Password changed successfully!';
          this.isPasswordSuccess = true;
          this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
          this.appRefreshService.notify('auth');
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 900);
        } else {
          this.passwordMessage = res.message || 'Password update failed.';
          this.isPasswordSuccess = false;
        }
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordMessage = err.error?.message || 'Password update failed.';
        this.isPasswordSuccess = false;
      }
    });
  }
}
