import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3 md:space-y-4">
      <div class="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)] lg:rounded-[2rem]">
        <div *ngIf="offerBadgeText" class="absolute left-0 top-3 z-10">
          <span class="inline-flex bg-[#7a4f35] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
            {{ offerBadgeText }}
          </span>
        </div>
        <img
          [src]="activeImage"
          [alt]="productName"
          class="aspect-[4/3] w-full object-cover"
        />
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3" *ngIf="images.length > 1">
        <button
          *ngFor="let image of images; trackBy: trackByImage"
          type="button"
          class="overflow-hidden rounded-xl border-2 transition md:rounded-2xl"
          [ngClass]="selectedImage === image ? 'border-slate-900' : 'border-transparent'"
          (click)="imageSelected.emit(image)"
        >
          <img [src]="image" alt="Product preview" class="aspect-square w-full object-cover" />
        </button>
      </div>
    </div>
  `
})
export class ProductGalleryComponent {
  @Input() productName = 'Product';
  @Input() activeImage = '';
  @Input() selectedImage = '';
  @Input() images: string[] = [];
  @Input() offerBadgeText = '';

  @Output() imageSelected = new EventEmitter<string>();

  trackByImage(_: number, image: string): string {
    return image;
  }
}
