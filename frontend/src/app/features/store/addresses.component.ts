import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerAddressBookComponent } from '../customer/address-book/customer-address-book.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerAddressBookComponent],
  template: `
    <div class="min-h-[calc(100vh-64px)] bg-[linear-gradient(180deg,#fff9f2_0%,#f5e6d3_18%,#fff9f2_100%)]">
      <section class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Customer Address Book</p>
            <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-900">My Addresses</h1>
            <p class="mt-3 text-sm font-medium text-slate-500">
              Add, update, remove, and choose the default address for your orders.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a routerLink="/profile" class="btn-secondary !px-5 !py-3">Back To Profile</a>
            <a routerLink="/cart" class="btn-primary !px-5 !py-3">Go To Cart</a>
          </div>
        </div>

        <app-customer-address-book />
      </section>
    </div>
  `
})
export class AddressesComponent {}
