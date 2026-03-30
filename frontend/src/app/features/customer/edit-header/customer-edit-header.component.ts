import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-edit-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mb-10 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold leading-none tracking-tight text-slate-900">Edit Profile</h1>
        <p class="mt-2 font-medium text-slate-500">Update your personal information</p>
      </div>
      <a routerLink="/profile" class="btn-secondary !py-2">
        ← Back to Profile
      </a>
    </div>
  `
})
export class CustomerEditHeaderComponent {}
