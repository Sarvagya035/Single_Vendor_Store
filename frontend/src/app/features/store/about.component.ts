import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative overflow-hidden bg-[linear-gradient(180deg,#fff9f2_0%,#f6e8d7_18%,#fff9f2_100%)]">
      <div class="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f5e6d3]/50 blur-[120px]"></div>
      <div class="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-[#d4a017]/15 blur-[130px]"></div>

      <section class="storefront-section py-12 lg:py-16">
        <div class="storefront-container">
        <div class="grid gap-8 md:grid-cols-2 lg:gap-10 lg:items-center">
          <div class="relative z-10 space-y-8">
            <div class="space-y-4">
              <p class="app-page-eyebrow">About us</p>
              <h1 class="app-page-title max-w-3xl">Eat healthy, live better, and bring home quality you can trust.</h1>
              <p class="app-page-description max-w-2xl">
                At Divya Dryfruit House, we offer premium dry fruits, spices, herbs, and bakery items chosen with care for freshness, purity, and everyday wellness.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article class="app-card p-5">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rating</p>
                <p class="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">4.9</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Star customer rating</p>
              </article>
              <article class="app-card p-5">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selection</p>
                <p class="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">Wide</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Dry fruits to bakery</p>
              </article>
              <article class="app-card p-5">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Focus</p>
                <p class="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">Fresh</p>
                <p class="mt-1 text-sm font-medium text-slate-500">Quality every day</p>
              </article>
            </div>

            <div class="app-card-soft p-6 sm:p-8">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Our story</p>
              <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">A one-stop shop for taste, health, and convenience.</h2>
              <p class="mt-4 text-sm font-medium leading-7 text-slate-500">
                We believe true wellness begins with what you eat. That is why we carefully select almonds, cashews, walnuts, authentic Indian spices, herbs like Ashwagandha and Safed Musli, and fresh bakery products such as cakes, biscuits, breads, and pastries.
              </p>
              <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                Our goal is simple: offer fresh, pure, and carefully selected products that bring more value to your kitchen, celebrations, and daily routine.
              </p>
            </div>
          </div>

          <div class="relative z-10">
            <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(47,27,20,0.08)]">
              <div class="bg-[radial-gradient(circle_at_top,rgba(255,244,230,0.92),rgba(255,255,255,1))] p-3 sm:p-4">
                <div class="overflow-hidden rounded-[1.5rem] border border-[#eadcc9] bg-[#fffaf5]">
                  <img
                    src="/assets/shop-image.webp"
                    alt="Divya Dryfruit House storefront"
                    class="h-[240px] w-full object-contain object-center sm:h-[320px] lg:h-[380px]"
                  />
                </div>
              </div>
              <div class="space-y-4 p-6 sm:p-8">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Why choose us</p>
                <div class="grid gap-4">
                  <div class="rounded-[1.25rem] border border-[#eadcc9] bg-[#fffaf5] p-4">
                    <p class="text-sm font-bold text-slate-900">Premium quality products</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Carefully sourced items for better taste and long-term wellness.
                    </p>
                  </div>
                  <div class="rounded-[1.25rem] border border-[#eadcc9] bg-[#fffaf5] p-4">
                    <p class="text-sm font-bold text-slate-900">Wide variety under one roof</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Dry fruits, spices, herbs, and bakery items in one trusted place.
                    </p>
                  </div>
                  <div class="rounded-[1.25rem] border border-[#eadcc9] bg-[#fffaf5] p-4">
                    <p class="text-sm font-bold text-slate-900">Customer-centered service</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Fair pricing, genuine quality, and friendly service are part of how we work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section class="storefront-section pb-12">
        <div class="storefront-container">
        <div class="grid gap-4 lg:grid-cols-2">
          <article class="app-card p-6 sm:p-8">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Our services</p>
            <h3 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">Fresh, premium, and made for healthy living.</h3>
            <p class="mt-4 text-sm font-medium leading-7 text-slate-500">
              We bring you dry fruits, spices, herbs, and bakery delights designed to make healthy living easier and more enjoyable.
            </p>
            <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-[1.25rem] bg-[#fffaf5] p-4">
                <p class="text-sm font-bold text-slate-900">DryFruits</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Energy-rich snacks and gifting essentials.
                </p>
              </div>
              <div class="rounded-[1.25rem] bg-[#fffaf5] p-4">
                <p class="text-sm font-bold text-slate-900">Jadibuti</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Traditional herbs rooted in natural wellness.
                </p>
              </div>
              <div class="rounded-[1.25rem] bg-[#fffaf5] p-4">
                <p class="text-sm font-bold text-slate-900">Spices</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Aromatic ingredients for richer meals.
                </p>
              </div>
              <div class="rounded-[1.25rem] bg-[#fffaf5] p-4">
                <p class="text-sm font-bold text-slate-900">Bakery</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Fresh treats for special moments and everyday enjoyment.
                </p>
              </div>
            </div>
          </article>

          <article class="app-card p-6 sm:p-8">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Customer voices</p>
            <h3 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">Happy customers sharing their experience.</h3>
            <div class="mt-6 space-y-4">
              <blockquote class="rounded-[1.25rem] border border-[#eadcc9] bg-[#fffaf5] p-4">
                <p class="text-sm font-medium leading-7 text-slate-500">
                  “The quality of dry fruits here is amazing. Fresh almonds and cashews made my festive gifting so special. Highly recommended!”
                </p>
                <footer class="mt-3 text-sm font-bold text-slate-900">Shiv Narayan</footer>
              </blockquote>
              <blockquote class="rounded-[1.25rem] border border-[#eadcc9] bg-[#fffaf5] p-4">
                <p class="text-sm font-medium leading-7 text-slate-500">
                  “I always buy spices from Divya Dryfruit House. The aroma and taste are far better than packaged brands. Truly authentic!”
                </p>
                <footer class="mt-3 text-sm font-bold text-slate-900">Ritik Sharma</footer>
              </blockquote>
              <blockquote class="rounded-[1.25rem] border border-[#eadcc9] bg-[#fffaf5] p-4">
                <p class="text-sm font-medium leading-7 text-slate-500">
                  “Best place in Greater Noida for dry fruits and herbs. I found pure Ashwagandha and Safed Musli here. Very satisfied!”
                </p>
                <footer class="mt-3 text-sm font-bold text-slate-900">Ankur Nagar</footer>
              </blockquote>
            </div>
          </article>
        </div>
        </div>
      </section>

      <section class="storefront-section pb-12">
        <div class="storefront-container">
        <div class="grid gap-4 rounded-[2rem] border border-[#eadcc9] bg-white p-6 shadow-[0_20px_60px_rgba(47,27,20,0.08)] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Our promise</p>
            <h3 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">Taste the purity, enjoy the freshness, and make every day healthier.</h3>
            <p class="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500">
              We are committed to serving fresh, healthy, and pure food choices for your family’s well-being.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <a routerLink="/products" class="btn-secondary w-full justify-center !px-5 !py-3 text-sm sm:w-auto">Browse products</a>
            <a routerLink="/contact" class="btn-primary w-full justify-center !px-5 !py-3 text-sm sm:w-auto">Contact us</a>
          </div>
        </div>
        </div>
      </section>
    </div>
  `
})
export class AboutComponent {}
