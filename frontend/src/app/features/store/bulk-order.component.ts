import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-bulk-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative overflow-hidden bg-[linear-gradient(180deg,#fffaf4_0%,#f7ecdd_22%,#fffaf4_100%)]">
      <div class="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f5e6d3]/70 blur-[120px]"></div>
      <div class="pointer-events-none absolute right-0 top-16 h-80 w-80 rounded-full bg-[#d4a017]/15 blur-[130px]"></div>

      <section class="storefront-section py-14 sm:py-16 lg:py-20">
        <div class="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div class="mx-auto max-w-3xl text-center">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b5e3c]">Bulk Order Inquiry</p>
            <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Bulk Order Inquiry
            </h1>
            <p class="mt-4 text-sm font-medium leading-8 text-slate-600 sm:text-[15px]">
              Fill out the form below and our team will get in touch with you for pricing and details.
            </p>
          </div>

          <div class="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div class="space-y-6">
              <div class="rounded-[20px] border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-7">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b5e3c]">Why choose us</p>
                <h2 class="mt-3 text-2xl font-bold tracking-tight text-slate-900">Reliable bulk supply for growing businesses</h2>
                <p class="mt-3 text-sm font-medium leading-7 text-slate-500">
                  Work with a team that understands retail, wholesale, and gifting requirements for premium dry fruits.
                </p>

                <div class="mt-6 space-y-4">
                  <div class="flex items-start gap-3">
                    <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4e6] text-sm text-[#6b3a1e]">✓</span>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">Premium Quality Products</p>
                      <p class="mt-1 text-sm leading-6 text-slate-500">Carefully sourced dry fruits for dependable quality and presentation.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4e6] text-sm text-[#6b3a1e]">✓</span>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">Competitive Bulk Pricing</p>
                      <p class="mt-1 text-sm leading-6 text-slate-500">Wholesale-friendly pricing designed to support healthy margins.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4e6] text-sm text-[#6b3a1e]">✓</span>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">Reliable Delivery</p>
                      <p class="mt-1 text-sm leading-6 text-slate-500">Consistent fulfillment with fast dispatch across India.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4e6] text-sm text-[#6b3a1e]">✓</span>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">Custom Packaging Options</p>
                      <p class="mt-1 text-sm leading-6 text-slate-500">Packaging support for retail shelves, gifting, and branded orders.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-[20px] border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-7">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b5e3c]">Bulk order benefits</p>
                <div class="mt-4 flex flex-wrap gap-3">
                  <span class="rounded-[999px] border border-[#f2ddc2] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f4e37]">Retailers</span>
                  <span class="rounded-[999px] border border-[#f2ddc2] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f4e37]">Wholesalers</span>
                  <span class="rounded-[999px] border border-[#f2ddc2] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f4e37]">Corporate gifting</span>
                </div>
              </div>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white p-6 shadow-md sm:p-8">
              <div class="space-y-3">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e3c]">Send inquiry</p>
                <h2 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Tell us about your bulk requirement</h2>
                <p class="text-sm font-medium leading-7 text-slate-500">
                  Share a few details and we’ll respond with pricing and next steps.
                </p>
              </div>

              <form class="mt-6 space-y-5" [formGroup]="bulkOrderForm" (ngSubmit)="onSubmit()">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label for="fullName" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      formControlName="fullName"
                      placeholder="Enter your full name"
                      class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                    />
                    <p *ngIf="showError('fullName')" class="text-xs font-medium text-rose-500">Full name is required.</p>
                  </div>

                  <div class="space-y-2">
                    <label for="phone" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      inputmode="numeric"
                      maxlength="10"
                      formControlName="phone"
                      placeholder="10-digit phone number"
                      class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                    />
                    <p *ngIf="showError('phone')" class="text-xs font-medium text-rose-500">Enter a valid 10-digit phone number.</p>
                  </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label for="email" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      placeholder="Enter your email"
                      class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="businessName" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Business Name</label>
                    <input
                      id="businessName"
                      type="text"
                      formControlName="businessName"
                      placeholder="Enter business name"
                      class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                    />
                  </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label for="orderType" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Order Type</label>
                    <select
                      id="orderType"
                      formControlName="orderType"
                      class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                    >
                      <option value="">Select order type</option>
                      <option value="Retailer">Retailer</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Corporate Gifting">Corporate Gifting</option>
                    </select>
                    <p *ngIf="showError('orderType')" class="text-xs font-medium text-rose-500">Please choose an order type.</p>
                  </div>

                  <div class="space-y-2">
                    <label for="quantity" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Quantity</label>
                    <input
                      id="quantity"
                      type="text"
                      formControlName="quantity"
                      placeholder="Approx. quantity or cartons"
                      class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="productRequirement" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Product Requirement</label>
                  <textarea
                    id="productRequirement"
                    rows="5"
                    formControlName="productRequirement"
                    placeholder="Tell us the dry fruits you need, packaging preferences, and any special requirements"
                    class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                  ></textarea>
                  <p *ngIf="showError('productRequirement')" class="text-xs font-medium text-rose-500">Product requirement is required.</p>
                </div>

                <div class="space-y-2">
                  <label for="city" class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">City / Location</label>
                  <input
                    id="city"
                    type="text"
                    formControlName="city"
                    placeholder="Enter your city or location"
                    class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40"
                  />
                  <p *ngIf="showError('city')" class="text-xs font-medium text-rose-500">City or location is required.</p>
                </div>

                <button
                  type="submit"
                  class="inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(249,115,22,0.22)] transition hover:bg-orange-600"
                >
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class BulkOrderComponent {
  private readonly fb = inject(FormBuilder);
  private readonly errorService = inject(ErrorService);

  bulkOrderForm = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', Validators.email],
    businessName: [''],
    orderType: ['', Validators.required],
    productRequirement: ['', Validators.required],
    quantity: [''],
    city: ['', Validators.required]
  });

  submitted = false;

  onSubmit(): void {
    this.submitted = true;
    this.bulkOrderForm.markAllAsTouched();

    if (this.bulkOrderForm.invalid) {
      this.errorService.showToast('Please complete the required fields before submitting.', 'error');
      return;
    }

    this.errorService.showToast('Your inquiry has been submitted. Our team will contact you shortly.', 'success');
    this.bulkOrderForm.reset({
      fullName: '',
      phone: '',
      email: '',
      businessName: '',
      orderType: '',
      productRequirement: '',
      quantity: '',
      city: ''
    });
    this.submitted = false;
  }

  showError(controlName: string): boolean {
    const control = this.bulkOrderForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }
}
