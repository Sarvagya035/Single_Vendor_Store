import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRefreshService } from '../../core/services/app-refresh.service';
import { VendorService } from '../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 pt-16 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Accents -->
      <div class="absolute top-0 left-0 w-full h-64 bg-indigo-600/5 blur-[120px]"></div>
      
      <div class="max-w-4xl mx-auto relative z-10">

        <!-- Header -->
        <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Vendor Registration
            </h1>
            <p class="text-slate-500 mt-4 font-medium max-w-md">Register your business to start selling on our platform. Your application will be reviewed for approval.</p>
          </div>
          <a routerLink="/profile" class="btn-secondary !py-2">
             ← Back to Profile
          </a>
        </div>

        <!-- Success state -->
        <div *ngIf="submitted" class="glass-card p-16 text-center space-y-8 animate-float">
          <div class="text-7xl">🛰️</div>
          <div class="space-y-3">
             <h2 class="text-3xl font-black text-slate-900 tracking-tight">Application Submitted</h2>
             <p class="text-slate-500 max-w-sm mx-auto font-medium">Your application has been received and is under review. We will notify you once it's approved.</p>
          </div>
          <div class="pt-4">
             <a routerLink="/profile" class="btn-primary inline-flex !px-10">
               Back to Profile
             </a>
          </div>
        </div>

        <!-- Form -->
        <form *ngIf="!submitted" (ngSubmit)="onSubmit()" class="space-y-10">

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
             
             <!-- Left: Shop Info -->
             <div class="lg:col-span-3 space-y-8">
                <div class="glass-card p-10 space-y-8">
                   <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">Store Details</h3>
                   
                   <div class="space-y-6">
                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Shop Name</label>
                        <input type="text" required [(ngModel)]="form.shopName" name="shopName"
                          placeholder="e.g. Nexus Prime Retail"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>

                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Shop Description</label>
                        <textarea rows="4" required [(ngModel)]="form.vendorDescription" name="vendorDescription"
                          placeholder="Describe your market niche and product core..."
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner resize-none">
                        </textarea>
                      </div>

                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Store Address</label>
                        <input type="text" required [(ngModel)]="form.vendorAddress" name="vendorAddress"
                          placeholder="Full operational address"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>
                   </div>
                </div>

                <div class="glass-card p-10 space-y-8">
                   <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">Bank Details</h3>

                   <div class="grid gap-6 md:grid-cols-2">
                      <div class="space-y-2 md:col-span-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Account Holder Name</label>
                        <input type="text" required [(ngModel)]="form.accountHolderName" name="accountHolderName"
                          placeholder="Name as per bank account"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>

                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Account Number</label>
                        <input type="text" required [(ngModel)]="form.accountNumber" name="accountNumber"
                          placeholder="Enter account number"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>

                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">IFSC Code</label>
                        <input type="text" required [(ngModel)]="form.ifscCode" name="ifscCode"
                          placeholder="e.g. HDFC0001234"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold uppercase focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>

                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Bank Name</label>
                        <input type="text" required [(ngModel)]="form.bankName" name="bankName"
                          placeholder="Primary payout bank"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>

                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">UPI ID</label>
                        <input type="text" [(ngModel)]="form.upiId" name="upiId"
                          placeholder="Optional"
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner">
                      </div>
                   </div>
                </div>
             </div>

             <!-- Right: Legal & Logo -->
             <div class="lg:col-span-2 space-y-8">
                <div class="glass-card p-8 space-y-8">
                   <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">Verification & Logo</h3>
                   
                   <div class="space-y-6">
                      <div class="space-y-2">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">GST Number</label>
                        <input type="text" required [(ngModel)]="form.gstNumber" name="gstNumber"
                          placeholder="GST No."
                          class="block w-full bg-slate-50 border-none rounded-xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner uppercase">
                      </div>

                      <div class="space-y-4">
                         <label class="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] ml-1">Store Logo</label>
                        <div class="flex flex-col items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 group hover:bg-slate-50 transition-colors">
                           <div class="relative">
                              <img *ngIf="logoPreview" [src]="logoPreview" alt="Preview" class="h-24 w-24 rounded-2xl object-cover shadow-lg border-4 border-white">
                              <div *ngIf="!logoPreview" class="h-24 w-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                                 🏢
                              </div>
                              <label for="logoInput" class="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 cursor-pointer hover:scale-110 transition-transform">
                                 ✨
                              </label>
                           </div>
                           <input id="logoInput" type="file" accept="image/*" class="hidden" (change)="onLogoSelected($event)">
                           <p class="text-[10px] text-slate-400 font-black uppercase text-center leading-relaxed">Recommended: 500x500 PNG</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div *ngIf="errorMessage" class="bg-rose-50 text-rose-700 border border-rose-100 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                   <span>⚠️</span> {{ errorMessage }}
                </div>

                <button type="submit" [disabled]="isLoading" class="btn-primary !w-full !py-6 text-xl shadow-2xl shadow-indigo-200">
                  {{ isLoading ? 'Submitting...' : 'Register Store' }}
                </button>
             </div>

          </div>

        </form>
      </div>
    </div>
  `
})
export class VendorRegisterComponent {
  form = {
    shopName: '',
    vendorDescription: '',
    vendorAddress: '',
    gstNumber: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  };

  logoFile: File | null = null;
  logoPreview: string | null = null;
  isLoading = false;
  errorMessage = '';
  submitted = false;

  constructor(
    private vendorService: VendorService,
    private appRefreshService: AppRefreshService
  ) {}

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.logoFile);
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('shopName', this.form.shopName);
    formData.append('vendorDescription', this.form.vendorDescription);
    formData.append('vendorAddress', this.form.vendorAddress);
    formData.append('gstNumber', this.form.gstNumber);
    formData.append('accountHolderName', this.form.accountHolderName);
    formData.append('accountNumber', this.form.accountNumber);
    formData.append('ifscCode', this.form.ifscCode.toUpperCase());
    formData.append('bankName', this.form.bankName);
    formData.append('upiId', this.form.upiId);
    if (this.logoFile) {
      formData.append('vendorLogo', this.logoFile);
    }

    this.vendorService.registerVendor(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success) {
          this.submitted = true;
          this.appRefreshService.notify('auth');
          this.appRefreshService.notify('vendor');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Submission failed. Please try again.';
      }
    });
  }
}
