import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer id="contact" class="mt-12 border-t border-[#5c3e2f] bg-[#5a341a]">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <img
                src="/assets/divya%20logo.webp"
                alt="Divya logo"
                class="h-17 w-auto object-contain"
              />
            </div>
            <p class="max-w-xl text-sm font-medium leading-relaxed text-[#e8d8ca]">
              A clean shopping and vendor experience for browsing dry fruits, managing inventory, and keeping orders moving.
            </p>
          </div>

          <div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[#fff4e6]">Explore</p>
            <div class="mt-4 space-y-3 text-sm font-semibold">
              <a routerLink="/" class="block text-[#e8d8ca] transition hover:text-white">Home</a>
              <a routerLink="/about-us" class="block text-[#e8d8ca] transition hover:text-white">About Us</a>
              <a routerLink="/products" class="block text-[#e8d8ca] transition hover:text-white">Browse Products</a>
              <a routerLink="/contact" class="block text-[#e8d8ca] transition hover:text-white">Contact Us</a>
              <a routerLink="/cart" class="block text-[#e8d8ca] transition hover:text-white">Cart</a>
              <a routerLink="/profile" class="block text-[#e8d8ca] transition hover:text-white">Profile</a>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.32em] text-[#fff4e6]">For Sellers</p>
            <div class="mt-4 space-y-3 text-sm font-semibold">
              <a routerLink="/vendor/dashboard" class="block text-[#e8d8ca] transition hover:text-white">Dashboard</a>
              <a routerLink="/vendor/products" class="block text-[#e8d8ca] transition hover:text-white">Manage Products</a>
              <a routerLink="/vendor/orders" class="block text-[#e8d8ca] transition hover:text-white">Orders</a>
              <a routerLink="/vendor/profile" class="block text-[#e8d8ca] transition hover:text-white">Store Profile</a>
            </div>
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 border-t border-[#7a5237] pt-6 text-sm text-[#e8d8ca] sm:flex-row sm:items-center sm:justify-between">
          <p>Built for a smoother dry fruit shopping and store management flow.</p>
          <p class="font-extrabold text-[#fff4e6]">Copyright {{ currentYear }} E-Commerce</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
