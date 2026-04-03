import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      *ngIf="open"
      class="border-t border-slate-100 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl animate-in slide-in-from-top duration-200 md:hidden"
      data-mobile-menu-panel
      role="navigation"
      aria-label="Mobile navigation menu"
    >
      <div class="space-y-2 px-4 pb-6 pt-3">
        <a
          *ngIf="showHomeLink"
          routerLink="/"
          (click)="close.emit()"
          class="block rounded-2xl px-4 py-3 text-base font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Home
        </a>

        <ng-container *ngIf="loggedIn; else guestLinks">
          <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Account</p>
            <div class="mt-3 space-y-2">
              <a
                routerLink="/profile"
                (click)="close.emit()"
                class="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-white"
              >
                Profile
              </a>
              <a
                *ngIf="!isAdmin && !isVendor"
                routerLink="/orders"
                (click)="close.emit()"
                class="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-white"
              >
                My Orders
              </a>
              <a
                *ngIf="!isAdmin && !isVendor"
                routerLink="/addresses"
                (click)="close.emit()"
                class="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-white"
              >
                My Addresses
              </a>
            </div>
          </div>

          <div *ngIf="isVendor" class="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-4">
            <p class="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">Seller tools</p>
            <div class="mt-3 space-y-2">
              <a
                routerLink="/vendor/dashboard"
                (click)="close.emit()"
                class="block rounded-xl px-3 py-2 text-base font-black text-emerald-700 transition hover:bg-white"
              >
                Vendor Dashboard
              </a>
              <a
                routerLink="/vendor/orders"
                (click)="close.emit()"
                class="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-white"
              >
                Orders
              </a>
              <a
                routerLink="/vendor/products"
                (click)="close.emit()"
                class="block rounded-xl px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-white"
              >
                Products
              </a>
            </div>
          </div>

          <div class="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
            <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Actions</p>
            <button
              type="button"
              (click)="logout.emit()"
              class="mt-3 block w-full rounded-xl px-3 py-3 text-left text-base font-black text-rose-600 transition hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </ng-container>

        <ng-template #guestLinks>
          <a
            routerLink="/login"
            (click)="close.emit()"
            class="block rounded-2xl px-4 py-3 text-base font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Login
          </a>
          <a
            routerLink="/register"
            (click)="close.emit()"
            class="block rounded-2xl px-4 py-3 text-base font-black text-indigo-600 transition hover:bg-indigo-50"
          >
            Register
          </a>
        </ng-template>
      </div>
    </div>
  `
})
export class HeaderMobileMenuComponent {
  @Input() open = false;
  @Input() loggedIn = false;
  @Input() isAdmin = false;
  @Input() isVendor = false;
  @Input() showHomeLink = false;

  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
