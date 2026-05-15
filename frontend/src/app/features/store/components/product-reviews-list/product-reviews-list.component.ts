import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductReview } from '../../../../core/models/review.models';

@Component({
  selector: 'app-product-reviews-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-8 space-y-6">
      <article
        *ngFor="let review of reviews; trackBy: trackByReview"
        class="border-t border-[#f1e4d4] pt-6 first:border-t-0 first:pt-0"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex items-center gap-1 text-amber-400">
              <span
                *ngFor="let star of starSlots; trackBy: trackByNumber"
                class="text-sm"
                [class.text-amber-400]="isStarFilled(review.rating || 0, star)"
                [class.text-slate-300]="!isStarFilled(review.rating || 0, star)"
              >
                ★
              </span>
            </div>
            <p class="mt-2 text-base font-semibold text-slate-900">{{ review.title || 'Customer review' }}</p>
            <p class="mt-1 text-sm text-slate-600">by {{ reviewAuthor(review) }}</p>
          </div>
          <p class="text-xs font-medium text-slate-500">{{ formatDate(review.updatedAt || review.createdAt) }}</p>
        </div>

        <p class="mt-3 text-sm leading-7 text-slate-700">{{ review.commentBody || 'No review text provided.' }}</p>

        <div *ngIf="review.reviewImages?.length" class="mt-4 flex flex-wrap gap-3">
          <a
            *ngFor="let image of review.reviewImages"
            [href]="image"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 rounded-full border border-[#e7dac9] bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#d4a017] hover:text-slate-900"
          >
            <span class="h-2 w-2 rounded-full bg-[#d4a017]"></span>
            View image
          </a>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
          <button type="button" class="transition hover:text-slate-900">Helpful</button>
          <span *ngIf="isOwnReview(review)" class="text-slate-300">|</span>
          <button
            *ngIf="isOwnReview(review)"
            type="button"
            class="rounded-full border border-[#e7dac9] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700 transition hover:border-[#d4a017] hover:text-slate-900"
            (click)="emitEditReview(review)"
          >
            Edit Review
          </button>
        </div>
      </article>

      <div *ngIf="!reviews.length" class="rounded-[1.5rem] border border-dashed border-[#e7dac9] bg-[#fff7ed] px-6 py-10 text-center">
        <h3 class="text-xl font-extrabold text-slate-900">No reviews yet</h3>
        <p class="mt-3 text-sm font-medium text-slate-500">Be the first customer to share feedback for this product.</p>
      </div>
    </div>
  `
})
export class ProductReviewsListComponent {
  @Input() reviews: ProductReview[] = [];
  @Input() currentUserId = '';
  @Input() starSlots: number[] = [1, 2, 3, 4, 5];

  @Output() editReview = new EventEmitter<ProductReview>();

  emitEditReview(review: ProductReview): void {
    this.editReview.emit(review);
  }

  isOwnReview(review: ProductReview): boolean {
    return !!this.currentUserId && review.user?._id === this.currentUserId;
  }

  isStarFilled(rating: number, star: number): boolean {
    return star <= Math.round(Number(rating || 0));
  }

  reviewAuthor(review: ProductReview): string {
    return review.user?.username || review.user?.email || 'Customer';
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  trackByReview(index: number, review: ProductReview): string {
    return review._id || String(index);
  }

  trackByNumber(_: number, value: number): number {
    return value;
  }
}
