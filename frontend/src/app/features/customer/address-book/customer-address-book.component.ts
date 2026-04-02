import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { CustomerAddress, CustomerAddressForm } from '../../../core/models/customer.models';

@Component({
  selector: 'app-customer-address-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg text-xs font-black uppercase tracking-widest text-slate-900">Saved Addresses</h3>
          <p class="mt-2 text-sm font-medium text-slate-500">
            Manage delivery addresses and choose your default destination.
          </p>
        </div>

        <button
          type="button"
          class="btn-primary !py-3 !px-5"
          (click)="startCreate()"
        >
          {{ showForm && !editingAddressId ? 'Adding Address' : 'Add Address' }}
        </button>
      </div>

      <div class="space-y-4 p-8">
        <div
          *ngIf="successMessage"
          class="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          {{ successMessage }}
        </div>

        <div *ngIf="showForm" class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {{ editingAddressId ? 'Edit Address' : 'New Address' }}
              </p>
              <h4 class="mt-1 text-xl font-black text-slate-900">
                {{ editingAddressId ? 'Update this address' : 'Add a delivery address' }}
              </h4>
            </div>
            <button type="button" class="text-sm font-black text-slate-500" (click)="cancelForm()">Cancel</button>
          </div>

          <form class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" (ngSubmit)="saveAddress()">
            <label class="space-y-2 sm:col-span-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Full Name</span>
              <input
                name="fullname"
                [(ngModel)]="form.fullname"
                (ngModelChange)="validateFullname($event)"
                required
                [class.border-red-300]="!!fullnameError"
                [class.focus:border-red-400]="!!fullnameError"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
              <p *ngIf="fullnameError" class="ml-1 text-xs font-semibold text-red-500">
                {{ fullnameError }}
              </p>
            </label>

            <label class="space-y-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Phone</span>
              <input
                name="phone"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]{10}"
                maxlength="10"
                [(ngModel)]="form.phone"
                (ngModelChange)="validatePhone($event)"
                required
                [class.border-red-300]="!!phoneError"
                [class.focus:border-red-400]="!!phoneError"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
              <p *ngIf="phoneError" class="ml-1 text-xs font-semibold text-red-500">
                {{ phoneError }}
              </p>
            </label>

            <label class="space-y-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Postal Code</span>
              <input
                name="postalCode"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="10"
                [(ngModel)]="form.postalCode"
                (ngModelChange)="validatePostalCode($event)"
                required
                [class.border-red-300]="!!postalCodeError"
                [class.focus:border-red-400]="!!postalCodeError"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
              <p *ngIf="postalCodeError" class="ml-1 text-xs font-semibold text-red-500">
                {{ postalCodeError }}
              </p>
            </label>

            <label class="space-y-2 sm:col-span-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Address Line 1</span>
              <input
                name="addressLine1"
                [(ngModel)]="form.addressLine1"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <label class="space-y-2 sm:col-span-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Address Line 2</span>
              <input
                name="addressLine2"
                [(ngModel)]="form.addressLine2"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <label class="space-y-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">City</span>
              <input
                name="city"
                [(ngModel)]="form.city"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <label class="space-y-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">State</span>
              <input
                name="state"
                [(ngModel)]="form.state"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <label class="space-y-2 sm:col-span-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Country</span>
              <input
                name="country"
                [(ngModel)]="form.country"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <div class="sm:col-span-2 flex flex-wrap gap-3 pt-2">
              <button type="submit" class="btn-primary !px-6 !py-3" [disabled]="isSaving">
                {{ isSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address' }}
              </button>
              <button type="button" class="btn-secondary !px-6 !py-3" (click)="cancelForm()">Cancel</button>
            </div>
          </form>
        </div>

        <div *ngIf="loading" class="py-8 text-sm font-semibold text-slate-500">
          Loading addresses...
        </div>

        <div *ngIf="!loading && addresses.length === 0" class="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
          <p class="text-lg font-black text-slate-900">No saved addresses yet</p>
          <p class="mt-2 text-sm font-medium text-slate-500">
            Add your first delivery address to get started.
          </p>
        </div>

        <div *ngIf="addresses.length" class="grid gap-4">
          <article
            *ngFor="let address of addresses; trackBy: trackByAddress"
            class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-3">
                  <h4 class="text-lg font-black text-slate-900">{{ address.fullname }}</h4>
                  <span
                    *ngIf="address.isDefault"
                    class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700"
                  >
                    Default
                  </span>
                </div>

                <div class="space-y-1 text-sm font-medium text-slate-600">
                  <p>{{ address.phone }}</p>
                  <p>{{ address.addressLine1 }}</p>
                  <p *ngIf="address.addressLine2">{{ address.addressLine2 }}</p>
                  <p>{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
                  <p>{{ address.country }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  class="btn-secondary !px-4 !py-2"
                  (click)="startEdit(address)"
                >
                  Edit
                </button>
                <button
                  *ngIf="!address.isDefault"
                  type="button"
                  class="btn-secondary !px-4 !py-2 border-indigo-100 bg-indigo-50/60 text-indigo-700"
                  (click)="setDefault(address)"
                >
                  Make Default
                </button>
                <button
                  type="button"
                  class="btn-secondary !px-4 !py-2 border-rose-100 bg-rose-50/60 text-rose-600"
                  (click)="deleteAddress(address)"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  `
})
export class CustomerAddressBookComponent implements OnInit {
  addresses: CustomerAddress[] = [];
  loading = false;
  isSaving = false;
  showForm = false;
  editingAddressId: string | null = null;
  successMessage = '';
  form: CustomerAddressForm = this.createEmptyForm();
  fullnameError = '';
  phoneError = '';
  postalCodeError = '';

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;

    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.loading = false;
        this.addresses = res?.data || [];
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  startCreate(): void {
    this.showForm = true;
    this.editingAddressId = null;
    this.form = this.createEmptyForm();
    this.successMessage = '';
    this.fullnameError = '';
    this.phoneError = '';
    this.postalCodeError = '';
  }

  startEdit(address: CustomerAddress): void {
    this.showForm = true;
    this.editingAddressId = address._id || null;
    this.form = {
      fullname: address.fullname,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    };
    this.successMessage = '';
    this.fullnameError = '';
    this.phoneError = '';
    this.postalCodeError = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAddressId = null;
    this.form = this.createEmptyForm();
    this.fullnameError = '';
    this.phoneError = '';
    this.postalCodeError = '';
  }

  saveAddress(): void {
    const valid = this.validateFullname(this.form.fullname)
      && this.validatePhone(this.form.phone)
      && this.validatePostalCode(this.form.postalCode);

    if (!valid) {
      return;
    }

    this.isSaving = true;
    this.successMessage = '';

    const request$ = this.editingAddressId
      ? this.addressService.updateAddress(this.editingAddressId, this.form)
      : this.addressService.addAddress(this.form);

    request$.subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = res?.message || 'Address saved successfully.';
        this.cancelForm();
        this.loadAddresses();
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  setDefault(address: CustomerAddress): void {
    if (!address._id) {
      return;
    }

    this.successMessage = '';

    this.addressService.setDefaultAddress(address._id).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Default address updated.';
        this.loadAddresses();
      },
      error: () => {}
    });
  }

  deleteAddress(address: CustomerAddress): void {
    if (!address._id) {
      return;
    }

    const confirmed = window.confirm(`Delete the address for ${address.fullname}?`);
    if (!confirmed) {
      return;
    }

    this.successMessage = '';

    this.addressService.deleteAddress(address._id).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Address deleted successfully.';
        this.loadAddresses();
      },
      error: () => {}
    });
  }

  trackByAddress(_: number, address: CustomerAddress): string {
    return address._id || address.addressLine1;
  }

  validateFullname(value: string): boolean {
    const normalized = String(value || '').trim();
    if (!normalized) {
      this.fullnameError = 'Full name is required.';
      return false;
    }

    const alphabetOnlyName = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    this.fullnameError = alphabetOnlyName.test(normalized)
      ? ''
      : 'Use letters only. Numbers and symbols are not allowed.';
    return !this.fullnameError;
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

  validatePostalCode(value: string): boolean {
    const normalized = String(value || '').trim();
    if (!normalized) {
      this.postalCodeError = 'Postal code is required.';
      return false;
    }

    this.postalCodeError = /^\d+$/.test(normalized)
      ? ''
      : 'Postal code must contain digits only.';
    return !this.postalCodeError;
  }

  private createEmptyForm(): CustomerAddressForm {
    return {
      fullname: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    };
  }
}
