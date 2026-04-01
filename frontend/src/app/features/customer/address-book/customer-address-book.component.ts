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

        <div
          *ngIf="errorMessage"
          class="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {{ errorMessage }}
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
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <label class="space-y-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Phone</span>
              <input
                name="phone"
                [(ngModel)]="form.phone"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
            </label>

            <label class="space-y-2">
              <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Postal Code</span>
              <input
                name="postalCode"
                [(ngModel)]="form.postalCode"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white"
              />
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
  errorMessage = '';
  form: CustomerAddressForm = this.createEmptyForm();

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.loading = false;
        this.addresses = res?.data || [];
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to load addresses.';
      }
    });
  }

  startCreate(): void {
    this.showForm = true;
    this.editingAddressId = null;
    this.form = this.createEmptyForm();
    this.successMessage = '';
    this.errorMessage = '';
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
    this.errorMessage = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAddressId = null;
    this.form = this.createEmptyForm();
  }

  saveAddress(): void {
    this.isSaving = true;
    this.errorMessage = '';
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
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save address.';
      }
    });
  }

  setDefault(address: CustomerAddress): void {
    if (!address._id) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.addressService.setDefaultAddress(address._id).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Default address updated.';
        this.loadAddresses();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update default address.';
      }
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

    this.errorMessage = '';
    this.successMessage = '';

    this.addressService.deleteAddress(address._id).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Address deleted successfully.';
        this.loadAddresses();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete address.';
      }
    });
  }

  trackByAddress(_: number, address: CustomerAddress): string {
    return address._id || address.addressLine1;
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
