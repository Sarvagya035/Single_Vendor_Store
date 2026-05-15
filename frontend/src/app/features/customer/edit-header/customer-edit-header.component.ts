import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-edit-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="store-section p-4 sm:p-5 lg:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="app-page-eyebrow text-amber-700">Account Settings</p>
          <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">Edit Profile</h1>
          <p class="app-page-description">
            Update your personal information and profile picture from one organized workspace.
          </p>
        </div>
        <a routerLink="/profile" class="btn-secondary">
          Back To Profile
        </a>
      </div>
    </div>
  `
})
export class CustomerEditHeaderComponent {}
