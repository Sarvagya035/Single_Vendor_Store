import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerAddressBookComponent } from '../customer/address-book/customer-address-book.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerAddressBookComponent],
  template: `
    <section class="mt-4 space-y-6 px-4 sm:mt-5 sm:px-6 lg:mt-6 lg:px-8">
      <div class="app-shell-width">
        <div class="vendor-page-shell overflow-hidden">
          <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p class="app-page-eyebrow !text-amber-700">Customer Address Book</p>
                <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">My Addresses</h1>
                <p class="app-page-description !mt-3 !max-w-2xl">
                  Add, update, remove, and choose the default address for your orders.
                </p>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <a routerLink="/profile" class="btn-secondary w-full justify-center !px-5 !py-3 sm:w-auto">Back To Profile</a>
                <a routerLink="/cart" class="btn-primary w-full justify-center !px-5 !py-3 sm:w-auto">Go To Cart</a>
              </div>
            </div>
          </div>

          <app-customer-address-book />
        </div>
      </div>
    </section>
  `
})
export class AddressesComponent {}
