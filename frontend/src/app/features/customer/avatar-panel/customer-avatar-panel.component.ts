import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerProfileForm } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-avatar-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-section space-y-10 p-10">
      <h3 class="border-b border-slate-100 pb-4 text-lg text-xs font-black uppercase tracking-widest text-slate-900">Profile Picture</h3>

      <div class="flex flex-col items-center space-y-8">
        <div class="group relative">
          <div class="absolute inset-0 rounded-full bg-indigo-500 opacity-10 blur-2xl transition-opacity group-hover:opacity-20"></div>
          <img
            *ngIf="previewUrl || user.avatar"
            [src]="previewUrl || user.avatar"
            alt="Avatar Preview"
            class="relative h-44 w-44 rounded-full border-4 border-white object-cover shadow-2xl"
          >
          <div
            *ngIf="!previewUrl && !user.avatar"
            class="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-6xl font-black text-white shadow-2xl"
          >
            {{ user.username.charAt(0).toUpperCase() }}
          </div>

          <div class="absolute inset-0 rounded-full border-4 border-dashed border-indigo-200 opacity-0 transition-opacity group-hover:opacity-100 animate-[spin_10s_linear_infinite]"></div>
        </div>

        <div class="w-full space-y-6">
          <div class="relative">
            <input type="file" id="avatar-input" (change)="fileSelected.emit($event)" class="hidden" aria-label="Choose profile image">
            <label for="avatar-input" class="btn-secondary !w-full !py-4 flex cursor-pointer flex-col items-center gap-1">
              <span class="text-sm font-black uppercase tracking-[0.18em] text-indigo-600">Select Image</span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ selectedFileName || 'PNG, JPG or WEBP (Max 2MB)' }}</span>
            </label>
          </div>

          <button type="button" (click)="submit.emit()" [disabled]="!selectedFileName || isSubmitting" class="btn-primary !w-full !py-4">
            {{ isSubmitting ? 'Uploading...' : 'Update Picture' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerAvatarPanelComponent {
  @Input({ required: true }) user!: CustomerProfileForm;
  @Input() previewUrl: string | null = null;
  @Input() selectedFileName = '';
  @Input() isSubmitting = false;
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() submit = new EventEmitter<void>();
}
