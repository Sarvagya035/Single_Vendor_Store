import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerAddressBookComponent } from '../customer/address-book/customer-address-book.component';
import { ButtonComponent as AppButtonComponent } from '../../shared/ui/button/button.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerAddressBookComponent, AppButtonComponent],
  template: `
    <section class="storefront-section">
      <div class="store-page store-page-stack">
        <div class="store-page-header">
          <div>
            <p class="app-page-eyebrow text-amber-700">Customer Address Book</p>
            <h1 class="app-page-title !mt-2 !text-[1.9rem] sm:!text-[2.2rem]">My Addresses</h1>
          </div>

          <div class="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <app-button routerLink="/profile" variant="secondary" type="button" buttonClass="w-full justify-center sm:w-auto">Back To Profile</app-button>
            <app-button type="button" variant="primary" buttonClass="w-full justify-center sm:w-auto" (click)="addressBook.startCreate()">
              Add Address
            </app-button>
            <app-button routerLink="/cart" variant="primary" type="button" buttonClass="w-full justify-center sm:w-auto">Go To Cart</app-button>
          </div>

        </div>

        <app-customer-address-book #addressBook />
      </div>
    </section>
  `
})
export class AddressesComponent {}
