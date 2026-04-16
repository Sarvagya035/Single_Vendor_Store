import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-page-shell border-dashed p-16 text-center space-y-6">
      <div class="text-6xl animate-float">🏪</div>
      <div>
        <h2 class="vendor-empty-title">No active store found</h2>
        <p class="mx-auto mt-2 max-w-sm text-slate-500">
          Your account is not currently linked to a store profile.
        </p>
      </div>
      <a routerLink="/" class="btn-primary inline-flex">Go to Home</a>
    </div>
  `
})
export class VendorEmptyStateComponent {}
