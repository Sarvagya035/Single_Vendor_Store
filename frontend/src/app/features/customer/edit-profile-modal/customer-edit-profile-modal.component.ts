import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CustomerAccountFormComponent } from '../account-form/customer-account-form.component';
import { CustomerAvatarPanelComponent } from '../avatar-panel/customer-avatar-panel.component';
import { CustomerProfileForm, CustomerUser } from '../../../core/models/customer.models';
import { ErrorService } from '../../../core/services/error.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-customer-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, CustomerAccountFormComponent, CustomerAvatarPanelComponent],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        (click)="closeModal()"
        aria-label="Close edit profile dialog"
      ></button>

      <div
        #dialogRoot
        class="relative z-[101] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)]"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        tabindex="-1"
      >
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.28em] text-indigo-500">Account</p>
            <h3 [id]="titleId" class="mt-2 text-2xl font-black tracking-tight text-slate-900">Edit Profile</h3>
            <p class="mt-2 text-sm font-medium text-slate-500">
              Update your name, phone number, or avatar from one place.
            </p>
          </div>

            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-50"
              (click)="closeModal()"
            >
              Close
            </button>
        </div>

        <div class="p-6 sm:p-8">
          <div class="mb-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 text-slate-600">
            Use the left panel for account details and the right panel for avatar updates. Changes apply immediately after saving.
          </div>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <app-customer-account-form
              [user]="draftUser"
              [isSubmitting]="isUpdatingProfile"
              (userChange)="updateUser($event)"
              (submit)="onUpdateProfile()"
            />

            <app-customer-avatar-panel
              [user]="draftUser"
              [previewUrl]="previewUrl"
              [selectedFileName]="selectedFile?.name || ''"
              [isSubmitting]="isUpdatingAvatar"
              (fileSelected)="onFileSelected($event)"
              (submit)="onUpdateAvatar()"
            />
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerEditProfileModalComponent implements OnChanges {
  @Input() open = false;
  @Input() user: CustomerUser | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CustomerUser>();

  draftUser: CustomerProfileForm = { username: '', phone: '', avatar: '' };
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUpdatingProfile = false;
  isUpdatingAvatar = false;
  readonly titleId = `edit-profile-title-${Math.random().toString(36).slice(2, 9)}`;
  @ViewChild('dialogRoot') dialogRoot?: ElementRef<HTMLElement>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private errorService: ErrorService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.syncDraftUser();
    }

    if (changes['open'] && this.open) {
      this.syncDraftUser();
      window.setTimeout(() => this.focusFirstElement());
    }
  }

  updateUser(user: CustomerProfileForm): void {
    this.draftUser = user;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  onUpdateProfile(): void {
    this.isUpdatingProfile = true;

    this.userService.updateProfile({
      username: this.draftUser.username,
      phone: this.draftUser.phone
    }).subscribe({
      next: (res) => {
        this.isUpdatingProfile = false;
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Update failed.', 'error');
          return;
        }

        this.draftUser = {
          ...this.draftUser,
          ...(res.data || {})
        };

        const updatedUser = {
          ...(this.user || {}),
          ...this.draftUser
        } as CustomerUser;

        this.authService.setCurrentUser(updatedUser);
        this.saved.emit(updatedUser);
        this.errorService.showToast(res?.message || 'Profile updated successfully!', 'success');
        this.closeModal();
      },
      error: (err) => {
        this.isUpdatingProfile = false;
        this.errorService.showToast(err?.error?.message || 'Update failed.', 'error');
      }
    });
  }

  onUpdateAvatar(): void {
    if (!this.selectedFile) {
      this.errorService.showToast('Please choose an image first.', 'error');
      return;
    }

    this.isUpdatingAvatar = true;

    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (res) => {
        this.isUpdatingAvatar = false;
        if (!res?.success) {
          this.errorService.showToast(res?.message || 'Upload failed.', 'error');
          return;
        }

        this.draftUser = {
          ...this.draftUser,
          avatar: res.data?.avatar || this.draftUser.avatar
        };

        const updatedUser = {
          ...(this.user || {}),
          ...this.draftUser,
          avatar: res.data?.avatar || this.draftUser.avatar
        } as CustomerUser;

        this.selectedFile = null;
        this.previewUrl = null;
        this.authService.setCurrentUser(updatedUser);
        this.saved.emit(updatedUser);
        this.errorService.showToast(res?.message || 'Avatar updated successfully!', 'success');
        this.closeModal();
      },
      error: (err) => {
        this.isUpdatingAvatar = false;
        this.errorService.showToast(err?.error?.message || 'Upload failed.', 'error');
      }
    });
  }

  closeModal(): void {
    this.resetTransientState();
    this.closed.emit();
  }

  @HostListener('keydown', ['$event'])
  handleTabTrap(event: KeyboardEvent): void {
    if (!this.open || event.key !== 'Tab') {
      return;
    }

    const focusables = this.getFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      this.dialogRoot?.nativeElement.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.open) {
      this.closeModal();
    }
  }

  private focusFirstElement(): void {
    const focusables = this.getFocusableElements();
    (focusables[0] || this.dialogRoot?.nativeElement)?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const root = this.dialogRoot?.nativeElement;
    if (!root) {
      return [];
    }

    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('aria-hidden'));
  }

  private syncDraftUser(): void {
    this.draftUser = {
      username: this.user?.username || '',
      phone: this.user?.phone || '',
      avatar: this.user?.avatar || ''
    };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  private resetTransientState(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.isUpdatingProfile = false;
    this.isUpdatingAvatar = false;
  }
}
