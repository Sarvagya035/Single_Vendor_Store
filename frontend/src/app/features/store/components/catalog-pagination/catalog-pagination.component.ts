import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-catalog-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPagination" class="pagination-wrap mt-6">
      <p class="text-sm font-semibold text-slate-500">
        Showing {{ startIndex }}-{{ endIndex }} of {{ totalProductCount }} products
      </p>

      <div class="pagination-nav mt-4">
        <button
          type="button"
          class="pagination-button pagination-button-mobile"
          [disabled]="currentPage === 1"
          (click)="pageChange.emit(currentPage - 1)"
        >
          Prev
        </button>

        <button
          type="button"
          class="pagination-button pagination-button-mobile"
          [disabled]="currentPage === totalPages"
          (click)="pageChange.emit(currentPage + 1)"
        >
          Next
        </button>
      </div>

      <div class="pagination-pages">
        <button
          *ngFor="let page of visiblePages; trackBy: trackByPage"
          type="button"
          class="pagination-button pagination-button-page"
          [class.pagination-button-active]="page === currentPage"
          [class.bg-white]="page !== currentPage"
          [class.text-slate-600]="page !== currentPage"
          [class.border-slate-200]="page !== currentPage"
          (click)="pageChange.emit(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  `
})
export class CatalogPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() visiblePages: number[] = [];
  @Input() totalProductCount = 0;
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() showPagination = false;

  @Output() pageChange = new EventEmitter<number>();

  trackByPage(_: number, page: number): number {
    return page;
  }
}
