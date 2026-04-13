import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CustomerAccountFormComponent } from '../account-form/customer-account-form.component';
import { CustomerAvatarPanelComponent } from '../avatar-panel/customer-avatar-panel.component';
import { CustomerChangePasswordPanelComponent } from '../change-password-panel/customer-change-password-panel.component';
import { CustomerEditHeaderComponent } from '../edit-header/customer-edit-header.component';
import { CustomerProfileForm } from '../../../core/models/customer.models';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    CustomerEditHeaderComponent,
    CustomerAccountFormComponent,
    CustomerAvatarPanelComponent,
    CustomerChangePasswordPanelComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 pt-16 pb-32">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <app-customer-edit-header />

        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <app-customer-account-form
            [user]="user"
            [isSubmitting]="isUpdatingProfile"
            (userChange)="updateUser($event)"
            (submit)="onUpdateProfile()"
          />

          <app-customer-avatar-panel
            [user]="user"
            [previewUrl]="previewUrl"
            [selectedFileName]="selectedFile?.name || ''"
            [isSubmitting]="isUpdatingAvatar"
            (fileSelected)="onFileSelected($event)"
            (submit)="onUpdateAvatar()"
          />
        </div>

        <div class="mt-10">
          <app-customer-change-password-panel />
        </div>
      </div>
    </div>
  `
})
export class EditProfileComponent implements OnInit {
  user: CustomerProfileForm = { username: '', phone: '', avatar: '' };
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  isUpdatingProfile = false;

  isUpdatingAvatar = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private errorService: ErrorService
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
    this.userService.updateProfile({ username: this.user.username, phone: this.user.phone }).subscribe({
      next: (res) => {
        this.isUpdatingProfile = false;
        if (res.success) {
          this.user = { ...this.user, ...res.data };
          this.authService.setCurrentUser(this.user);
          this.errorService.showToast(res.message || 'Profile updated successfully!', 'success');
        } else {
          this.errorService.showToast(res.message || 'Update failed.', 'error');
        }
      },
      error: (err) => {
        this.isUpdatingProfile = false;
        this.errorService.showToast(err.error?.message || 'Update failed.', 'error');
      }
    });
  }

  onUpdateAvatar() {
    if (!this.selectedFile) {
      return;
    }
    this.isUpdatingAvatar = true;
    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (res) => {
        this.isUpdatingAvatar = false;
        if (res.success) {
          this.user.avatar = res.data.avatar;
          this.selectedFile = null;
          this.previewUrl = null;
          this.authService.setCurrentUser({ ...this.user, avatar: res.data.avatar });
          this.errorService.showToast(res.message || 'Avatar updated successfully!', 'success');
        } else {
          this.errorService.showToast(res.message || 'Upload failed.', 'error');
        }
      },
      error: (err) => {
        this.isUpdatingAvatar = false;
        this.errorService.showToast(err.error?.message || 'Upload failed.', 'error');
      }
    });
  }

}
