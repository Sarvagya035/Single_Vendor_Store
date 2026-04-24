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
    <div class="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf4_0%,#f7ecdd_18%,#fffaf4_100%)]">
      <div class="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f5e6d3]/60 blur-[120px]"></div>
      <div class="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-[#d4a017]/15 blur-[130px]"></div>

      <section class="storefront-section py-10 lg:py-16">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 items-start">
              <div class="space-y-6">
                <div class="space-y-5">
                  <p class="app-page-eyebrow text-[#8b5e3c]">CONTACT US</p>
                  <h1 class="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    We’re here for questions, bulk orders, and store visits.
                  </h1>
                  <p class="max-w-2xl text-[15px] font-medium leading-8 text-slate-600">
                    Reach out for product availability, gifting enquiries, dry fruit recommendations, bulk orders, or anything else you need from Divya Dryfruit House.
                  </p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                  <a [href]="phoneHref" class="btn-primary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                    Call Now
                  </a>
                  <a routerLink="/products" class="btn-secondary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                    Browse Products
                  </a>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <article class="group h-full min-h-[190px] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div class="flex flex-col items-center gap-3 text-center">
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e6] text-[#6f4e37]">
                        📞
                      </div>
                      <div class="min-w-0">
                        <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">PHONE</p>
                        <a [href]="phoneHref" class="mt-2 block text-base font-bold text-slate-900 hover:text-amber-700">
                          {{ phoneDisplay }}
                        </a>
                        <p class="mt-2 text-sm leading-6 text-slate-500">
                          Call us for quick help and order guidance.
                        </p>
                      </div>
                    </div>
                  </article>

                  <article class="group h-full min-h-[190px] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div class="flex flex-col items-center gap-3 text-center">
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e6] text-[#6f4e37]">
                        📍
                      </div>
                      <div class="min-w-0">
                        <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">STORE ADDRESS</p>
                        <p class="mt-2 text-sm font-semibold leading-6 text-slate-900">
                          {{ address }}
                        </p>
                        <a [href]="mapUrl" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex text-sm font-semibold text-[#c45a12]">
                          Open in Google Maps
                        </a>
                      </div>
                    </div>
                  </article>

                  <article class="group h-full min-h-[190px] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div class="flex flex-col items-center gap-3 text-center">
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e6] text-[#6f4e37]">
                        🕒
                      </div>
                      <div class="min-w-0">
                        <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">BUSINESS HOURS</p>
                        <p class="mt-2 text-base font-black text-slate-900">{{ hours }}</p>
                        <p class="mt-2 text-sm leading-6 text-slate-500">
                          Online and store visits welcome.
                        </p>
                      </div>
                    </div>
                  </article>

                  <article class="group h-full min-h-[190px] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div class="flex flex-col items-center gap-3 text-center">
                      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e6] text-[#6f4e37]">
                        💬
                      </div>
                      <div class="min-w-0">
                        <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">FASTEST REPLY</p>
                        <p class="mt-2 text-base font-black text-slate-900">Call or WhatsApp us</p>
                        <a [href]="whatsappHref" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex text-sm font-semibold text-[#c45a12]">
                          Start WhatsApp chat
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div class="relative z-10">
                <div class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 sm:p-6 lg:p-7">
                  <div class="space-y-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Send a message</p>
                    <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Tell us what you need</h2>
                    <p class="text-sm font-medium leading-7 text-slate-500">
                      Share your name, phone number, and what you’re looking for. We’ll use the details to follow up as quickly as possible.
                    </p>
                  </div>

                  <form class="flex flex-col gap-5" (ngSubmit)="onSubmit()">
                    <div class="grid gap-4 sm:grid-cols-2">
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
                          class="block w-full rounded-full border border-[#eadcc9] bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-[#6f4e37] focus:ring-2 focus:ring-[#6f4e37]/20"
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
                          class="block w-full rounded-full border border-[#eadcc9] bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-[#6f4e37] focus:ring-2 focus:ring-[#6f4e37]/20"
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
                        class="block w-full rounded-full border border-[#eadcc9] bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-[#6f4e37] focus:ring-2 focus:ring-[#6f4e37]/20"
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
                        class="block w-full rounded-full border border-[#eadcc9] bg-[#fff7ed] px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-[#6f4e37] focus:ring-2 focus:ring-[#6f4e37]/20"
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
                        class="block w-full rounded-[1.5rem] border border-[#eadcc9] bg-[#fff7ed] px-4 py-4 font-medium leading-7 text-slate-900 shadow-inner transition-all focus:border-[#6f4e37] focus:ring-2 focus:ring-[#6f4e37]/20"
                      ></textarea>
                    </div>

                    <button type="submit" class="mt-2 w-full sm:w-auto sm:self-start rounded-full bg-[#6f4e37] px-6 py-3 text-sm font-semibold text-white">
                      Send Message
                    </button>
                  </form>

                  <div class="mt-4 rounded-[1.5rem] border border-[#eadcc9] bg-[#fff7ed] p-4 text-sm">
                    <p class="text-sm font-bold text-slate-900">For the fastest reply</p>
                    <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                      Call {{ phoneDisplay }} or use WhatsApp if you need immediate help with product selection or store availability.
                    </p>
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
            <div class="mb-5 max-w-2xl space-y-3">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Why contact us?</p>
              <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                We make support simple, helpful, and personal.
              </h2>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
              <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-sm font-bold text-slate-900">Bulk Order Support</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Get help with wholesale, gifting, and large quantity requirements.
                </p>
              </article>
              <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-sm font-bold text-slate-900">Product Recommendations</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Need help choosing almonds, cashews, figs, seeds, or combos? We’ll guide you.
                </p>
              </article>
              <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p class="text-sm font-bold text-slate-900">Store Visit Assistance</p>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Visit our store for fresh packs, gifting options, and daily essentials.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="storefront-section pb-12 lg:pb-16">
        <div class="storefront-container">
          <div class="mx-auto w-full max-w-7xl">
            <div class="flex flex-col gap-5 rounded-[2rem] border border-[#eadcc9] bg-[linear-gradient(135deg,#fffaf4_0%,#fef3e2_100%)] p-6 shadow-[0_20px_60px_rgba(47,27,20,0.06)] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <div class="max-w-2xl">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Need help choosing?</p>
                <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Need help choosing the right dry fruits?
                </h2>
                <p class="mt-3 text-sm font-medium leading-8 text-slate-600">
                  Contact us today and we’ll help you find fresh, premium, and gift-ready options.
                </p>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <a [href]="phoneHref" class="btn-primary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                  Call Now
                </a>
                <a routerLink="/products" class="btn-secondary w-full justify-center !px-6 !py-3 text-sm sm:w-auto">
                  Shop Products
                </a>
              </div>
            </div>
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
