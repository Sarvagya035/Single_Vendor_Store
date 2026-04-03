import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
        <img
          [src]="activeImage"
          [alt]="productName"
          class="aspect-[4/3] w-full object-cover"
        />
      </div>

      <div class="grid grid-cols-4 gap-3" *ngIf="images.length > 1">
        <button
          *ngFor="let image of images; let i = index; trackBy: trackByImage"
          type="button"
          class="overflow-hidden rounded-2xl border-2 transition"
          [ngClass]="selectedImage === image ? 'border-slate-900' : 'border-transparent'"
          (click)="imageSelected.emit(image)"
          [attr.aria-label]="'View product image ' + (i + 1)"
          [attr.aria-pressed]="selectedImage === image"
        >
          <img [src]="image" alt="" aria-hidden="true" class="aspect-square w-full object-cover" />
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

  @Output() imageSelected = new EventEmitter<string>();

  trackByImage(_: number, image: string): string {
    return image;
  }
}
