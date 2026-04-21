import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-initial-setup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header eyebrow="First-time bootstrap" title="Create your store account" titleClass="!text-[1.9rem] sm:!text-[2.2rem]" description="Use this page once to register the store owner, store profile, and payout details." >
            <a routerLink="/login" class="btn-secondary !py-3">Back to Login</a>
          </app-page-header>
        </div>

        <div *ngIf="submitted" class="px-4 py-10 sm:px-5 lg:px-6 lg:py-12">
          <div class="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-600/10 text-4xl font-black text-amber-700">
              ✓
            </div>
            <h2 class="mt-6 text-3xl font-black tracking-tight text-slate-900">
              Setup completed
            </h2>
            <p class="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
              The store account and profile were created successfully. You can now sign in and open the store dashboard.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a routerLink="/login" class="btn-primary !px-8 !py-3">
                Go to Login
              </a>
              <button type="button" class="btn-secondary !px-8 !py-3" (click)="resetForm()">
                Create another
              </button>
            </div>
          </div>
        </div>

        <form *ngIf="!submitted" (ngSubmit)="onSubmit()" class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <section class="space-y-6">
              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                  Account Details
                </h2>
                <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Full Name</span>
                  <input
                    type="text"
                    required
                    name="username"
                    [(ngModel)]="form.username"
                    (ngModelChange)="validateAlphabetic('username', $event)"
                    placeholder="Store owner name"
                    [class.ring-2]="!!usernameError"
                    [class.ring-red-500]="!!usernameError"
                    [class.focus:ring-red-500]="!!usernameError"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                  <p *ngIf="usernameError" class="ml-1 text-xs font-semibold text-red-500">{{ usernameError }}</p>
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Email</span>
                  <input
                    type="email"
                    required
                    name="email"
                    [(ngModel)]="form.email"
                    placeholder="owner@example.com"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Phone</span>
                  <input
                    type="tel"
                    inputmode="numeric"
                    pattern="[0-9]{10}"
                    maxlength="10"
                    required
                    name="phone"
                    [(ngModel)]="form.phone"
                    (ngModelChange)="validatePhone($event)"
                    placeholder="9999999999"
                    [class.ring-2]="!!phoneError"
                    [class.ring-red-500]="!!phoneError"
                    [class.focus:ring-red-500]="!!phoneError"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                  <p *ngIf="phoneError" class="ml-1 text-xs font-semibold text-red-500">{{ phoneError }}</p>
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Password</span>
                  <input
                    type="password"
                    required
                    name="password"
                    [(ngModel)]="form.password"
                    placeholder="Create a secure password"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2 sm:col-span-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Setup Secret Key</span>
                  <input
                    type="password"
                    required
                    name="secretKey"
                    [(ngModel)]="form.secretKey"
                    placeholder="Backend setup secret"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>
                </div>
              </div>

              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                  Store Details
                </h2>
                <div class="mt-6 grid gap-5">
                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Shop Name</span>
                  <input
                    type="text"
                    required
                    name="shopName"
                    [(ngModel)]="form.shopName"
                    placeholder="Store name"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Store Description</span>
                  <textarea
                    rows="4"
                    required
                    name="vendorDescription"
                    [(ngModel)]="form.vendorDescription"
                    placeholder="Describe the store"
                    class="block w-full resize-none rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  ></textarea>
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Store Address</span>
                  <textarea
                    rows="3"
                    required
                    name="vendorAddress"
                    [(ngModel)]="form.vendorAddress"
                    placeholder="Business address"
                    class="block w-full resize-none rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  ></textarea>
                </label>
                </div>
              </div>

              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                  Bank Details
                </h2>
                <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <label class="space-y-2 sm:col-span-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Account Holder Name</span>
                  <input
                    type="text"
                    required
                    name="accountHolderName"
                    [(ngModel)]="form.accountHolderName"
                    (ngModelChange)="validateAlphabetic('accountHolderName', $event)"
                    placeholder="Name on account"
                    [class.ring-2]="!!accountHolderNameError"
                    [class.ring-red-500]="!!accountHolderNameError"
                    [class.focus:ring-red-500]="!!accountHolderNameError"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                  <p *ngIf="accountHolderNameError" class="ml-1 text-xs font-semibold text-red-500">{{ accountHolderNameError }}</p>
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Account Number</span>
                  <input
                    type="text"
                    required
                    name="accountNumber"
                    [(ngModel)]="form.accountNumber"
                    placeholder="Account number"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">IFSC Code</span>
                  <input
                    type="text"
                    required
                    name="ifscCode"
                    [(ngModel)]="form.ifscCode"
                    placeholder="HDFC0001234"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold uppercase text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Bank Name</span>
                  <input
                    type="text"
                    required
                    name="bankName"
                    [(ngModel)]="form.bankName"
                    placeholder="Bank name"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">GST Number</span>
                  <input
                    type="text"
                    required
                    name="gstNumber"
                    [(ngModel)]="form.gstNumber"
                    placeholder="GST number"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold uppercase text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">UPI ID</span>
                  <input
                    type="text"
                    name="upiId"
                    [(ngModel)]="form.upiId"
                    placeholder="Optional"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-amber-600"
                  />
                </label>
                </div>
              </div>
            </section>

            <aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                  Store Logo
                </h2>
                <p class="mt-2 text-sm font-medium text-slate-500">
                  Upload the logo that will represent the store.
                </p>

                <div class="mt-6 flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                  <div class="relative">
                    <img
                      *ngIf="logoPreview"
                      [src]="logoPreview"
                      alt="Logo preview"
                      class="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-xl"
                    />
                    <div
                      *ngIf="!logoPreview"
                      class="flex h-28 w-28 items-center justify-center rounded-3xl bg-amber-700 text-4xl font-black text-white shadow-xl"
                    >
                      S
                    </div>
                  </div>

                  <label for="logoInput" class="btn-secondary cursor-pointer !px-6 !py-3">
                    Choose Logo
                  </label>
                  <input
                    id="logoInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onLogoSelected($event)"
                  />
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    PNG, JPG or WEBP
                  </p>
                </div>
              </div>

              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                  Setup Secret
                </h2>
                <p class="mt-2 text-sm font-medium leading-7 text-slate-500">
                  Keep the secret key private. It is required only for the first store bootstrap.
                </p>
              </div>

              <button
                type="submit"
                [disabled]="isLoading"
                class="btn-primary !w-full !py-5 text-lg shadow-2xl shadow-amber-200/60"
              >
                {{ isLoading ? 'Creating Store...' : 'Create Store Account' }}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class VendorInitialSetupPageComponent {
  form = {
    username: '',
    email: '',
    phone: '',
    password: '',
    secretKey: '',
    shopName: '',
    vendorAddress: '',
    vendorDescription: '',
    gstNumber: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  };

  logoFile: File | null = null;
  logoPreview = '';
  isLoading = false;
  submitted = false;
  usernameError = '';
  phoneError = '';
  accountHolderNameError = '';

  constructor(
    private vendorService: VendorService,
    private errorService: ErrorService
  ) {}

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.logoFile = null;
      this.logoPreview = '';
      return;
    }

    this.logoFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(this.logoFile);
  }

  onSubmit(): void {
    if (!this.logoFile) {
      this.errorService.showToast('Please upload a store logo.', 'error');
      return;
    }

    const usernameValid = this.validateAlphabetic('username', this.form.username);
    const phoneValid = this.validatePhone(this.form.phone);
    const accountHolderNameValid = this.validateAlphabetic('accountHolderName', this.form.accountHolderName);

    if (!usernameValid || !phoneValid || !accountHolderNameValid) {
      return;
    }

    this.isLoading = true;

    const payload = new FormData();
    payload.append('username', this.form.username.trim());
    payload.append('email', this.form.email.trim());
    payload.append('password', this.form.password);
    payload.append('secretKey', this.form.secretKey);
    payload.append('phone', this.form.phone.trim());
    payload.append('shopName', this.form.shopName.trim());
    payload.append('vendorAddress', this.form.vendorAddress.trim());
    payload.append('vendorDescription', this.form.vendorDescription.trim());
    payload.append('gstNumber', this.form.gstNumber.trim());
    payload.append('accountHolderName', this.form.accountHolderName.trim());
    payload.append('accountNumber', this.form.accountNumber.trim());
    payload.append('ifscCode', this.form.ifscCode.trim().toUpperCase());
    payload.append('bankName', this.form.bankName.trim());

    if (this.form.upiId.trim()) {
      payload.append('upiId', this.form.upiId.trim());
    }

    payload.append('vendorLogo', this.logoFile);

    this.vendorService.initialStoreSetup(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success) {
          this.submitted = true;
        } else {
          this.errorService.showToast(res?.message || 'Setup failed.', 'error');
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      username: '',
      email: '',
      phone: '',
      password: '',
      secretKey: '',
      shopName: '',
      vendorAddress: '',
      vendorDescription: '',
      gstNumber: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
    };
    this.logoFile = null;
    this.logoPreview = '';
    this.submitted = false;
    this.usernameError = '';
    this.phoneError = '';
    this.accountHolderNameError = '';
  }

  validateAlphabetic(field: 'username' | 'accountHolderName', value: string): boolean {
    const normalized = String(value || '').trim();

    if (!normalized) {
      if (field === 'username') {
        this.usernameError = 'Full name is required.';
      } else {
        this.accountHolderNameError = 'Account holder name is required.';
      }
      return false;
    }

    const alphabetOnlyName = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const errorMessage = alphabetOnlyName.test(normalized)
      ? ''
      : 'Use letters only. Numbers and symbols are not allowed.';

    if (field === 'username') {
      this.usernameError = errorMessage;
      return !this.usernameError;
    }

    this.accountHolderNameError = errorMessage;
    return !this.accountHolderNameError;
  }

  validatePhone(value: string): boolean {
    const normalized = String(value || '').trim();

    if (!normalized) {
      this.phoneError = 'Phone number is required.';
      return false;
    }

    this.phoneError = /^\d{10}$/.test(normalized)
      ? ''
      : 'Enter a 10-digit phone number.';
    return !this.phoneError;
  }
}

