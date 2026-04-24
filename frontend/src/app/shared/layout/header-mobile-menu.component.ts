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
      class="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-[#eadcc9] bg-[#fffaf5] animate-in slide-in-from-top duration-200 md:hidden"
      data-mobile-menu-panel
    >
      <div class="space-y-2 px-4 pt-2 pb-6">
        <ng-container *ngIf="showPublicNavLinks">
          <a *ngIf="!loggedIn" routerLink="/" (click)="close.emit()" class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white">Home</a>
          <a routerLink="/products" (click)="close.emit()" class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white">Products</a>
          <a
            routerLink="/products"
            [queryParams]="{ category: 'combos' }"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
          >
            Combos
          </a>
          <a routerLink="/products" [queryParams]="{ category: 'gifting' }" (click)="close.emit()" class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white">Gifting Collection</a>
          <a routerLink="/about-us" (click)="close.emit()" class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white">About Us</a>
          <a routerLink="/contact" (click)="close.emit()" class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white">Contact Us</a>
        </ng-container>

        <ng-container *ngIf="loggedIn; else guestLinks">
          <a
          routerLink="/profile"
          (click)="close.emit()"
          class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
        >
          Profile
        </a>
          <a
            *ngIf="!isAdmin && !isVendor"
            routerLink="/orders"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
          >
            My Orders
          </a>
          <a
            *ngIf="!isAdmin && !isVendor"
            routerLink="/wishlist"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
          >
            My Wishlist
          </a>
          <a
            *ngIf="!isAdmin && !isVendor"
            routerLink="/addresses"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
          >
            My Addresses
          </a>
          <a
            *ngIf="isVendor"
            routerLink="/vendor/dashboard"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-bold text-[#6f4e37] hover:bg-[#fff3e4]"
          >
            Vendor Dashboard
          </a>
          <a
            *ngIf="isVendor"
            routerLink="/vendor/orders"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
          >
            Orders
          </a>

          <div class="border-t border-[#eadcc9] pt-4">
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
            class="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-white"
          >
            Login
          </a>
          <a
            routerLink="/register"
            (click)="close.emit()"
            class="block rounded-lg px-3 py-2 text-base font-bold text-[#6f4e37] hover:bg-[#fff3e4]"
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
  @Input() showPublicNavLinks = true;

  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
