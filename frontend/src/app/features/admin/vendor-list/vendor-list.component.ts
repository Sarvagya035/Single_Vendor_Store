import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VendorRecord, VendorTab } from '../../../core/models/admin.models';
import { VendorCardComponent } from '../vendor-card/vendor-card.component';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, VendorCardComponent],
  template: `
    <section class="space-y-5">
      <div *ngIf="vendors.length === 0" class="app-card-soft border-dashed px-8 py-20 text-center">
        <h3 class="mt-6 text-2xl font-black text-slate-900">{{ emptyTitle }}</h3>
        <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
          {{ emptyMessage }}
        </p>
      </div>

      <app-vendor-card
        *ngFor="let vendor of vendors; trackBy: trackByVendorId"
        [vendor]="vendor"
        [mode]="mode"
        [vendorTab]="vendorTab"
        (review)="review.emit($event)"
        (approve)="approve.emit($event)"
        (reject)="reject.emit($event)"
        (delete)="delete.emit($event)"
      />
    </section>
  `
})
export class VendorListComponent {
  @Input({ required: true }) vendors: VendorRecord[] = [];
  @Input({ required: true }) mode!: 'pending' | 'vendors';
  @Input() vendorTab: VendorTab = 'active';
  @Input({ required: true }) emptyTitle!: string;
  @Input({ required: true }) emptyMessage!: string;
  @Output() review = new EventEmitter<VendorRecord>();
  @Output() approve = new EventEmitter<VendorRecord>();
  @Output() reject = new EventEmitter<VendorRecord>();
  @Output() delete = new EventEmitter<VendorRecord>();

  trackByVendorId(_: number, vendor: VendorRecord): string {
    return vendor._id;
  }
}
