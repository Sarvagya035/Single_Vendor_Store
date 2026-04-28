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
      class="absolute inset-x-0 top-full z-[230] max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#eadcc9] bg-[#fffaf5] animate-in slide-in-from-top duration-200 md:max-h-[calc(100vh-5rem)] xl:hidden"
      data-mobile-menu-panel
    >
      <div class="space-y-4 px-4 pt-2 pb-6">
        <section *ngIf="showPublicNavLinks" class="space-y-2">
          <p class="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Navigation</p>
          <a *ngIf="!loggedIn" routerLink="/" (click)="close.emit()" class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">Home</a>
          <a routerLink="/products" (click)="close.emit()" class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">Products</a>
          <a
            routerLink="/products"
            [queryParams]="{ category: 'combos' }"
            (click)="close.emit()"
            class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Combos
          </a>
          <a routerLink="/products" [queryParams]="{ category: 'gifting' }" (click)="close.emit()" class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">Gifting Collection</a>
          <a routerLink="/about-us" (click)="close.emit()" class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">About Us</a>
          <a routerLink="/contact" (click)="close.emit()" class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">Contact Us</a>
        </section>

        <section *ngIf="!loggedIn" class="space-y-2 border-t border-[#eadcc9] pt-4">
          <p class="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Account</p>
          <a
            routerLink="/login"
            (click)="close.emit()"
            class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Login
          </a>
          <a
            routerLink="/register"
            (click)="close.emit()"
            class="block cursor-pointer rounded-lg px-3 py-2 text-sm font-bold text-[#6f4e37] hover:bg-[#fff3e4]"
          >
            Register
          </a>
        </section>
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
