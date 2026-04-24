import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf4_0%,#f7ecdd_18%,#fffaf4_100%)]">
      <div class="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f5e6d3]/60 blur-[120px]"></div>
      <div class="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-[#d4a017]/15 blur-[130px]"></div>

      <section class="storefront-section py-10 lg:py-16">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div class="relative z-10 space-y-8">
                <div class="space-y-5">
                  <p class="app-page-eyebrow text-[#8b5e3c]">ABOUT DIVYA DRY FRUITS</p>
                  <h1 class="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    Bringing premium dry fruits, spices, and healthy essentials to every home.
                  </h1>
                  <p class="max-w-2xl text-[15px] font-medium leading-8 text-slate-600">
                    At Divya Dryfruit House, we carefully select quality dry fruits, spices, herbs, and bakery essentials to bring freshness, taste, and everyday wellness to your family.
                  </p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                  <a routerLink="/products" class="btn-primary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                    Browse Products
                  </a>
                  <a routerLink="/contact" class="btn-secondary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                    Contact Us
                  </a>
                </div>
              </div>

              <div class="relative z-10">
                <div class="overflow-hidden rounded-[2rem] border border-[#eadcc9] bg-[#fffaf5] p-3 shadow-[0_24px_60px_rgba(47,27,20,0.08)] sm:p-4 lg:p-5">
                  <div class="overflow-hidden rounded-[1.5rem] border border-[#eadcc9] bg-white">
                    <img
                      src="/assets/shop-image.webp"
                      alt="Divya Dryfruit House storefront"
                      class="h-[280px] w-full object-contain object-center sm:h-[360px] lg:h-[440px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="storefront-section pb-10 lg:pb-14">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rating</p>
                <p class="mt-3 text-2xl font-bold text-slate-900">4.9</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Customer Rating</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selection</p>
                <p class="mt-3 text-2xl font-bold text-slate-900">Wide</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Product Selection</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Freshness</p>
                <p class="mt-3 text-2xl font-bold text-slate-900">Everyday</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Fresh Quality</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Shopping</p>
                <p class="mt-3 text-2xl font-bold text-slate-900">Secure</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Trusted Experience</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="storefront-section pb-10 lg:pb-14">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
              <article class="rounded-[2rem] border border-[#eadcc9] bg-white p-6 shadow-[0_20px_60px_rgba(47,27,20,0.06)] sm:p-8 lg:p-10">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Our story</p>
                <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  A one-stop shop for taste, health, and convenience.
                </h2>
                <p class="mt-4 max-w-3xl text-sm font-medium leading-8 text-slate-600">
                  Divya Dryfruit House was created with a simple promise: to make premium quality dry fruits and healthy essentials easy to access, reliable to buy, and enjoyable to gift. From almonds, cashews, figs, berries, seeds, spices, herbs, and bakery items, we focus on freshness, careful selection, and customer satisfaction.
                </p>
                <p class="mt-4 max-w-3xl text-sm font-medium leading-8 text-slate-600">
                  We aim to support healthier routines and memorable gifting with products that feel premium, taste better, and arrive with care.
                </p>
              </article>

              <article class="rounded-[2rem] border border-[#eadcc9] bg-[linear-gradient(180deg,#fffaf4_0%,#fffdf9_100%)] p-6 shadow-[0_20px_60px_rgba(47,27,20,0.06)] sm:p-8 lg:p-10">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Why choose us</p>
                <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Built around freshness, trust, and everyday value.
                </h2>
                <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-sm font-bold text-slate-900">Premium Quality Products</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Carefully sourced items selected for better taste, freshness, and long-term wellness.
                    </p>
                  </div>
                  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-sm font-bold text-slate-900">Fresh Packing</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Packed with care to preserve aroma, crunch, and natural goodness.
                    </p>
                  </div>
                  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-sm font-bold text-slate-900">Fast Delivery</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Smooth ordering and quick delivery support for daily needs and gifting.
                    </p>
                  </div>
                  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-sm font-bold text-slate-900">Trusted Shopping</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Secure checkout, easy browsing, and a customer-first shopping experience.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="storefront-section pb-10 lg:pb-14">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="rounded-[2rem] border border-[#eadcc9] bg-white p-6 shadow-[0_20px_60px_rgba(47,27,20,0.06)] sm:p-8 lg:p-10">
              <div class="max-w-2xl">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Product range</p>
                <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  What you can shop with us
                </h2>
                <p class="mt-4 text-sm font-medium leading-8 text-slate-600">
                  Explore a curated range of premium staples, gifting favorites, and healthy everyday essentials.
                </p>
              </div>

              <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="rounded-2xl border border-slate-200 bg-[#fffaf5] p-5">
                  <p class="text-sm font-bold text-slate-900">Dry Fruits</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-[#fffaf5] p-5">
                  <p class="text-sm font-bold text-slate-900">Nuts & Seeds</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-[#fffaf5] p-5">
                  <p class="text-sm font-bold text-slate-900">Spices & Herbs</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-[#fffaf5] p-5">
                  <p class="text-sm font-bold text-slate-900">Gift Boxes</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-[#fffaf5] p-5">
                  <p class="text-sm font-bold text-slate-900">Bakery Essentials</p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-[#fffaf5] p-5">
                  <p class="text-sm font-bold text-slate-900">Combos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="storefront-section pb-12 lg:pb-16">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="flex flex-col gap-5 rounded-[2rem] border border-[#eadcc9] bg-[linear-gradient(135deg,#fffaf4_0%,#fef3e2_100%)] p-6 shadow-[0_20px_60px_rgba(47,27,20,0.06)] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div class="max-w-2xl">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Ready to shop</p>
                <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Ready to explore premium dry fruits?
                </h2>
                <p class="mt-3 text-sm font-medium leading-8 text-slate-600">
                  Browse our curated collection and choose healthy, fresh, and gift-ready products.
                </p>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <a routerLink="/products" class="btn-primary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                  Shop Products
                </a>
                <a routerLink="/contact" class="btn-secondary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class AboutComponent {}
