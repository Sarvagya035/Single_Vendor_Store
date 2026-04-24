import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-edit-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="border-b border-[#eee2d4] bg-[linear-gradient(180deg,#fffaf5_0%,#fffdf9_100%)] app-card-body">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="app-page-eyebrow !text-amber-700">Account Settings</p>
          <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">Edit Profile</h1>
          <p class="app-page-description !mt-3 !max-w-2xl">
            Update your personal information and profile picture from one organized workspace.
          </p>
        </div>
        <a routerLink="/profile" class="btn-secondary !py-3">
          Back To Profile
        </a>
      </div>
    </div>
  `
})
export class CustomerEditHeaderComponent {}
