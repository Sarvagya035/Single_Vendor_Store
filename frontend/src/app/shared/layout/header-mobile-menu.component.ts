import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="open" class="border-t border-slate-100 bg-white animate-in slide-in-from-top duration-200 md:hidden" data-mobile-menu-panel>
      <div class="space-y-2 px-4 pt-2 pb-6">
        <a
          *ngIf="showHomeLink"
          routerLink="/"
          (click)="close.emit()"
          class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Home
        </a>

        <ng-container *ngIf="loggedIn; else guestLinks">
          <a
          routerLink="/profile"
          (click)="close.emit()"
          class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Profile
        </a>
          <a
            *ngIf="!isAdmin && !isVendor"
            routerLink="/orders"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            My Orders
          </a>
          <a
            *ngIf="isVendor"
            routerLink="/vendor/dashboard"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-bold text-amber-700 hover:bg-amber-50"
          >
            Vendor Dashboard
          </a>
          <a
            *ngIf="isVendor"
            routerLink="/vendor/orders"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Orders
          </a>

          <div class="border-t border-slate-100 pt-4">
            <button
              type="button"
              (click)="logout.emit()"
              class="w-full rounded-lg px-3 py-2 text-left text-base font-bold text-rose-600 hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </ng-container>

        <ng-template #guestLinks>
          <a
            routerLink="/login"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Login
          </a>
          <a
            routerLink="/register"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-bold text-amber-700 hover:bg-amber-50"
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
