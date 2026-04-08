import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="mt-12 border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff9f2_100%)]">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white shadow-lg" style="background: linear-gradient(135deg, #6f4e37, #8b5e3c); box-shadow: 0 10px 24px rgba(111,78,55,0.18);">
                E
              </div>
              <div>
                <p class="text-lg font-black text-slate-900">E-Commerce</p>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Smart vendor storefront</p>
              </div>
            </div>
            <p class="max-w-xl text-sm font-medium leading-relaxed text-slate-500">
              A clean shopping and vendor experience for browsing products, managing inventory, and keeping orders moving.
            </p>
          </div>

          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Explore</p>
            <div class="mt-4 space-y-3 text-sm font-semibold">
              <a routerLink="/" class="block text-slate-700 transition hover:text-amber-700">Home</a>
              <a routerLink="/" class="block text-slate-700 transition hover:text-amber-700">Browse Products</a>
              <a routerLink="/cart" class="block text-slate-700 transition hover:text-amber-700">Cart</a>
              <a routerLink="/profile" class="block text-slate-700 transition hover:text-amber-700">Profile</a>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">For Sellers</p>
            <div class="mt-4 space-y-3 text-sm font-semibold">
              <a routerLink="/vendor/dashboard" class="block text-slate-700 transition hover:text-amber-700">Dashboard</a>
              <a routerLink="/vendor/products" class="block text-slate-700 transition hover:text-amber-700">Manage Products</a>
              <a routerLink="/vendor/orders" class="block text-slate-700 transition hover:text-amber-700">Orders</a>
              <a routerLink="/vendor/profile" class="block text-slate-700 transition hover:text-amber-700">Store Profile</a>
            </div>
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for a smoother shopping and store management flow.</p>
          <p class="font-semibold text-slate-400">Copyright {{ currentYear }} E-Commerce</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
