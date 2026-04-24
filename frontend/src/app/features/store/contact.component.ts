import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="relative overflow-hidden bg-[linear-gradient(180deg,#fff9f2_0%,#f6e8d7_20%,#fff9f2_100%)]">
      <div class="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f5e6d3]/50 blur-[120px]"></div>
      <div class="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-[#d4a017]/15 blur-[130px]"></div>

      <section class="storefront-section py-12 lg:py-16">
        <div class="storefront-container">
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-[0.92fr_1.08fr]">
          <div class="relative z-10 space-y-8">
            <div class="space-y-4">
              <p class="app-page-eyebrow">Contact us</p>
              <h1 class="app-page-title max-w-xl">We’re here for questions, bulk orders, and store visits.</h1>
              <p class="app-page-description max-w-2xl">
                Reach out for product availability, gifting enquiries, dry fruit recommendations, or anything else you need from Divya Dryfruit House.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <article class="app-card p-5">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7ed] text-xl">📞</div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phone</p>
                    <a [href]="phoneHref" class="mt-2 block text-lg font-bold text-slate-900 hover:text-amber-700">{{ phoneDisplay }}</a>
                    <p class="mt-1 text-sm font-medium text-slate-500">Call us for quick help and order guidance.</p>
                  </div>
                </div>
              </article>

              <article class="app-card p-5">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7ed] text-xl">📍</div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Store address</p>
                    <p class="mt-2 text-base font-bold text-slate-900">{{ address }}</p>
                    <a [href]="mapUrl" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex text-sm font-bold text-amber-700 hover:text-amber-800">
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </article>

              <article class="app-card p-5">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7ed] text-xl">🕒</div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Business hours</p>
                    <p class="mt-2 text-base font-bold text-slate-900">{{ hours }}</p>
                    <p class="mt-1 text-sm font-medium text-slate-500">Online and store visits welcome.</p>
                  </div>
                </div>
              </article>

              <article class="app-card p-5">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff7ed] text-xl">💬</div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Fastest reply</p>
                    <p class="mt-2 text-base font-bold text-slate-900">Call or WhatsApp us</p>
                    <a [href]="whatsappHref" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex text-sm font-bold text-amber-700 hover:text-amber-800">
                      Start WhatsApp chat
                    </a>
                  </div>
                </div>
              </article>
            </div>

            <div class="app-card-soft p-6 sm:p-8">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Trusted by many customers</p>
                  <h2 class="text-2xl font-bold tracking-tight text-slate-900">Fresh products, friendly service, and quick answers.</h2>
                  <p class="max-w-2xl text-sm font-medium leading-7 text-slate-500">
                    The store focuses on premium dry fruits, spices, herbs, and bakery items. If you’re planning a bulk order or a special gift pack, we can help you pick the right mix.
                  </p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                  <a [href]="phoneHref" class="btn-secondary w-full justify-center !px-5 !py-3 text-sm sm:w-auto">Call now</a>
                  <a [href]="whatsappHref" target="_blank" rel="noopener noreferrer" class="btn-primary w-full justify-center !px-5 !py-3 text-sm sm:w-auto">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>

          <div class="relative z-10">
            <div class="app-surface p-6 sm:p-8 lg:p-10">
              <div class="mb-8">
                <p class="app-page-eyebrow">Send a message</p>
                <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900">Tell us what you need</h2>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                  Share your name, phone number, and what you’re looking for. We’ll use the details to follow up as quickly as possible.
                </p>
              </div>

              <form class="space-y-5" (ngSubmit)="onSubmit()">
                <div class="grid gap-5 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label for="name" class="ml-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autocomplete="name"
                      required
                      [(ngModel)]="form.name"
                      placeholder="Enter your full name"
                      class="block w-full rounded-xl border-none bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="phone" class="ml-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputmode="numeric"
                      maxlength="10"
                      autocomplete="tel"
                      required
                      [(ngModel)]="form.phone"
                      placeholder="Enter your phone number"
                      class="block w-full rounded-xl border-none bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="email" class="ml-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    [(ngModel)]="form.email"
                    placeholder="Enter your email"
                    class="block w-full rounded-xl border-none bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div class="space-y-2">
                  <label for="subject" class="ml-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    [(ngModel)]="form.subject"
                    placeholder="What can we help you with?"
                    class="block w-full rounded-xl border-none bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div class="space-y-2">
                  <label for="message" class="ml-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    required
                    [(ngModel)]="form.message"
                    placeholder="Tell us a little more about your requirements"
                    class="block w-full rounded-2xl border-none bg-[#fff7ed] px-4 py-4 font-medium leading-7 text-slate-900 shadow-inner transition-all focus:ring-2 focus:ring-amber-600"
                  ></textarea>
                </div>

                <button type="submit" class="btn-primary !w-full !py-4 text-base">
                  Send Message
                </button>
              </form>

              <div class="mt-8 rounded-[1.5rem] border border-[#eadcc9] bg-[#fffaf5] p-5">
                <p class="text-sm font-bold text-slate-900">For the fastest reply</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Call {{ phoneDisplay }} or use WhatsApp if you need immediate help with product selection or store availability.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section class="storefront-section pb-12">
        <div class="storefront-container">
        <div class="grid gap-4 md:grid-cols-3">
          <article class="app-card p-6">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dry fruits</p>
            <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
              Premium almonds, cashews, walnuts, pistachios, raisins, and healthy snack mixes.
            </p>
          </article>
          <article class="app-card p-6">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Spices & herbs</p>
            <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
              Authentic spices and natural herbs for everyday cooking and wellness.
            </p>
          </article>
          <article class="app-card p-6">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Bakery items</p>
            <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
              Fresh bakery items for celebrations, gifting, and family treats.
            </p>
          </article>
        </div>
        </div>
      </section>
    </div>
  `
})
export class ContactComponent {
  form = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  readonly phoneDisplay = '+91 9289507166';
  readonly phoneHref = 'tel:+919289507166';
  readonly whatsappHref =
    'https://wa.me/919289507166?text=' +
    encodeURIComponent('Hello Divya Dryfruit House, I would like to enquire about your products.');
  readonly address =
    'SHOP No. 25, Gyanendra, Jeevan Complex, West, Sector 1, Block-B, Bisrakh Jalalpur, Greater Noida, Uttar Pradesh 201318';
  readonly hours = 'Mon - Sat : 10am - 10pm';
  readonly mapUrl =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.address);

  constructor(private errorService: ErrorService) {}

  onSubmit(): void {
    const name = this.form.name.trim();
    const email = this.form.email.trim();
    const phone = this.form.phone.replace(/\D/g, '');
    const subject = this.form.subject.trim();
    const message = this.form.message.trim();

    if (!name || !email || !phone || !subject || !message) {
      this.errorService.showToast('Please complete every field before sending your message.', 'error');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      this.errorService.showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    this.errorService.showToast(
      'Thanks! Your message details are ready. For the quickest reply, call or WhatsApp us directly.',
      'success'
    );

    this.form = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
}
