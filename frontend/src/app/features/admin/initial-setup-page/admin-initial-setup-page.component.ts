import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-initial-setup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <div class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <p class="text-xs font-black uppercase tracking-[0.28em] text-indigo-600">
              First-time bootstrap
            </p>
            <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Create the first admin and store
            </h1>
            <p class="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
              Use this page once to register the platform owner. It creates the admin account and
              the first store profile using the existing backend setup endpoint.
            </p>
          </div>

          <a routerLink="/login" class="btn-secondary !py-3">
            Back to Login
          </a>
        </div>

        <div *ngIf="submitted" class="glass-card mx-auto max-w-3xl p-10 text-center sm:p-14">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-4xl font-black text-emerald-600">
            ✓
          </div>
          <h2 class="mt-6 text-3xl font-black tracking-tight text-slate-900">
            Setup completed
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
            The admin account and store profile were created successfully. You can now sign in and
            open the dashboard.
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

        <form *ngIf="!submitted" (ngSubmit)="onSubmit()" class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section class="space-y-6">
            <div class="glass-card p-6 sm:p-8">
              <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                Admin Details
              </h2>
              <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Full Name</span>
                  <input
                    type="text"
                    required
                    name="username"
                    [(ngModel)]="form.username"
                    placeholder="Admin name"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Email</span>
                  <input
                    type="email"
                    required
                    name="email"
                    [(ngModel)]="form.email"
                    placeholder="admin@example.com"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Phone</span>
                  <input
                    type="tel"
                    required
                    name="phone"
                    [(ngModel)]="form.phone"
                    placeholder="9999999999"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Password</span>
                  <input
                    type="password"
                    required
                    name="password"
                    [(ngModel)]="form.password"
                    placeholder="Create a secure password"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
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
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            <div class="glass-card p-6 sm:p-8">
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
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
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
                    class="block w-full resize-none rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
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
                    class="block w-full resize-none rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </label>
              </div>
            </div>

            <div class="glass-card p-6 sm:p-8">
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
                    placeholder="Name on account"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Account Number</span>
                  <input
                    type="text"
                    required
                    name="accountNumber"
                    [(ngModel)]="form.accountNumber"
                    placeholder="Account number"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
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
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold uppercase text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
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
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
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
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold uppercase text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">UPI ID</span>
                  <input
                    type="text"
                    name="upiId"
                    [(ngModel)]="form.upiId"
                    placeholder="Optional"
                    class="block w-full rounded-2xl border-none bg-slate-50 px-4 py-4 font-bold text-slate-900 shadow-inner focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          </section>

          <aside class="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div class="glass-card p-6 sm:p-8">
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
                    class="flex h-28 w-28 items-center justify-center rounded-3xl bg-indigo-600 text-4xl font-black text-white shadow-xl"
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

            <div class="glass-card space-y-4 p-6 sm:p-8">
              <h2 class="text-lg font-black uppercase tracking-[0.18em] text-slate-900">
                Setup Secret
              </h2>
              <p class="text-sm font-medium leading-7 text-slate-500">
                Keep the secret key private. It is required only for the first admin bootstrap.
              </p>
            </div>

            <div *ngIf="errorMessage" class="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              [disabled]="isLoading"
              class="btn-primary !w-full !py-5 text-lg shadow-2xl shadow-indigo-200/60"
            >
              {{ isLoading ? 'Creating Admin...' : 'Create Admin Account' }}
            </button>
          </aside>
        </form>
      </div>
    </div>
  `,
})
export class AdminInitialSetupPageComponent {
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
  errorMessage = '';

  constructor(
    private adminService: AdminService
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
      this.errorMessage = 'Please upload a store logo.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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

    this.adminService.initialAdminSetup(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success) {
          this.submitted = true;
        } else {
          this.errorMessage = res?.message || 'Setup failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Setup failed. Please try again.';
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
    this.errorMessage = '';
    this.submitted = false;
  }
}
