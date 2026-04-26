import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-catalog-active-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="hasActiveFilters"
      type="button"
      class="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-left text-xs font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
      (click)="clearAll.emit()"
    >
      Clear active filters
    </button>

    <div class="flex flex-wrap items-center gap-2">
      <span
        *ngIf="selectedBrand !== 'all'"
        class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
      >
        Brand: {{ selectedBrand }}
        <button type="button" class="ml-2 text-amber-900/80" (click)="removeFilter.emit('selectedBrand')">×</button>
      </span>
      <span
        *ngIf="hasPriceFilter"
        class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
      >
        Price:
        {{ minPrice || '0' }} - {{ maxPrice || 'Any' }}
        <button type="button" class="ml-2 text-amber-900/80" (click)="removeFilter.emit('price')">×</button>
      </span>
      <span
        *ngIf="availabilityFilter !== 'all'"
        class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
      >
        {{ availabilityFilter === 'in-stock' ? 'In stock only' : 'Out of stock only' }}
        <button type="button" class="ml-2 text-amber-900/80" (click)="removeFilter.emit('availabilityFilter')">×</button>
      </span>
      <span
        *ngIf="ratingFilter !== 'all'"
        class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800"
      >
        {{ ratingFilter }}+ rating
        <button type="button" class="ml-2 text-amber-900/80" (click)="removeFilter.emit('ratingFilter')">×</button>
      </span>
    </div>
  `
})
export class CatalogActiveFiltersComponent {
  @Input() hasActiveFilters = false;
  @Input() selectedBrand = 'all';
  @Input() minPrice = '';
  @Input() maxPrice = '';
  @Input() availabilityFilter = 'all';
  @Input() ratingFilter = 'all';

  @Output() removeFilter = new EventEmitter<'selectedBrand' | 'price' | 'availabilityFilter' | 'ratingFilter'>();
  @Output() clearAll = new EventEmitter<void>();

  get hasPriceFilter(): boolean {
    return this.minPrice !== '' || this.maxPrice !== '';
  }
}
