import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-reviews-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-6 grid gap-6 lg:grid-cols-[170px_1fr]">
      <div class="rounded-[1.75rem] border border-[#f1e4d4] bg-[#fffaf0] px-5 py-6 text-center lg:text-left">
        <p class="text-4xl font-extrabold leading-none text-[#d97706] sm:text-5xl">{{ formattedAverageRating }}</p>
        <div class="mt-2 flex items-center gap-1 text-amber-400">
          <span
            *ngFor="let star of starSlots; trackBy: trackByNumber"
            class="text-sm"
            [class.text-amber-400]="star <= roundedAverageRating"
            [class.text-slate-300]="star > roundedAverageRating"
          >
            ★
          </span>
        </div>
        <p class="mt-2 text-sm font-medium text-slate-500">{{ reviewTotalCount }} reviews</p>
      </div>

      <div class="space-y-3 pt-1">
        <div *ngFor="let row of ratingBreakdown" class="grid grid-cols-[44px_minmax(0,1fr)_28px] items-center gap-2 sm:grid-cols-[52px_1fr_32px] sm:gap-3">
          <p class="text-sm font-medium text-slate-600">{{ row.star }} star</p>
          <div class="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-amber-400 transition-all" [style.width.%]="row.percentage"></div>
          </div>
          <p class="text-right text-sm font-medium text-slate-500">{{ row.count }}</p>
        </div>
      </div>
    </div>
  `
})
export class ProductReviewsSummaryComponent {
  @Input() averageRating = 0;
  @Input() reviewTotalCount = 0;
  @Input() ratingBreakdown: Array<{ star: number; count: number; percentage: number }> = [];
  @Input() starSlots: number[] = [1, 2, 3, 4, 5];

  get formattedAverageRating(): string {
    return Number(this.averageRating || 0).toFixed(1);
  }

  get roundedAverageRating(): number {
    return Math.round(Number(this.averageRating || 0));
  }

  trackByNumber(_: number, value: number): number {
    return value;
  }
}
