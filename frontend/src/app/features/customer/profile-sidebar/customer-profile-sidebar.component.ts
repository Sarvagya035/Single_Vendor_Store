import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerUser } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card overflow-hidden">
      <div class="rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.9))] p-8">
        <div class="flex flex-col items-center text-center">
          <div class="group relative">
            <div class="absolute inset-0 rounded-full bg-amber-600 opacity-20 blur-2xl transition-opacity group-hover:opacity-40"></div>
            <img
              *ngIf="isValidUrl(user?.avatar)"
              [src]="user?.avatar"
              alt="Avatar"
              class="relative h-32 w-32 rounded-full border-4 border-white object-cover shadow-2xl"
            >
            <div
              *ngIf="!isValidUrl(user?.avatar)"
              class="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-amber-700 text-5xl font-black text-white shadow-2xl"
            >
              {{ user?.username?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-lg">
              ✨
            </div>
          </div>

          <div class="mt-6">
            <h2 class="text-3xl font-black tracking-tight text-slate-900">{{ user?.username }}</h2>
            <p class="mt-2 text-xs font-black uppercase tracking-[0.24em] text-amber-700">{{ roles }}</p>
          </div>
        </div>

        <div class="mt-8 grid gap-4 rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5 text-left">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Membership</p>
            <p class="mt-2 text-sm font-black text-slate-900">Member since {{ memberYear }}</p>
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Access</p>
            <p class="mt-2 text-sm font-bold leading-relaxed text-slate-700">
              Keep your personal details current so your account status and marketplace access stay in sync.
            </p>
          </div>
        </div>

        <div class="mt-6">
          <button type="button" class="btn-primary !w-full !justify-center !py-3.5" (click)="editProfile.emit()">
            Edit Profile
          </button>
        </div>

        <div class="mt-3">
          <button type="button" class="btn-secondary !w-full !justify-center !py-3.5" (click)="changePassword.emit()">
            Edit Password
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerProfileSidebarComponent {
  @Input() user: CustomerUser | null = null;
  @Input() roles = 'customer';
  @Input() memberYear = 'N/A';
  @Output() editProfile = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();

  isValidUrl(url: string | undefined | null): boolean {
    return typeof url === 'string' && url.startsWith('http');
  }
}

