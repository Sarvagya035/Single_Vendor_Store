import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorProductsPanelComponent } from '../products-panel/vendor-products-panel.component';
import { VendorProductRecord } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-products-page',
  standalone: true,
  imports: [CommonModule, VendorProductsPanelComponent],
  template: `
    <app-vendor-products-panel
      [products]="products"
      [isLoading]="isProductsLoading"
      (refreshRequested)="loadVendorProducts()"
    />
  `
})
export class VendorProductsPageComponent implements OnInit {
  products: VendorProductRecord[] = [];
  isProductsLoading = true;

  constructor(private vendorService: VendorService) {}

  ngOnInit() {
    this.loadVendorProducts();
  }

  loadVendorProducts() {
    this.isProductsLoading = true;
    this.vendorService.getMyProducts().subscribe({
      next: (res) => {
        this.isProductsLoading = false;
        this.products = res?.data?.docs || [];
      },
      error: () => {
        this.isProductsLoading = false;
        this.products = [];
      }
    });
  }
}
