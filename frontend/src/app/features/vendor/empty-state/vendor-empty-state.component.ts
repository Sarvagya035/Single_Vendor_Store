import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="glass-card border-dashed p-16 text-center space-y-6">
      <div class="text-6xl animate-float">🏪</div>
      <div>
        <h2 class="text-2xl font-black text-slate-900">No active store found</h2>
        <p class="mx-auto mt-2 max-w-sm text-slate-500">
          Your account is not currently set up as a vendor. Ready to start selling?
        </p>
      </div>
      <a routerLink="/vendor/register" class="btn-primary inline-flex">Register as a Vendor</a>
    </div>
  `
})
export class VendorEmptyStateComponent {}
