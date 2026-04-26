import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductReviewForm } from '../../../../core/models/review.models';

@Component({
  selector: 'app-product-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="mt-6 space-y-4" (ngSubmit)="emitSubmitReview()">
      <div *ngIf="isEditingReview" class="rounded-2xl border border-amber-100 bg-[#fff7ed] px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-700">Edit mode</p>
            <p class="mt-1 text-sm font-semibold text-slate-700">You are updating your existing review.</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700 transition hover:border-amber-300 hover:text-amber-800"
            (click)="emitCancelEdit()"
          >
            Cancel
          </button>
        </div>
      </div>

      <label class="block">
        <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Rating</span>
        <select
          [(ngModel)]="reviewForm.rating"
          name="rating"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <option *ngFor="let star of ratingOptions" [ngValue]="star">{{ star }} / 5</option>
        </select>
      </label>

      <label class="block">
        <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Title</span>
        <input
          [(ngModel)]="reviewForm.title"
          name="title"
          type="text"
          maxlength="120"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
          placeholder="Summarize your experience"
        />
      </label>

      <label class="block">
        <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Review</span>
        <textarea
          [(ngModel)]="reviewForm.commentBody"
          name="commentBody"
          rows="5"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
          placeholder="What stood out? Quality, packaging, delivery, value..."
        ></textarea>
      </label>

      <label class="block">
        <span class="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">Review images</span>
        <input
          #reviewImagesInput
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          (change)="emitImagesSelected($event)"
          class="mt-2 w-full cursor-pointer rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        />
        <p class="mt-2 text-xs font-semibold text-slate-500">
          Upload up to 5 images. JPG, PNG, and WEBP only.
        </p>
        <div *ngIf="reviewImageFiles.length" class="mt-3 flex flex-wrap gap-2">
          <span
            *ngFor="let file of reviewImageFiles; trackBy: trackByReviewFile"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            {{ file.name }}
          </span>
        </div>
        <div *ngIf="reviewForm.reviewImages?.length" class="mt-3 flex flex-wrap gap-2">
          <span
            *ngFor="let image of reviewForm.reviewImages"
            class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
          >
            Existing image
          </span>
        </div>
      </label>

      <button
        type="submit"
        [disabled]="isSubmittingReview || !canSubmit"
        class="btn-primary w-full !py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ isSubmittingReview ? 'Saving Review...' : (isEditingReview ? 'Update Review' : 'Submit Review') }}
      </button>
    </form>
  `
})
export class ProductReviewFormComponent {
  @Input() reviewForm!: ProductReviewForm;
  @Input() reviewImageFiles: File[] = [];
  @Input() isEditingReview = false;
  @Input() isSubmittingReview = false;
  @Input() canSubmit = true;
  @Input() ratingOptions: number[] = [5, 4, 3, 2, 1];

  @Output() submitReview = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() imagesSelected = new EventEmitter<Event>();

  @ViewChild('reviewImagesInput') reviewImagesInput?: ElementRef<HTMLInputElement>;

  emitSubmitReview(): void {
    this.submitReview.emit();
  }

  emitCancelEdit(): void {
    this.cancelEdit.emit();
  }

  emitImagesSelected(event: Event): void {
    this.imagesSelected.emit(event);
  }

  clearReviewImagesInput(): void {
    if (this.reviewImagesInput?.nativeElement) {
      this.reviewImagesInput.nativeElement.value = '';
    }
  }

  trackByReviewFile(_: number, file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }
}
